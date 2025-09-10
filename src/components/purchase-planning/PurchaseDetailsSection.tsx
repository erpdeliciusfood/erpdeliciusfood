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
import { PurchaseRecordFormValues } from "@/types";

interface PurchaseDetailsSectionProps {
  isLoading: boolean;
  selectedInsumoId: string;
  purchaseUnit: string;
  lastChangedField: 'quantity' | 'unitCost' | 'total' | null;
  setLastChangedField: (field: 'quantity' | 'unitCost' | 'total' | null) => void;
}

const PurchaseDetailsSection: React.FC<PurchaseDetailsSectionProps> = ({
  isLoading,
  selectedInsumoId,
  purchaseUnit,
  lastChangedField,
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

    if (lastChangedField === 'quantity' || lastChangedField === 'unitCost') {
      calculateTotal();
    } else if (lastChangedField === 'total') {
      calculateUnitCost();
    }
  }, [quantityPurchased, unitCostAtPurchase, totalAmount, form, lastChangedField]);

  return (
    <>
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