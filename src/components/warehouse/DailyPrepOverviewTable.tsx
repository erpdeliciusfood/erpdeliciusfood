import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, PackageX, Utensils } from "lucide-react";
import { AggregatedInsumoNeed, GroupedInsumoNeeds, InsumoDeductionItem } from "@/types";
import DailyPrepOverviewActions from "./DailyPrepOverviewActions";
import DailyPrepInsumoRow from "./DailyPrepInsumoRow";

interface DailyPrepOverviewTableProps {
  formattedDate: string;
  groupedForDisplay: GroupedInsumoNeeds[];
  allDeductionItems: InsumoDeductionItem[];
  selectedDeductionItemIds: Set<string>;
  setSelectedDeductionItemIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleSendToKitchen: (insumoNeed: AggregatedInsumoNeed) => void;
  handleOpenUrgentPurchaseRequestDialog: (insumoNeed: AggregatedInsumoNeed) => void;
  stockFilter: 'all' | 'sufficient' | 'insufficient';
  setStockFilter: (value: 'all' | 'sufficient' | 'insufficient') => void;
  handleOpenDeductQuantitiesDialog: () => void;
  isDeductButtonDisabled: boolean;
  itemsWithInsufficientStockCount: number;
}

const DailyPrepOverviewTable: React.FC<DailyPrepOverviewTableProps> = ({
  formattedDate,
  groupedForDisplay,
  allDeductionItems,
  selectedDeductionItemIds,
  setSelectedDeductionItemIds,
  handleSendToKitchen,
  handleOpenUrgentPurchaseRequestDialog,
  stockFilter,
  setStockFilter,
  handleOpenDeductQuantitiesDialog,
  isDeductButtonDisabled,
  itemsWithInsufficientStockCount,
}) => {
  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Necesidades de Insumos para el {formattedDate}
        </CardTitle>
        <DailyPrepOverviewActions
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
          handleOpenDeductQuantitiesDialog={handleOpenDeductQuantitiesDialog}
          isDeductButtonDisabled={isDeductButtonDisabled}
          selectedDeductionItemsCount={selectedDeductionItemIds.size}
          itemsWithInsufficientStockCount={itemsWithInsufficientStockCount}
        />
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
                      {group.insumos.map((need: AggregatedInsumoNeed) => (
                        <DailyPrepInsumoRow
                          key={need.insumo_id}
                          need={need}
                          allDeductionItems={allDeductionItems}
                          selectedDeductionItemIds={selectedDeductionItemIds}
                          setSelectedDeductionItemIds={setSelectedDeductionItemIds}
                          handleSendToKitchen={handleSendToKitchen}
                          handleOpenUrgentPurchaseRequestDialog={handleOpenUrgentPurchaseRequestDialog}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
            {itemsWithInsufficientStockCount > 0 && (
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
  );
};

export default DailyPrepOverviewTable;