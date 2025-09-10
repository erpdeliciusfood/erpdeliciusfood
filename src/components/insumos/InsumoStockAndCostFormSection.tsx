import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InsumoFormValues } from "@/types";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InsumoStockAndCostFormSectionProps {
  isLoading: boolean;
}

const InsumoStockAndCostFormSection: React.FC<InsumoStockAndCostFormSectionProps> = ({
  isLoading,
}) => {
  const form = useFormContext<InsumoFormValues>();

  return (
    <>
      <FormField
        control={form.control}
        name="costo_unitario"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center space-x-2">
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Costo Unitario (S/ por Unidad de Compra)</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-base p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                    <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Costo Unitario</p>
                    <p className="text-gray-700 dark:text-gray-300">Este costo se actualiza automáticamente al registrar una "Entrada por Compra" en Movimientos de Stock.</p>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
                      <span className="font-medium text-gray-800 dark:text-gray-200">Nota:</span> Puedes editarlo manualmente si es necesario.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 2.50"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="h-12 text-base"
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="stock_quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad en Stock (en Unidad de Compra)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="1"
                placeholder="Ej. 100"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
                className="h-12 text-base"
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="min_stock_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nivel Mínimo de Stock (en Unidad de Compra)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="1"
                placeholder="Ej. 10"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
                className="h-12 text-base"
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default InsumoStockAndCostFormSection;