import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PurchaseRecord, PurchaseRecordFormValues, Insumo } from "@/types";
import { useAddPurchaseRecord, useUpdatePurchaseRecord } from "@/hooks/usePurchaseRecords";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2 } from "lucide-react";
import PurchaseDetailsFormSection from "./PurchaseDetailsFormSection";
import SupplierDetailsFormSection from "./SupplierDetailsFormSection";
import StatusAndReceivedDateFormSection from "./StatusAndReceivedDateFormSection";
import { format } from "date-fns";
import { Input } from "@/components/ui/input"; // Import Input for the new field

const formSchema = z.object({
  insumo_id: z.string().min(1, { message: "Debe seleccionar un insumo." }),
  purchase_date: z.string().min(1, { message: "La fecha de compra es requerida." }),
  quantity_purchased: z.coerce.number().min(0.01, { message: "La cantidad comprada debe ser mayor a 0." }).max(999999.99, { message: "La cantidad comprada no debe exceder 999,999.99." }),
  quantity_received: z.coerce.number().min(0, { message: "La cantidad recibida no puede ser negativa." }).max(999999.99, { message: "La cantidad recibida no debe exceder 999,999.99." }), // NEW: Added validation for quantity_received
  unit_cost_at_purchase: z.coerce.number().min(0.01, { message: "El costo unitario debe ser mayor a 0." }).max(99999.99, { message: "El costo unitario no debe exceder 99,999.99." }),
  total_amount: z.coerce.number().min(0.01, { message: "El monto total debe ser mayor a 0." }).max(9999999.99, { message: "El monto total no debe exceder 9,999,999.99." }),
  supplier_name_at_purchase: z.string().max(100, { message: "El nombre del proveedor no debe exceder los 100 caracteres." }).nullable(),
  supplier_phone_at_purchase: z.string().nullable().refine((val) => {
    if (!val) return true;
    return /^\+51\d{9}$/.test(val);
  }, { message: "El teléfono debe empezar con +51 y tener 9 dígitos (ej. +51987654321)." }),
  supplier_address_at_purchase: z.string().max(255, { message: "La dirección del proveedor no debe exceder los 255 caracteres." }).nullable(),
  from_registered_supplier: z.boolean(),
  notes: z.string().max(500, { message: "Las notas no deben exceder los 500 caracteres." }).nullable(),
  status: z.enum(['ordered', 'received_by_company', 'received_by_warehouse', 'cancelled']),
  received_date: z.string().nullable(),
}).superRefine((data, ctx) => {
  // NEW: Conditional validation for quantity_received
  if ((data.status === 'received_by_company' || data.status === 'received_by_warehouse') && data.quantity_received === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La cantidad recibida es requerida cuando el estado es 'Recibido por Empresa' o 'Recibido en Almacén'.",
      path: ["quantity_received"],
    });
  }
  if (data.quantity_received !== undefined && data.quantity_received > data.quantity_purchased) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La cantidad recibida no puede ser mayor que la cantidad comprada.",
      path: ["quantity_received"],
    });
  }
});

interface PurchaseRecordFormProps {
  initialData?: PurchaseRecord | null;
  prefilledInsumoId?: string;
  prefilledQuantity?: number;
  prefilledUnitCost?: number;
  prefilledSupplierName?: string;
  prefilledSupplierPhone?: string;
  prefilledSupplierAddress?: string;
  onSuccess: (record?: PurchaseRecord) => void;
  onCancel: () => void;
}

