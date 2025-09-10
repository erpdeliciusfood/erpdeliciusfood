import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Package, CheckCircle2, AlertTriangle, MinusCircle } from "lucide-react";
import { Menu, AggregatedInsumoNeed } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useAddStockMovement } from "@/hooks/useStockMovements";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DailyPrepOverviewProps {
  selectedDate: Date;
  menus: Menu[];
}

const DailyPrepOverview: React.FC<DailyPrepOverviewProps> = ({ selectedDate, menus }) => {
  const queryClient = useQueryClient();
  const addStockMovementMutation = useAddStockMovement();
  const [isDeductingStock, setIsDeductingStock] = useState(false);

  const aggregatedInsumoNeeds: AggregatedInsumoNeed[] = useMemo(() => {
    const needsMap = new Map<string, AggregatedInsumoNeed>();

    menus.forEach(menu => {
      menu.menu_platos?.forEach(menuPlato => {
        const receta = menuPlato.platos; // Changed plato to receta
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
              };

              currentEntry.total_needed_base_unit += totalNeededBaseUnit;
              currentEntry.total_needed_purchase_unit += totalNeededPurchaseUnit;
              needsMap.set(insumo.id, currentEntry);
            }
          });
        }
      });
    });

    return Array.from(needsMap.values()).map(entry => ({
      ...entry,
      total_needed_base_unit: parseFloat(entry.total_needed_base_unit.toFixed(2)),
      total_needed_purchase_unit: parseFloat(entry.total_needed_purchase_unit.toFixed(2)),
    })).sort((a, b) => a.insumo_nombre.localeCompare(b.insumo_nombre));
  }, [menus]);

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
            menu_id: menus[0]?.id || null, // Associate with the first menu found for the day, or null
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
    // Invalidate queries to refetch latest stock and menu data
    queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
    queryClient.invalidateQueries({ queryKey: ["insumos"] });
    queryClient.invalidateQueries({ queryKey: ["menus"] });
  };

  const allStockSufficient = aggregatedInsumoNeeds.every(
    (need) => need.current_stock_quantity >= need.total_needed_purchase_unit
  );

  const formattedDate = format(selectedDate, "PPP", { locale: es });

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Necesidades de Insumos para el {formattedDate}
        </CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isDeductingStock || aggregatedInsumoNeeds.length === 0 || !allStockSufficient}
              className="px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              {isDeductingStock && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
              <MinusCircle className="mr-3 h-6 w-6" />
              Deducir Stock para Preparación
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">¿Confirmar Deducción de Stock?</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300">
                Estás a punto de deducir el stock de los insumos necesarios para la preparación diaria del {formattedDate}.
                Esta acción registrará movimientos de salida en tu inventario.
                <br/><span className="font-semibold text-red-600 dark:text-red-400">¿Estás seguro de que deseas continuar?</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
              <AlertDialogCancel className="w-full sm:w-auto px-6 py-3 text-lg">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeductStock}
                className="w-full sm:w-auto px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out"
              >
                {isDeductingStock && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Confirmar Deducción
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        {aggregatedInsumoNeeds.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
                  <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Stock Actual</TableHead>
                  <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Necesidad (Unidad Compra)</TableHead>
                  <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregatedInsumoNeeds.map((need) => {
                  const isSufficient = need.current_stock_quantity >= need.total_needed_purchase_unit;
                  return (
                    <TableRow key={need.insumo_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{need.insumo_nombre}</TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                        {need.current_stock_quantity.toFixed(2)} {need.purchase_unit}
                      </TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                        {need.total_needed_purchase_unit.toFixed(2)} {need.purchase_unit}
                      </TableCell>
                      <TableCell className="text-center">
                        {isSufficient ? (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Suficiente
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
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
            <Package className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No se encontraron necesidades de insumos para los menús de este día.</p>
            <p className="text-md mt-2">Asegúrate de que los menús seleccionados contengan recetas con insumos definidos.</p> {/* Changed text */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyPrepOverview;