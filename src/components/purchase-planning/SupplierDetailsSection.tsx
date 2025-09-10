import React, { useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle } from "lucide-react";
import { Insumo, PurchaseRecord, PurchaseRecordFormValues } from "@/types";

interface SupplierDetailsSectionProps {
  isLoading: boolean;
  selectedInsumoId: string;
  selectedInsumo: Insumo | undefined;
  initialData?: PurchaseRecord | null;
}

const SupplierDetailsSection: React.FC<SupplierDetailsSectionProps> = ({
  isLoading,
  selectedInsumoId,
  selectedInsumo,
  initialData,
}) => {
  const form = useFormContext<PurchaseRecordFormValues>();
  const fromRegisteredSupplier = form.watch("from_registered_supplier");

  // Effect to pre-fill supplier details when insumo_id or fromRegisteredSupplier changes
  useEffect(() => {
    if (fromRegisteredSupplier && selectedInsumo) {
      form.setValue("supplier_name_at_purchase", selectedInsumo.supplier_name || "");
      form.setValue("supplier_phone_at_purchase", selectedInsumo.supplier_phone || "");
      form.setValue("supplier_address_at_purchase", selectedInsumo.supplier_address || "");
    } else if (!fromRegisteredSupplier) {
      // Clear fields if switching to 'No' (unless it's initialData and it was already 'No')
      if (!initialData || initialData.from_registered_supplier) { // Only clear if it was previously from a registered supplier or new form
        form.setValue("supplier_name_at_purchase", "");
        form.setValue("supplier_phone_at_purchase", "");
        form.setValue("supplier_address_at_purchase", "");
      }
    }
  }, [selectedInsumo, fromRegisteredSupplier, form, initialData]);

  return (
    <>
      <FormField
        control={form.control}
        name="from_registered_supplier"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">¿Fue del proveedor registrado para este insumo?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "true")}
                value={field.value ? "true" : "false"}
                className="flex space-x-4"
                disabled={isLoading || !selectedInsumoId} // Disable if no insumo selected
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="true" />
                  </FormControl>
                  <FormLabel className="font-normal flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" /> Sí
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="false" />
                  </FormControl>
                  <FormLabel className="font-normal flex items-center">
                    <XCircle className="h-5 w-5 mr-2 text-red-600" /> No
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(selectedInsumoId && fromRegisteredSupplier) && (
        <div className="space-y-6">
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Proveedor (registrado)</FormLabel>
            <FormControl>
              <Input
                value={selectedInsumo?.supplier_name || ""}
                className="h-12 text-base"
                disabled
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Teléfono del Proveedor (registrado)</FormLabel>
            <FormControl>
              <Input
                value={selectedInsumo?.supplier_phone || ""}
                className="h-12 text-base"
                disabled
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Dirección del Proveedor (registrado)</FormLabel>
            <FormControl>
              <Input
                value={selectedInsumo?.supplier_address || ""}
                className="h-12 text-base"
                disabled
              />
            </FormControl>
          </FormItem>
        </div>
      )}

      {(!selectedInsumoId || !fromRegisteredSupplier) && (
        <div className="space-y-6">
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
                <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Si no conoces los datos del proveedor, puedes dejarlos en blanco.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};

export default SupplierDetailsSection;