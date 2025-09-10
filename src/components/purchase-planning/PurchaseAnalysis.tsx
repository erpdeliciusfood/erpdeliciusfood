import React, { useMemo, useState } from "react";
import { useMenus } from "@/hooks/useMenus";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2, ShoppingBag, DollarSign, Info, Building2 } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Insumo, InsumoNeeded } from "@/types"; // Import InsumoNeeded
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InsumoSupplierDetailsDialog from "@/components/insumos/InsumoSupplierDetailsDialog";
import SuggestedPurchaseListContent from "@/components/purchase-planning/SuggestedPurchaseListContent";

interface PurchaseAnalysisProps {
  startDate: Date;
  endDate: Date;
}

const PurchaseAnalysis: React.FC<PurchaseAnalysisProps> = ({ startDate, endDate }) => {
  const { data: menus, isLoading: isLoadingMenus, isError: isErrorMenus, error: errorMenus } = useMenus();
  const { data: allInsumos, isLoading: isLoadingInsumos, isError: isErrorInsumos, error: errorInsumos } = useInsumos();

  const [isSupplierDetailsDialogOpen, setIsSupplierDetailsDialogOpen] = useState(false);
  const [selectedInsumoForDetails, setSelectedInsumoForDetails] = useState<Insumo | null>(null);
  const [isSuggestedPurchaseListOpen, setIsSuggestedPurchaseListOpen] = useState(false); // New state for suggested purchase list dialog

  const isLoading = isLoadingMenus || isLoadingInsumos;
  const isError = isErrorMenus || isErrorInsumos;
  const error = errorMenus || errorInsumos;

  const { insumosForPurchase, totalEstimatedPurchaseCost } = useMemo(() => {
    if (isLoading || isError || !menus || !allInsumos) {
      return { insumosForPurchase: [], totalEstimatedPurchaseCost: 0 };
    }

    const insumoNeedsMap = new Map<string, number>(); // Map<insumoId, totalQuantityNeeded in purchase_unit>

    menus.forEach(menu => {
      const menuDate = menu.menu_date ? parseISO(menu.menu_date) : null;
      const isMenuInDateRange = menuDate && isWithinInterval(menuDate, { start: startDate, end: endDate });

      if (isMenuInDateRange || (menu.event_type_id && menu.menu_date === null)) { // Consider event menus always if no specific date, or if daily menu is in range
        menu.menu_platos?.forEach(menuPlato => {
          const plato = menuPlato.platos;
          if (plato) {
            plato.plato_insumos?.forEach(platoInsumo => {
              const insumo = platoInsumo.insumos;
              if (insumo) {
                // Calculate total needed in base_unit, then convert to purchase_unit
                const totalNeededBaseUnit = (platoInsumo.cantidad_necesaria * menuPlato.quantity_needed);
                const totalNeededPurchaseUnit = totalNeededBaseUnit / insumo.conversion_factor;
                insumoNeedsMap.set(insumo.id, (insumoNeedsMap.get(insumo.id) || 0) + totalNeededPurchaseUnit);
              }
            });
          }
        });
      }
    });

    let overallEstimatedCost = 0;
    const result: InsumoNeeded[] = [];
    allInsumos.forEach(insumo => {
      const quantityNeededForPeriodRaw = insumoNeedsMap.get(insumo.id) || 0;
      const currentStock = insumo.stock_quantity; // stock_quantity is already in purchase_unit

      // Rounding for quantity_needed_for_period
      const quantityNeededForPeriodRounded = quantityNeededForPeriodRaw > 0 && quantityNeededForPeriodRaw % 1 !== 0
        ? Math.ceil(quantityNeededForPeriodRaw)
        : parseFloat(quantityNeededForPeriodRaw.toFixed(2)); // Keep 2 decimals if already whole or 0
      const quantityNeededForPeriodRoundedUp = quantityNeededForPeriodRaw > 0 && quantityNeededForPeriodRaw % 1 !== 0;

      const purchaseSuggestionRaw = Math.max(0, quantityNeededForPeriodRaw - currentStock);

      // Rounding for purchase_suggestion
      const purchaseSuggestionRounded = purchaseSuggestionRaw > 0 && purchaseSuggestionRaw % 1 !== 0
        ? Math.ceil(purchaseSuggestionRaw)
        : parseFloat(purchaseSuggestionRaw.toFixed(2)); // Keep 2 decimals if already whole or 0
      const purchaseSuggestionRoundedUp = purchaseSuggestionRaw > 0 && purchaseSuggestionRaw % 1 !== 0;

      const estimatedPurchaseCost = purchaseSuggestionRounded * insumo.costo_unitario; // Use rounded suggestion for cost calculation

      if (quantityNeededForPeriodRaw > 0 || currentStock < insumo.min_stock_level) { // Show if needed or if stock is below min_stock_level
        result.push({
          ...insumo,
          quantity_needed_for_period_raw: parseFloat(quantityNeededForPeriodRaw.toFixed(2)),
          quantity_needed_for_period_rounded: quantityNeededForPeriodRounded,
          quantity_needed_for_period_rounded_up: quantityNeededForPeriodRoundedUp,
          current_stock: parseFloat(currentStock.toFixed(2)),
          purchase_suggestion_raw: parseFloat(purchaseSuggestionRaw.toFixed(2)),
          purchase_suggestion_rounded: purchaseSuggestionRounded,
          purchase_suggestion_rounded_up: purchaseSuggestionRoundedUp,
          estimated_purchase_cost: parseFloat(estimatedPurchaseCost.toFixed(2)),
        });
        overallEstimatedCost += estimatedPurchaseCost;
      }
    });

    return {
      insumosForPurchase: result.sort((a, b) => b.purchase_suggestion_rounded - a.purchase_suggestion_rounded), // Sort by highest purchase suggestion (rounded)
      totalEstimatedPurchaseCost: parseFloat(overallEstimatedCost.toFixed(2)),
    };
  }, [menus, allInsumos, startDate, endDate, isLoading, isError]);

  const handleOpenSupplierDetails = (insumo: Insumo) => {
    setSelectedInsumoForDetails(insumo);
    setIsSupplierDetailsDialogOpen(true);
  };

  const handleCloseSupplierDetails = () => {
    setIsSupplierDetailsDialogOpen(false);
    setSelectedInsumoForDetails(null);
  };

  const handleCloseSuggestedPurchaseList = () => {
    setIsSuggestedPurchaseListOpen(false);
    // Optionally, refetch data for PurchaseAnalysis if needed after purchases are made
    // queryClient.invalidateQueries({ queryKey: ["menus"] });
    // queryClient.invalidateQueries({ queryKey: ["insumos"] });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Analizando necesidades de insumos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        <h1 className="text-2xl font-bold mb-4">Error al cargar datos</h1>
        <p className="text-lg">No se pudieron cargar los datos necesarios para la planificación: {error?.message}</p>
      </div>
    );
  }

  const formattedStartDate = format(startDate, "PPP", { locale: es });
  const formattedEndDate = format(endDate, "PPP", { locale: es });

  return (
    <div className="space-y-8">
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Costo Total Estimado de Compras
          </CardTitle>
          <DollarSign className="h-8 w-8 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-extrabold text-green-700 dark:text-green-400">
            S/ {totalEstimatedPurchaseCost.toFixed(2)}
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
            Costo estimado para cubrir las necesidades de insumos en el período seleccionado.
          </p>
        </CardContent>
      </Card>

      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Análisis de Compras ({formattedStartDate} - {formattedEndDate})
          </CardTitle>
          <Dialog open={isSuggestedPurchaseListOpen} onOpenChange={setIsSuggestedPurchaseListOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="px-4 py-2 text-base bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 ease-in-out"
                disabled={insumosForPurchase.filter(i => i.purchase_suggestion_rounded > 0).length === 0}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Ver Sugerencias de Compra ({insumosForPurchase.filter(i => i.purchase_suggestion_rounded > 0).length})
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Lista de Compras Sugeridas
                </DialogTitle>
              </DialogHeader>
              <SuggestedPurchaseListContent
                suggestedPurchases={insumosForPurchase.filter(i => i.purchase_suggestion_rounded > 0)}
                onClose={handleCloseSuggestedPurchaseList}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {insumosForPurchase.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
                    <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Unidad Compra</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Costo Unitario (S/)</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Stock Actual</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Necesidad Periodo</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Sugerencia Compra</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Costo Estimado (S/)</TableHead>
                    <TableHead className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200">Proveedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insumosForPurchase.map((insumo) => (
                    <TableRow key={insumo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{insumo.nombre}</TableCell>
                      <TableCell className="text-base text-gray-700 dark:text-gray-300">{insumo.purchase_unit}</TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">S/ {insumo.costo_unitario.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-base">
                        <Badge variant={insumo.current_stock <= insumo.min_stock_level ? "destructive" : "outline"}>
                          {insumo.current_stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center">
                                {insumo.quantity_needed_for_period_rounded} {insumo.purchase_unit}
                                {insumo.quantity_needed_for_period_rounded_up && (
                                  <Info className="ml-1 h-4 w-4 text-blue-500 cursor-help" />
                                )}
                              </span>
                            </TooltipTrigger>
                            {insumo.quantity_needed_for_period_rounded_up && (
                              <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                                <p>Valor real: {insumo.quantity_needed_for_period_raw.toFixed(2)} {insumo.purchase_unit}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right text-base">
                        {insumo.purchase_suggestion_rounded > 0 ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-lg px-3 py-1 inline-flex items-center">
                                  {insumo.purchase_suggestion_rounded} {insumo.purchase_unit}
                                  {insumo.purchase_suggestion_rounded_up && (
                                    <Info className="ml-1 h-4 w-4 text-white cursor-help" />
                                  )}
                                </Badge>
                              </TooltipTrigger>
                              {insumo.purchase_suggestion_rounded_up && (
                                <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                                  <p>Valor real: {insumo.purchase_suggestion_raw.toFixed(2)} {insumo.purchase_unit}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">0 {insumo.purchase_unit}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                        S/ {insumo.estimated_purchase_cost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center py-3 px-6">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenSupplierDetails(insumo)}
                          className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
                        >
                          <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-600 dark:text-gray-400">
              <ShoppingBag className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
              <p className="text-lg">No se encontraron necesidades de insumos para el periodo seleccionado.</p>
              <p className="text-md mt-2">Asegúrate de tener menús planificados con platos e insumos para este rango de fechas.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSupplierDetailsDialogOpen} onOpenChange={setIsSupplierDetailsDialogOpen}>
        {selectedInsumoForDetails && (
          <InsumoSupplierDetailsDialog
            insumo={selectedInsumoForDetails}
            onClose={handleCloseSupplierDetails}
          />
        )}
      </Dialog>
    </div>
  );
};

export default PurchaseAnalysis;