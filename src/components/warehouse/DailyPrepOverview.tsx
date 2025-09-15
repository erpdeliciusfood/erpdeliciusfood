"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, CheckCircle2, AlertTriangle, MinusCircle, Utensils, PackageX, Info, ShoppingBag } from "lucide-react";
import { AggregatedInsumoNeed, GroupedInsumoNeeds, MenuPlatoWithRelations, PlatoInsumoWithRelations, MenuWithRelations, InsumoDeductionItem } from "@/types"; // NEW: Import InsumoDeductionItem
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { showError } from "@/utils/toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ColoredProgress } from "@/components/ui/colored-progress";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import DeductQuantitiesDialog from "./DeductQuantitiesDialog";
import { Dialog } from "@/components/ui/dialog";
import UrgentPurchaseRequestDialog from "./UrgentPurchaseRequestDialog";

interface DailyPrepOverviewProps {
  selectedDate: Date;
  menus: MenuWithRelations[];
}

const DailyPrepOverview: React.FC<DailyPrepOverviewProps> = ({ selectedDate, menus }) => {
  const [stockFilter, setStockFilter] = useState<'all' | 'sufficient' | 'insufficient'>('all');
  const [selectedDeductionItemIds, setSelectedDeductionItemIds] = useState<Set<string>>(new Set()); // MODIFIED: Use selectedDeductionItemIds
  const [isDeductQuantitiesDialogOpen, setIsDeductQuantitiesDialogOpen] = useState(false);
  const [isUrgentPurchaseRequestDialogOpen, setIsUrgentPurchaseRequestDialogOpen] = useState(false);
  const [selectedInsumoForUrgentRequest, setSelectedInsumoForUrgentRequest] = useState<AggregatedInsumoNeed | null>(null);

  const allDeductionItems: InsumoDeductionItem[] = useMemo(() => { // NEW: Generate a flat list of granular deduction items
    const items: InsumoDeductionItem[] = [];

    menus.forEach((menu: MenuWithRelations) => {
      menu.menu_platos?.forEach((menuPlato: MenuPlatoWithRelations) => {
        const mealServiceId = menuPlato.meal_service_id;
        const mealServiceName = menuPlato.meal_services?.name || "Sin Servicio";
        const platoId = menuPlato.plato_id;
        const platoNombre = menuPlato.platos?.nombre || "Receta Desconocida";
        const menuTitle = menu.title;
        const menuDate = menu.menu_date;

        if (!mealServiceId || !platoId) {
          console.warn(`menuPlato with ID ${menuPlato.id} is missing meal_service_id or plato_id.`);
          return;
        }

        menuPlato.platos?.plato_insumos?.forEach((platoInsumo: PlatoInsumoWithRelations) => {
          const insumo = platoInsumo.insumos;
          if (!insumo) return;

          const totalNeededBaseUnit = platoInsumo.cantidad_necesaria * menuPlato.quantity_needed;
          const totalNeededPurchaseUnit = totalNeededBaseUnit / insumo.conversion_factor;

          // Create a unique ID for each specific insumo-plato-service-menu combination
          const unique_id = `${insumo.id}-${platoId}-${mealServiceId}-${menu.id}`;

          items.push({
            unique_id: unique_id,
            insumo_id: insumo.id,
            insumo_nombre: insumo.nombre,
            base_unit: insumo.base_unit,
            purchase_unit: insumo.purchase_unit,
            conversion_factor: insumo.conversion_factor,
            current_stock_quantity: insumo.stock_quantity,
            total_needed_base_unit_for_item: parseFloat(totalNeededBaseUnit.toFixed(2)),
            total_needed_purchase_unit_for_item: parseFloat(totalNeededPurchaseUnit.toFixed(2)),
            plato_id: platoId,
            plato_nombre: platoNombre,
            meal_service_id: mealServiceId,
            meal_service_name: mealServiceName,
            menu_id: menu.id,
            menu_title: menuTitle,
            menu_date: menuDate,
          });
        });
      });
    });

    return items.sort((a, b) => a.insumo_nombre.localeCompare(b.insumo_nombre));
  }, [menus]);

  // Group `InsumoDeductionItem`s for display in the table, but keep them granular for selection
  const groupedForDisplay: GroupedInsumoNeeds[] = useMemo(() => {
    const serviceGroupsMap = new Map<string, GroupedInsumoNeeds>();

    allDeductionItems.forEach((item: InsumoDeductionItem) => {
      const mealServiceId = item.meal_service_id;
      const mealServiceName = item.meal_service_name;

      if (!serviceGroupsMap.has(mealServiceId)) {
        serviceGroupsMap.set(mealServiceId, {
          meal_service_id: mealServiceId,
          meal_service_name: mealServiceName,
          insumos: [], // This will store AggregatedInsumoNeed for display purposes
        });
      }

      const currentServiceGroup = serviceGroupsMap.get(mealServiceId)!;
      const insumoNeedsMapForService = new Map<string, AggregatedInsumoNeed>();
      currentServiceGroup.insumos.forEach((insumo: AggregatedInsumoNeed) => insumoNeedsMapForService.set(insumo.insumo_id, insumo));

      // Aggregate quantities for display purposes (e.g., total need for an insumo across all recipes in a service)
      const currentAggregatedEntry: AggregatedInsumoNeed = insumoNeedsMapForService.get(item.insumo_id) || {
        insumo_id: item.insumo_id,
        insumo_nombre: item.insumo_nombre,
        base_unit: item.base_unit,
        purchase_unit: item.purchase_unit,
        conversion_factor: item.conversion_factor,
        current_stock_quantity: item.current_stock_quantity,
        total_needed_base_unit: 0,
        total_needed_purchase_unit: 0,
        missing_quantity: 0,
        meal_service_id: item.meal_service_id,
        meal_service_name: item.meal_service_name,
      };

      currentAggregatedEntry.total_needed_base_unit += item.total_needed_base_unit_for_item;
      currentAggregatedEntry.total_needed_purchase_unit += item.total_needed_purchase_unit_for_item;
      insumoNeedsMapForService.set(item.insumo_id, currentAggregatedEntry);

      currentServiceGroup.insumos = Array.from(insumoNeedsMapForService.values()).map((entry: AggregatedInsumoNeed) => {
        const missing = Math.max(0, entry.total_needed_purchase_unit - entry.current_stock_quantity);
        return {
          ...entry,
          total_needed_base_unit: parseFloat(entry.total_needed_base_unit.toFixed(2)),
          total_needed_purchase_unit: parseFloat(entry.total_needed_purchase_unit.toFixed(2)),
          missing_quantity: parseFloat(missing.toFixed(2)),
        };
      }).sort((a: AggregatedInsumoNeed, b: AggregatedInsumoNeed) => a.insumo_nombre.localeCompare(b.insumo_nombre));
    });

    const allGroupedNeeds = Array.from(serviceGroupsMap.values()).sort((a: GroupedInsumoNeeds, b: GroupedInsumoNeeds) => a.meal_service_name.localeCompare(b.meal_service_name));

    const filteredGroupedNeeds = allGroupedNeeds.map((group: GroupedInsumoNeeds) => ({
      ...group,
      insumos: group.insumos.filter((need: AggregatedInsumoNeed) => {
        if (stockFilter === 'sufficient') {
          return need.current_stock_quantity >= need.total_needed_purchase_unit;
        } else if (stockFilter === 'insufficient') {
          return need.current_stock_quantity < need.total_needed_purchase_unit;
        }
        return true;
      })
    })).filter((group: GroupedInsumoNeeds) => group.insumos.length > 0);

    return filteredGroupedNeeds;
  }, [allDeductionItems, stockFilter]);


  // Removed unused function: handleCheckboxChange

  const handleOpenDeductQuantitiesDialog = () => {
    const selectedItems = allDeductionItems.filter(
      (item: InsumoDeductionItem) => selectedDeductionItemIds.has(item.unique_id)
    );

    const itemsWithInsufficientStock = selectedItems.filter(
      (item: InsumoDeductionItem) => item.current_stock_quantity < item.total_needed_purchase_unit_for_item
    );

    if (selectedItems.length === 0) {
      showError("No se puede deducir el stock. Asegúrate de seleccionar al menos un insumo.");
      return;
    }

    if (itemsWithInsufficientStock.length > 0) {
      showError("No se puede deducir el stock. Hay insumos seleccionados con cantidades insuficientes.");
      return;
    }
    setIsDeductQuantitiesDialogOpen(true);
  };

  const handleCloseDeductQuantitiesDialog = () => {
    setIsDeductQuantitiesDialogOpen(false);
    setSelectedDeductionItemIds(new Set());
  };

  const handleOpenUrgentPurchaseRequestDialog = (insumoNeed: AggregatedInsumoNeed) => {
    // For urgent requests, we still use the aggregated view for simplicity
    setSelectedInsumoForUrgentRequest(insumoNeed);
    setIsUrgentPurchaseRequestDialogOpen(true);
  };

  const handleCloseUrgentPurchaseRequestDialog = () => {
    setIsUrgentPurchaseRequestDialogOpen(false);
    setSelectedInsumoForUrgentRequest(null);
  };

  const insufficientStockCount = allDeductionItems.filter(
    (item: InsumoDeductionItem) => item.current_stock_quantity < item.total_needed_purchase_unit_for_item
  ).length;

  const formattedDate = format(selectedDate, "PPP", { locale: es });

  const isDeductButtonDisabled =
    selectedDeductionItemIds.size === 0 ||
    allDeductionItems.filter((item: InsumoDeductionItem) => selectedDeductionItemIds.has(item.unique_id) && item.current_stock_quantity < item.total_needed_purchase_unit_for_item).length > 0;

  const selectedInsumosForDialog = allDeductionItems.filter((item: InsumoDeductionItem) => selectedDeductionItemIds.has(item.unique_id)); // MODIFIED: Pass InsumoDeductionItem[]

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
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{allDeductionItems.length}</div>
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
                    onClick={handleOpenDeductQuantitiesDialog}
                    disabled={isDeductButtonDisabled}
                    className="px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
                  >
                    <MinusCircle className="mr-3 h-6 w-6" />
                    Deducir Stock para Preparación
                  </Button>
                </TooltipTrigger>
                {isDeductButtonDisabled && selectedDeductionItemIds.size === 0 && (
                  <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                    <p>Selecciona al menos un insumo para deducir.</p>
                  </TooltipContent>
                )}
                {isDeductButtonDisabled && allDeductionItems.filter((item: InsumoDeductionItem) => selectedDeductionItemIds.has(item.unique_id) && item.current_stock_quantity < item.total_needed_purchase_unit_for_item).length > 0 && (
                  <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                    <p>No se puede deducir el stock porque hay insumos seleccionados con cantidades insuficientes.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {groupedForDisplay.length > 0 ? (
            <div className="space-y-8">
              {groupedForDisplay.map((group: GroupedInsumoNeeds) => (
                <div key={group.meal_service_id} className="border rounded-lg shadow-sm dark:border-gray-700">
                  <h3 className="text-xl font-semibold p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-700 rounded-t-lg flex items-center">
                    <Utensils className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
                    {group.meal_service_name}
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px] text-center py-4 px-6">
                            <Checkbox
                              checked={group.insumos.every((need: AggregatedInsumoNeed) =>
                                allDeductionItems.filter(item => item.insumo_id === need.insumo_id && item.meal_service_id === need.meal_service_id)
                                  .every(item => selectedDeductionItemIds.has(item.unique_id))
                              )}
                              onCheckedChange={(checked: boolean) => {
                                const newSelected = new Set(selectedDeductionItemIds);
                                group.insumos.forEach((need: AggregatedInsumoNeed) => {
                                  allDeductionItems.filter(item => item.insumo_id === need.insumo_id && item.meal_service_id === need.meal_service_id)
                                    .forEach(item => {
                                      if (checked) {
                                        newSelected.add(item.unique_id);
                                      } else {
                                        newSelected.delete(item.unique_id);
                                      }
                                    });
                                });
                                setSelectedDeductionItemIds(newSelected);
                              }}
                              disabled={group.insumos.filter((need: AggregatedInsumoNeed) => need.total_needed_purchase_unit > 0).length === 0}
                            />
                          </TableHead>
                          <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Insumo</TableHead>
                          <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Stock Actual</TableHead>
                          <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Necesidad</TableHead>
                          <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Faltante</TableHead>
                          <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Estado</TableHead>
                          <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.insumos.map((need: AggregatedInsumoNeed) => {
                          const isSufficient = need.current_stock_quantity >= need.total_needed_purchase_unit;
                          const progressValue = need.total_needed_purchase_unit > 0
                            ? Math.min(100, (need.current_stock_quantity / need.total_needed_purchase_unit) * 100)
                            : 100;
                          const progressColor = isSufficient ? "bg-green-500" : "bg-red-500";

                          // Check if all granular items for this aggregated need are selected
                          const allGranularItemsForThisNeed = allDeductionItems.filter(item => item.insumo_id === need.insumo_id && item.meal_service_id === need.meal_service_id);
                          const isAggregatedSelected = allGranularItemsForThisNeed.length > 0 && allGranularItemsForThisNeed.every(item => selectedDeductionItemIds.has(item.unique_id));


                          return (
                            <TableRow
                              key={need.insumo_id}
                              className={cn(
                                "border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out",
                                !isSufficient && "bg-red-50/50 dark:bg-red-900/20"
                              )}
                            >
                              <TableCell className="text-center py-3 px-6">
                                <Checkbox
                                  checked={isAggregatedSelected}
                                  onCheckedChange={(checked: boolean) => {
                                    const newSelected = new Set(selectedDeductionItemIds);
                                    allGranularItemsForThisNeed.forEach(item => {
                                      if (checked) {
                                        newSelected.add(item.unique_id);
                                      } else {
                                        newSelected.delete(item.unique_id);
                                      }
                                    });
                                    setSelectedDeductionItemIds(newSelected);
                                  }}
                                  disabled={need.total_needed_purchase_unit === 0}
                                />
                              </TableCell>
                              <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left min-w-[180px]">{need.insumo_nombre}</TableCell>
                              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[150px]">
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
                              <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[150px]">
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
                              <TableCell className="text-right text-base py-3 px-6 min-w-[120px]">
                                {need.missing_quantity > 0 ? (
                                  <Badge variant="destructive" className="text-base px-2 py-1">
                                    {need.missing_quantity.toFixed(2)} {need.purchase_unit}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">0 {need.purchase_unit}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center py-3 px-6 min-w-[150px]">
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
                              <TableCell className="text-center py-3 px-6 min-w-[150px]">
                                {!isSufficient && need.missing_quantity > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenUrgentPurchaseRequestDialog(need)}
                                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 ease-in-out"
                                  >
                                    <ShoppingBag className="mr-1 h-4 w-4" />
                                    Solicitar Urgente
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
              {allDeductionItems.filter((item: InsumoDeductionItem) => selectedDeductionItemIds.has(item.unique_id) && item.current_stock_quantity < item.total_needed_purchase_unit_for_item).length > 0 && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p className="text-base font-medium">
                    Algunos insumos seleccionados tienen stock insuficiente. No se puede deducir el stock hasta que todas las necesidades estén cubiertas.
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

      <Dialog open={isDeductQuantitiesDialogOpen} onOpenChange={setIsDeductQuantitiesDialogOpen}>
        <DeductQuantitiesDialog
          selectedDeductionItems={selectedInsumosForDialog} // MODIFIED: Pass selectedDeductionItems
          selectedDate={selectedDate}
          menuId={menus[0]?.id || null}
          onClose={handleCloseDeductQuantitiesDialog}
        />
      </Dialog>

      <Dialog open={isUrgentPurchaseRequestDialogOpen} onOpenChange={setIsUrgentPurchaseRequestDialogOpen}>
        {selectedInsumoForUrgentRequest && (
          <UrgentPurchaseRequestDialog
            insumoNeed={selectedInsumoForUrgentRequest}
            onClose={handleCloseUrgentPurchaseRequestDialog}
          />
        )}
      </Dialog>
    </div>
  );
};

export default DailyPrepOverview;