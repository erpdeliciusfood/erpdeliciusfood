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
import { PurchaseRecordFormValues } from "@/types";

interface WhoMadePurchaseSectionProps {
  isLoading: boolean;
}

const WhoMadePurchaseSection: React.FC<WhoMadePurchaseSectionProps> = ({ isLoading }) => {
  const form = useFormContext<PurchaseRecordFormValues>();

  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Quién realizó la compra (Opcional)</FormLabel>
          <FormControl>
            <Input
              placeholder="Ej. Juan Pérez"
              {...field}
              value={field.value || ""}
              className="h-12 text-base"
              disabled={isLoading}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default WhoMadePurchaseSection;