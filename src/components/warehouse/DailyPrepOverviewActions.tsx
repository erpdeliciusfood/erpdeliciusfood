import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MinusCircle } from "lucide-react";
import { AggregatedInsumoNeed } from "@/types";

interface DailyPrepOverviewActionsProps {
  stockFilter: 'all' | 'sufficient' | 'insufficient';
  setStockFilter: (value: 'all' | 'sufficient' | 'insufficient') => void;
  handleOpenDeductQuantitiesDialog: () => void;
  isDeductButtonDisabled: boolean;
  selectedDeductionItemsCount: number;
  itemsWithInsufficientStockCount: number;
}

const DailyPrepOverviewActions: React.FC<DailyPrepOverviewActionsProps> = ({
  stockFilter,
  setStockFilter,
  handleOpenDeductQuantitiesDialog,
  isDeductButtonDisabled,
  selectedDeductionItemsCount,
  itemsWithInsufficientStockCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Select onValueChange={setStockFilter} value={stockFilter}>
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
          {isDeductButtonDisabled && selectedDeductionItemsCount === 0 && (
            <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
              <p>Selecciona al menos un insumo para deducir.</p>
            </TooltipContent>
          )}
          {isDeductButtonDisabled && itemsWithInsufficientStockCount > 0 && (
            <TooltipContent className="text-base p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
              <p>No se puede deducir el stock porque hay insumos seleccionados con cantidades insuficientes.</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default DailyPrepOverviewActions;