const PurchaseRecordForm: React.FC<PurchaseRecordFormProps> = ({
  initialData,
  prefilledInsumoId,
  prefilledQuantity,
  prefilledUnitCost,
  prefilledSupplierName,
  prefilledSupplierPhone,
  prefilledSupplierAddress,
  onSuccess,
  onCancel,
}) => {
  const addMutation = useAddPurchaseRecord();
  const updateMutation = useUpdatePurchaseRecord();
  const { data: availableInsumosData, isLoading: isLoadingInsumos } = useInsumos();

  const form = useForm<PurchaseRecordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insumo_id: prefilledInsumoId || "",
      purchase_date: format(new Date(), "yyyy-MM-dd"),
      quantity_purchased: prefilledQuantity || 0,
      quantity_received: prefilledInsumoId ? prefilledQuantity : 0, // Set quantity_received to prefilledQuantity if prefilled, else 0
      unit_cost_at_purchase: prefilledUnitCost || 0,
      total_amount: (prefilledQuantity && prefilledUnitCost) ? prefilledQuantity * prefilledUnitCost : 0,
      supplier_name_at_purchase: prefilledSupplierName || "",
      supplier_phone_at_purchase: prefilledSupplierPhone || "",
      supplier_address_at_purchase: prefilledSupplierAddress || "",
      from_registered_supplier: true,
      notes: "",
      status: prefilledInsumoId ? 'received_by_warehouse' : 'ordered', // Default to received_by_warehouse if prefilled, else ordered
      received_date: prefilledInsumoId ? format(new Date(), "yyyy-MM-dd") : null, // Set received date if prefilled, else null
    },
  });

  const quantityPurchased = form.watch("quantity_purchased");
  const unitCostAtPurchase = form.watch("unit_cost_at_purchase");
  const selectedInsumoId = form.watch("insumo_id");
  const currentStatus = form.watch("status");

  const selectedInsumo = availableInsumosData?.data.find((insumo: Insumo) => insumo.id === selectedInsumoId);
  const purchaseUnit = selectedInsumo?.purchase_unit || "unidad";

  useEffect(() => {
    if (initialData) {
      form.reset({
        insumo_id: initialData.insumo_id,
        purchase_date: format(new Date(initialData.purchase_date), "yyyy-MM-dd"),
        quantity_purchased: initialData.quantity_purchased,
        quantity_received: initialData.quantity_received, // Use initialData's quantity_received
        unit_cost_at_purchase: initialData.unit_cost_at_purchase,
        total_amount: initialData.total_amount,
        supplier_name_at_purchase: initialData.supplier_name_at_purchase || "",
        supplier_phone_at_purchase: initialData.supplier_phone_at_purchase || "",
        supplier_address_at_purchase: initialData.supplier_address_at_purchase || "",
        from_registered_supplier: initialData.from_registered_supplier,
        notes: initialData.notes || "",
        status: initialData.status,
        received_date: initialData.received_date || null,
      });
    } else {
      form.reset({
        insumo_id: prefilledInsumoId || "",
        purchase_date: format(new Date(), "yyyy-MM-dd"),
        quantity_purchased: prefilledQuantity || 0,
        quantity_received: prefilledInsumoId ? prefilledQuantity : 0, // Set quantity_received to prefilledQuantity if prefilled, else 0
        unit_cost_at_purchase: prefilledUnitCost || 0,
        total_amount: (prefilledQuantity && prefilledUnitCost) ? prefilledQuantity * prefilledUnitCost : 0,
        supplier_name_at_purchase: prefilledSupplierName || "",
        supplier_phone_at_purchase: prefilledSupplierPhone || "",
        supplier_address_at_purchase: prefilledSupplierAddress || "",
        from_registered_supplier: true,
        notes: "",
        status: prefilledInsumoId ? 'received_by_warehouse' : 'ordered', // Default to received_by_warehouse if prefilled, else ordered
        received_date: prefilledInsumoId ? format(new Date(), "yyyy-MM-dd") : null, // Set received date if prefilled, else null
      });
    }
  }, [initialData, form, prefilledInsumoId, prefilledQuantity, prefilledUnitCost, prefilledSupplierName, prefilledSupplierPhone, prefilledSupplierAddress]);

  useEffect(() => {
    const calculatedTotal = quantityPurchased * unitCostAtPurchase;
    if (form.getValues("total_amount") !== parseFloat(calculatedTotal.toFixed(2))) { // Ensure comparison is with parsed float
      form.setValue("total_amount", parseFloat(calculatedTotal.toFixed(2)), { shouldValidate: true });
    }
  }, [quantityPurchased, unitCostAtPurchase, form]);

  useEffect(() => {
    if (selectedInsumoId && !initialData && !prefilledInsumoId) { // Only auto-fill if not editing and not prefilled
      const selectedInsumo = availableInsumosData?.data.find((insumo: Insumo) => insumo.id === selectedInsumoId);
      if (selectedInsumo) {
        form.setValue("supplier_name_at_purchase", selectedInsumo.proveedor_preferido?.name || "");
        form.setValue("supplier_phone_at_purchase", selectedInsumo.proveedor_preferido?.phone || "");
        form.setValue("supplier_address_at_purchase", selectedInsumo.proveedor_preferido?.address || "");
        form.setValue("from_registered_supplier", true);
      }
    }
  }, [selectedInsumoId, availableInsumosData?.data, form, initialData, prefilledInsumoId]);

  useEffect(() => {
    if (initialData && initialData.status !== currentStatus) {
      if ((currentStatus === 'received_by_company' || currentStatus === 'received_by_warehouse') && !form.getValues("received_date")) {
        form.setValue("received_date", format(new Date(), "yyyy-MM-dd"), { shouldValidate: true });
      } else if (currentStatus === 'ordered' || currentStatus === 'cancelled') {
        form.setValue("received_date", null, { shouldValidate: true });
      }
    }
  }, [currentStatus, form, initialData]);

  const onSubmit = async (values: PurchaseRecordFormValues) => {
    if (initialData) {
      const updatedRecord = await updateMutation.mutateAsync({ id: initialData.id, record: values });
      onSuccess(updatedRecord);
    } else {
      const newRecord = await addMutation.mutateAsync(values);
      onSuccess(newRecord);
    }
  };

  const isLoading = addMutation.isPending || updateMutation.isPending || isLoadingInsumos;

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <PurchaseDetailsFormSection
            isLoading={isLoading}
            availableInsumos={availableInsumosData?.data}
            purchaseUnit={purchaseUnit}
            initialDataPresent={!!initialData}
            prefilledInsumoId={prefilledInsumoId}
          />

          {/* NEW: Quantity Received Field */}
          {(currentStatus === 'received_by_company' || currentStatus === 'received_by_warehouse') && (
            <FormField
              control={form.control}
              name="quantity_received"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    Cantidad Recibida {form.watch("insumo_id") && `(en ${purchaseUnit})`}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ej. 10.5"
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
          )}

          <SupplierDetailsFormSection
            isLoading={isLoading}
          />

          {/* Only show status and received date section if it's an existing record or not prefilled */}
          {initialData || !prefilledInsumoId ? (
            <StatusAndReceivedDateFormSection
              isLoading={isLoading}
            />
          ) : null}


          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Notas (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detalles adicionales sobre la compra..."
                    {...field}
                    value={field.value || ""}
                    className="min-h-[80px] text-base"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6 py-3 text-lg"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {initialData ? "Guardar Cambios" : "Registrar Compra"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default PurchaseRecordForm;