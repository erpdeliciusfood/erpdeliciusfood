import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Package, CheckCircle2, AlertTriangle, MinusCircle, Utensils, PackageX, Info } from "lucide-react";
import { Menu, AggregatedInsumoNeed } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useAddStockMovement } from "@/hooks/useStockMovements";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ColoredProgress } from "@/components/ui/colored-progress";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // NEW: Import Select components

interface DailyPrepOverviewProps {
  selectedDate: Date;
  menus: Menu[];
}

const DailyPrepOverview: React.FC<DailyPrepOverviewProps> = ({ selectedDate, menus }) => {
  const queryClient = useQueryClient();
  const addStockMovementMutation = useAddStockMovement();
  const [isDeductingStock, setIsDeductingStock] = useState(false);
  const [stockFilter, setStockFilter] = useState<'all' | 'sufficient' | 'insufficient'>('all'); // NEW: State for stock filter

  const aggregatedInsumoNeeds: AggregatedInsumoNeed[] = useMemo(() => {
    const needsMap = new Map<string, AggregatedInsumoNeed>();

    menus.forEach(menu => {
      menu.menu_platos?.forEach(menuPlato => {
        const receta = menuPlato.platos;
        if (receta) {
          receta.plato_insumos?.forEach(platoInsumo => {
            const insumo = platoInsumo.insumos;
            if (insumo) {
              const totalNeededBaseUnit = platoInsumo.cantidad_necesaria * menuPlato.quantity_needed;
              const totalNeededPurchaseUnit = totalNeededBaseUnit / insumo.conversion_factor;

              const currentEntry = needsMap.get(insumo.id) || {
                insumo_id: insumo.id,
                insumo_nombre: insumo.nombre,
                base_unit: insumo.base_unit,
                purchase_unit: insumo.purchase_unit,
                conversion_factor: insumo.conversion_factor,
                current_stock_quantity: insumo.stock_quantity,
                total_needed_base_unit: 0,
                total_needed_purchase_unit: 0,
                missing_quantity: 0,
              };

              currentEntry.total_needed_base_unit += totalNeededBaseUnit;
              currentEntry.total_needed_purchase_unit += totalNeededPurchaseUnit;
              needsMap.set(insumo.id, currentEntry);
            }
          });
        }
      });
    });

    const allNeeds = Array.from(needsMap.values()).map(entry => {
      const missing = Math.max(0, entry.total_needed_purchase_unit - entry.current_stock_quantity);
      return {
        ...entry,
        total_needed_base_unit: parseFloat(entry.total_needed_base_unit.toFixed(2)),
        total_needed_purchase_unit: parseFloat(entry.total_needed_purchase_unit.toFixed(2)),
        missing_quantity: parseFloat(missing.toFixed(2)),
      };
    }).sort((a, b) => a.insumo_nombre.localeCompare(b.insumo_nombre));

    // Apply filter
    if (stockFilter === 'sufficient') {
      return allNeeds.filter(need => need.current_stock_quantity >= need.total_needed_purchase_unit);
    } else if (stockFilter === 'insufficient') {
      return allNeeds.filter(need => need.current_stock_quantity < need.total_needed_purchase_unit);
    }
    return allNeeds;
  }, [menus, stockFilter]); // NEW: Add stockFilter to dependencies

  const handleDeductStock = async () => {
    setIsDeductingStock(true);
    const deductToastId = showLoading("Deduciendo insumos para la preparación diaria...");
    let successfulDeductions = 0;
    let failedDeductions = 0;

    for (const need of aggregatedInsumoNeeds) {
      if (need.total_needed_purchase_unit > 0) {
        try {
          await addStockMovementMutation.mutateAsync({
            insumo_id: need.insumo_id,
            movement_type: 'daily_prep_out',
            quantity_change: need.total_needed_purchase_unit,
            notes: `Salida por preparación diaria para el menú del ${format(selectedDate, "PPP", { locale: es })}`,
            menu_id: menus[0]?.id || null,
          });
          successfulDeductions++;
        } catch (error: any) {
          failedDeductions++;
          showError(`Error al deducir ${need.insumo_nombre}: ${error.message}`);
        }
      }
    }

    dismissToast(deductToastId);
    if (successfulDeductions > 0) {
      showSuccess(`Se dedujeron ${successfulDeductions} insumos exitosamente para la preparación diaria.`);
    }
    if (failedDeductions > 0) {
      showError(`Fallaron ${failedDeductions} deducciones de insumos.`);
    }

    setIsDeductingStock(false);
    queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
    queryClient.invalidateQueries({ queryKey: ["insumos"] });
    queryClient.invalidateQueries({ queryKey: ["menus"] });
  };

  const allStockSufficient = aggregatedInsumoNeeds.every(
    (need) => need.current_stock_quantity >= need.total_needed_purchase_unit
  );

  const insufficientStockCount = aggregatedInsumoNeeds.filter(
    (need) => need.current_stock_quantity < need.total_needed_purchase_unit
  ).length;

  const formattedDate = format(selectedDate, "PPP", { locale: es });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300">Menús del Día</CardTitle>
            <Utensils className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{menus.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Menús planificados para hoy</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300">Insumos Únicos Necesarios</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{aggregatedInsumoNeeds.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Tipos de insumos requeridos</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300">Insumos con Stock Insuficiente</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${insufficientStockCount > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
              {insufficientStockCount}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Necesidades de Insumos para el {formattedDate}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select onValueChange={(value: 'all' | 'sufficient' | 'insufficient') => setStockFilter(value)} value={stockFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 text-base">
                <SelectValue placeholder="Filtrar por stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sufficient">Suficiente</SelectItem>
                <SelectItem value="insufficient">Insuficiente</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={isDeductingStock || aggregatedInsumoNeeds.length === 0 || !allStockSufficient}
                    className="px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
                  >
                    {isDeductingStock && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                    <MinusCircle className="mr-3 h-6 w-6" />
                    Deducir Stock para Preparación
                  </Button>
                </TooltipTrigger>
                {!allStockSufficient && (
                  <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                    <p>No se puede deducir el stock porque hay insumos con cantidades insuficientes.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {aggregatedInsumoNeeds.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Stock Actual</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Necesidad</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Faltante</TableHead>
                    <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregatedInsumoNeeds.map((need) => {
                    const isSufficient = need.current_stock_quantity >= need.total_needed_purchase_unit;
                    const progressValue = need.total_needed_purchase_unit > 0
                      ? Math.min(100, (need.current_stock_quantity / need.total_needed_purchase_unit) * 100)
                      : 100;
                    const progressColor = isSufficient ? "bg-green-500" : "bg-red-500";

                    return (
                      <TableRow
                        key={need.insumo_id}
                        className={cn(
                          "border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out",
                          !isSufficient && "bg-red-50/50 dark:bg-red-900/20"
                        )}
                      >
                        <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{need.insumo_nombre}</TableCell>
                        <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold">{need.current_stock_quantity.toFixed(2)} {need.purchase_unit}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <ColoredProgress
                                    value={progressValue}
                                    className="w-24 h-2 mt-1 cursor-help"
                                    indicatorColorClass={progressColor}
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                                  <p>{progressValue.toFixed(0)}% Cubierto</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center cursor-help">
                                  {need.total_needed_purchase_unit.toFixed(2)} {need.purchase_unit}
                                  <Info className="ml-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                                <p>Cantidad en unidad base: {need.total_needed_base_unit.toFixed(2)} {need.base_unit}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right text-base">
                          {need.missing_quantity > 0 ? (
                            <Badge variant="destructive" className="text-base px-2 py-1">
                              {need.missing_quantity.toFixed(2)} {need.purchase_unit}
                            </Badge>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">0 {need.purchase_unit}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isSufficient ? (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white text-base px-3 py-1">
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Suficiente
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-base px-3 py-1">
                              <AlertTriangle className="h-4 w-4 mr-1" /> Insuficiente
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {!allStockSufficient && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p className="text-base font-medium">
                    Algunos insumos tienen stock insuficiente. No se puede deducir el stock hasta que todas las necesidades estén cubiertas.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-600 dark:text-gray-400">
              <PackageX className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
              <p className="text-lg">No se encontraron necesidades de insumos para los menús de este día.</p>
              <p className="text-md mt-2">Asegúrate de que los menús seleccionados contengan recetas con insumos definidos.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyPrepOverview;