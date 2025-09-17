import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ColoredProgress } from "@/components/ui/colored-progress";
import { cn } from "@/lib/utils";
import { AggregatedInsumoNeed, InsumoDeductionItem } from "@/types";
import { AlertTriangle, CheckCircle2, ChefHat, Info, ShoppingBag } from "lucide-react";

interface DailyPrepInsumoRowProps {
  need: AggregatedInsumoNeed;
  allDeductionItems: InsumoDeductionItem[];
  selectedDeductionItemIds: Set<string>;
  setSelectedDeductionItemIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleSendToKitchen: (insumoNeed: AggregatedInsumoNeed) => void;
  handleOpenUrgentPurchaseRequestDialog: (insumoNeed: AggregatedInsumoNeed) => void;
}

const DailyPrepInsumoRow: React.FC<DailyPrepInsumoRowProps> = ({
  need,
  allDeductionItems,
  selectedDeductionItemIds,
  setSelectedDeductionItemIds,
  handleSendToKitchen,
  handleOpenUrgentPurchaseRequestDialog,
}) => {
  const isSufficient = need.current_stock_quantity >= need.total_needed_purchase_unit;
  const progressValue = need.total_needed_purchase_unit > 0
    ? Math.min(100, (need.current_stock_quantity / need.total_needed_purchase_unit) * 100)
    : 100;
  const progressColor = isSufficient ? "bg-green-500" : "bg-red-500";

  // Determine if all granular items contributing to this aggregated need are selected
  const allGranularItemsForThisAggregatedNeed = allDeductionItems.filter(item => 
    item.insumo_id === need.insumo_id && 
    item.meal_service_id === need.meal_service_id
  );
  const isAggregatedSelected = allGranularItemsForThisAggregatedNeed.length > 0 && 
                              allGranularItemsForThisAggregatedNeed.every(item => selectedDeductionItemIds.has(item.unique_id));

  const isFulfilled = need.deduction_status === 'fulfilled';
  const isPartial = need.deduction_status === 'partial';
  const isPending = need.deduction_status === 'pending';

  return (
    <TableRow
      key={need.insumo_id}
      className={cn(
        "border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out",
        !isSufficient && "bg-red-50/50 dark:bg-red-900/20",
        isFulfilled && "bg-green-50/50 dark:bg-green-900/20", // Highlight if fulfilled
        isPartial && "bg-yellow-50/50 dark:bg-yellow-900/20" // Highlight if partial
      )}
    >
      <TableCell className="text-center py-3 px-6">
        <Checkbox
          checked={isAggregatedSelected}
          onCheckedChange={(checked: boolean) => {
            const newSelected = new Set(selectedDeductionItemIds);
            allGranularItemsForThisAggregatedNeed.forEach(item => {
              if (checked) {
                newSelected.add(item.unique_id);
              } else {
                newSelected.delete(item.unique_id);
              }
            });
            setSelectedDeductionItemIds(newSelected);
          }}
          disabled={need.total_needed_purchase_unit === 0 || isFulfilled} // Disable if fulfilled
        />
      </TableCell>
      <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left min-w-[180px]">
        <div className="flex items-center">
          {need.insumo_nombre}
          {isFulfilled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CheckCircle2 className="ml-2 h-5 w-5 text-green-600" />
                </TooltipTrigger>
                <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                  <p>Deducido completamente.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isPartial && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-2 h-5 w-5 text-yellow-600" />
                </TooltipTrigger>
                <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                  <p>Deducido parcialmente. Cantidad deducida: {need.deducted_quantity_for_prep} {need.purchase_unit}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
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
        {isSufficient && isPending && need.total_needed_purchase_unit > 0 && ( // Only show if sufficient and pending
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSendToKitchen(need)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 ease-in-out mr-2"
            disabled={isFulfilled} // Disable if fulfilled
          >
            <ChefHat className="mr-1 h-4 w-4" />
            Enviar a Cocina
          </Button>
        )}
        {isSufficient && isPartial && need.total_needed_purchase_unit > need.deducted_quantity_for_prep && ( // If partial, still allow sending remaining
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSendToKitchen(need)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 ease-in-out mr-2"
            disabled={isFulfilled} // Disable if fulfilled
          >
            <ChefHat className="mr-1 h-4 w-4" />
            Enviar Restante
          </Button>
        )}
        {!isSufficient && need.missing_quantity > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenUrgentPurchaseRequestDialog(need)}
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 ease-in-out"
            disabled={isFulfilled} // Disable if fulfilled
          >
            <ShoppingBag className="mr-1 h-4 w-4" />
            Solicitar Urgente
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default DailyPrepInsumoRow;