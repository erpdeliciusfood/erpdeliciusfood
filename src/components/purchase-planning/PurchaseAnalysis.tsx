import React, { useMemo } from "react";
import { useMenus } from "@/hooks/useMenus";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2, ShoppingBag, DollarSign } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Insumo } from "@/types";

interface PurchaseAnalysisProps {
  startDate: Date;
  endDate: Date;
}

interface InsumoNeeded extends Insumo {
  quantity_needed_for_period: number;
  current_stock: number;
  purchase_suggestion: number;
  estimated_purchase_cost: number; // New field
}

const PurchaseAnalysis: React.FC<PurchaseAnalysisProps> = ({ startDate, endDate }) => {
  const { data: menus, isLoading: isLoadingMenus, isError: isErrorMenus, error: errorMenus } = useMenus();
  const { data: allInsumos, isLoading: isLoadingInsumos, isError: isErrorInsumos, error: errorInsumos } = useInsumos();

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
      const quantityNeededForPeriod = insumoNeedsMap.get(insumo.id) || 0;
      const currentStock = insumo.stock_quantity; // stock_quantity is already in purchase_unit
      const purchaseSuggestion = Math.max(0, quantityNeededForPeriod - currentStock);
      const estimatedPurchaseCost = purchaseSuggestion * insumo.costo_unitario;

      if (quantityNeededForPeriod > 0 || currentStock < insumo.min_stock_level) { // Show if needed or if stock is below min_stock_level
        result.push({
          ...insumo,
          quantity_needed_for_period: parseFloat(quantityNeededForPeriod.toFixed(2)),
          current_stock: parseFloat(currentStock.toFixed(2)),
          purchase_suggestion: parseFloat(purchaseSuggestion.toFixed(2)),
          estimated_purchase_cost: parseFloat(estimatedPurchaseCost.toFixed(2)),
        });
        overallEstimatedCost += estimatedPurchaseCost;
      }
    });

    return {
      insumosForPurchase: result.sort((a, b) => b.purchase_suggestion - a.purchase_suggestion), // Sort by highest purchase suggestion
      totalEstimatedPurchaseCost: parseFloat(overallEstimatedCost.toFixed(2)),
    };
  }, [menus, allInsumos, startDate, endDate, isLoading, isError]);

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
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Análisis de Compras ({formattedStartDate} - {formattedEndDate})
          </CardTitle>
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
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Costo Estimado (S/)</TableHead> {/* New column */}
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
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">{insumo.quantity_needed_for_period.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-base">
                        {insumo.purchase_suggestion > 0 ? (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-lg px-3 py-1">
                            {insumo.purchase_suggestion.toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                        S/ {insumo.estimated_purchase_cost.toFixed(2)}
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
    </div>
  );
};

export default PurchaseAnalysis;