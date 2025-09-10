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

interface InsumoSupplierFormSectionProps {
  isLoading: boolean;
}

const InsumoSupplierFormSection: React.FC<InsumoSupplierFormSectionProps> = ({
  isLoading,
}) => {
  const form = useFormContext<InsumoFormValues>();

  return (
    <>
      <FormField
        control={form.control}
        name="supplier_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Proveedor (Opcional)</FormLabel>
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
        name="supplier_phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Teléfono del Proveedor (Opcional)</FormLabel>
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
        name="supplier_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Dirección del Proveedor (Opcional)</FormLabel>
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
    </>
  );
};

export default InsumoSupplierFormSection;