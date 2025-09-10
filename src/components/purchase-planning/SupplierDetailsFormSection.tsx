import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PurchaseRecordFormValues } from "@/types";

interface SupplierDetailsFormSectionProps {
  isLoading: boolean;
}

const SupplierDetailsFormSection: React.FC<SupplierDetailsFormSectionProps> = ({
  isLoading,
}) => {
  const form = useFormContext<PurchaseRecordFormValues>();

  return (
    <>
      <FormField
        control={form.control}
        name="supplier_name_at_purchase"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Proveedor (en la compra)</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej. Distribuidora La Huerta"
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

      <FormField
        control={form.control}
        name="supplier_phone_at_purchase"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Teléfono del Proveedor (en la compra)</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej. +51987654321"
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

      <FormField
        control={form.control}
        name="supplier_address_at_purchase"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Dirección del Proveedor (en la compra)</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej. Av. Los Girasoles 123, Lima"
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

      <FormField
        control={form.control}
        name="from_registered_supplier"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isLoading}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">
                ¿Fue del proveedor registrado para este insumo?
              </FormLabel>
              <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                Marca esta casilla si la compra se realizó al proveedor habitual.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </>
  );
};

export default SupplierDetailsFormSection;