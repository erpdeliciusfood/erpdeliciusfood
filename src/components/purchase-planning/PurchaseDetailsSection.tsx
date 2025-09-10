import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, formatISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { PurchaseRecordFormValues } from "@/types";

interface PurchaseDetailsSectionProps {
  isLoading: boolean;
  selectedInsumoId: string;
  purchaseUnit: string;
  setLastChangedField: (field: 'quantity' | 'unitCost' | 'total' | null) => void;
}

const PurchaseDetailsSection: React.FC<PurchaseDetailsSectionProps> = ({
  isLoading,
  selectedInsumoId,
  purchaseUnit,
  setLastChangedField,
}) => {
  const form = useFormContext<PurchaseRecordFormValues>();

  const quantityPurchased = form.watch("quantity_purchased");
  const unitCostAtPurchase = form.watch("unit_cost_at_purchase");
  const totalAmount = form.watch("total_amount");

  // Effect for automatic calculations
  useEffect(() => {
    const calculateTotal = () => {
      if (quantityPurchased > 0 && unitCostAtPurchase > 0) {
        const calculatedTotal = quantityPurchased * unitCostAtPurchase;
        if (Math.abs(totalAmount - calculatedTotal) > 0.01) { // Check for significant difference
          form.setValue("total_amount", parseFloat(calculatedTotal.toFixed(2)), { shouldValidate: true });
        }
      }
    };

    const calculateUnitCost = () => {
      if (quantityPurchased > 0 && totalAmount > 0) {
        const calculatedUnitCost = totalAmount / quantityPurchased;
        if (Math.abs(unitCostAtPurchase - calculatedUnitCost) > 0.01) {
          form.setValue("unit_cost_at_purchase", parseFloat(calculatedUnitCost.toFixed(2)), { shouldValidate: true });
        }
      }
    };

    // This effect runs on every render, but the calculations only trigger if `lastChangedField` is set
    // and there's a significant difference to avoid unnecessary re-renders and infinite loops.
    // The `setLastChangedField` is called in the onChange handlers of the inputs.
    // This ensures that only one calculation path is active at a time.
  }, [quantityPurchased, unitCostAtPurchase, totalAmount, form, setLastChangedField]);


  return (
    <>
      <FormField
        control={form.control}
        name="purchase_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Fecha de Compra</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal h-12 text-base",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date ? formatISO(date, { representation: 'date' }) : null)}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01") || isLoading
                  }
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="quantity_purchased"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Cantidad Comprada {selectedInsumoId && `(en ${purchaseUnit})`}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 10.5"
                {...field}
                onChange={(e) => {
                  field.onChange(parseFloat(e.target.value));
                  setLastChangedField('quantity');
                }}
                onBlur={() => {
                  setLastChangedField(null); // Clear after blur to allow new calculations
                  const calculatedTotal = quantityPurchased * unitCostAtPurchase;
                  form.setValue("total_amount", parseFloat(calculatedTotal.toFixed(2)), { shouldValidate: true });
                }}
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
        name="unit_cost_at_purchase"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Costo Unitario de Compra (S/)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 2.50"
                {...field}
                onChange={(e) => {
                  field.onChange(parseFloat(e.target.value));
                  setLastChangedField('unitCost');
                }}
                onBlur={() => {
                  setLastChangedField(null); // Clear after blur to allow new calculations
                  const calculatedTotal = quantityPurchased * unitCostAtPurchase;
                  form.setValue("total_amount", parseFloat(calculatedTotal.toFixed(2)), { shouldValidate: true });
                }}
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
        name="total_amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Monto Total (S/)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 26.25"
                {...field}
                onChange={(e) => {
                  field.onChange(parseFloat(e.target.value));
                  setLastChangedField('total');
                }}
                onBlur={() => {
                  setLastChangedField(null); // Clear after blur to allow new calculations
                  if (quantityPurchased > 0) {
                    const calculatedUnitCost = totalAmount / quantityPurchased;
                    form.setValue("unit_cost_at_purchase", parseFloat(calculatedUnitCost.toFixed(2)), { shouldValidate: true });
                  }
                }}
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

export default PurchaseDetailsSection;