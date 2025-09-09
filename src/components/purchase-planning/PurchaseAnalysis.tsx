import React, { useMemo } from "react";
import { useMenus } from "@/hooks/useMenus";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2, ShoppingBag } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Insumo } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PurchaseAnalysisProps {
  startDate: Date;
  endDate: Date;
}

interface InsumoNeeded extends Insumo {
  quantity_needed_for_period: number;
  current_stock: number;
  purchase_suggestion: number;
}

interface GroupedInsumos {
  [supplierName: string]: InsumoNeeded[];
}

const PurchaseAnalysis: React.FC<PurchaseAnalysisProps> = ({ startDate, endDate }) => {
  const { data: menus, isLoading: isLoadingMenus, isError: isErrorMenus, error: errorMenus } = useMenus();
  const { data: allInsumos, isLoading: isLoadingInsumos, isError: isErrorInsumos, error: errorInsumos } = useInsumos();

  const isLoading = isLoadingMenus || isLoadingInsumos;
  const isError = isErrorMenus || isErrorInsumos;
  const error = errorMenus || errorInsumos;

  const groupedInsumosForPurchase = useMemo(() => {
    if (isLoading || isError || !menus || !allInsumos) return {};

    const insumoNeedsMap = new Map<string, number>(); // Map<insumoId, totalQuantityNeeded>

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
                const totalNeeded = (platoInsumo.cantidad_necesaria * menuPlato.quantity_needed);
                insumoNeedsMap.set(insumo.id, (insumoNeedsMap.get(insumo.id) || 0) + totalNeeded);
              }
            });
          }
        });
      }
    });

    const groupedResult: GroupedInsumos = {};

    allInsumos.forEach(insumo => {
      const quantityNeededForPeriod = insumoNeedsMap.get(insumo.id) || 0;
      const currentStock = insumo.stock_quantity;
      const purchaseSuggestion = Math.max(0, quantityNeededForPeriod - currentStock);

      if (purchaseSuggestion > 0 || currentStock < 0) { // Show if needed or if stock is negative (error)
        const supplierName = insumo.supplier_name || "Sin Proveedor Asignado";
        if (!groupedResult[supplierName]) {
          groupedResult[supplierName] = [];
        }
        groupedResult[supplierName].push({
          ...insumo,
          quantity_needed_for_period: quantityNeededForPeriod,
          current_stock: currentStock,
          purchase_suggestion: purchaseSuggestion,
        });
      }
    });

    // Sort insumos within each group by purchase_suggestion
    for (const supplier in groupedResult) {
      groupedResult[supplier].sort((a, b) => b.purchase_suggestion - a.purchase_suggestion);
    }

    return groupedResult;
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

  const hasPurchaseSuggestions = Object.keys(groupedInsumosForPurchase).length > 0;

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Análisis de Compras ({formattedStartDate} - {formattedEndDate})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasPurchaseSuggestions ? (
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedInsumosForPurchase).map(([supplierName, insumos]) => (
              <AccordionItem key={supplierName} value={supplierName}>
                <AccordionTrigger className="text-xl font-semibold text-gray-800 dark:text-gray-200 hover:no-underline">
                  {supplierName} ({insumos.length} insumos)
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
                          <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Unidad</TableHead>
                          <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Stock Actual</TableHead>
                          <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Necesidad Periodo</TableHead>
                          <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Sugerencia Compra</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {insumos.map((insumo) => (
                          <TableRow key={insumo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{insumo.nombre}</TableCell>
                            <TableCell className="text-base text-gray-700 dark:text-gray-300">{insumo.unidad_medida}</TableCell>
                            <TableCell className="text-right text-base">
                              <Badge variant={insumo.current_stock <= 0 ? "destructive" : insumo.current_stock < insumo.quantity_needed_for_period ? "secondary" : "outline"}>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <ShoppingBag className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No se encontraron necesidades de insumos para el periodo seleccionado.</p>
            <p className="text-md mt-2">Asegúrate de tener menús planificados con platos e insumos para este rango de fechas.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseAnalysis;