import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { PurchaseRecord, PurchaseRecordFormValues, Insumo } from "@/types";
import { useAddPurchaseRecord, useUpdatePurchaseRecord } from "@/hooks/usePurchaseRecords";
import { useInsumos } from "@/hooks/useInsumos";

// Import new modular sections
import PurchaseDetailsSection from "./PurchaseDetailsSection";
import SupplierDetailsSection from "./SupplierDetailsSection";
import WhoMadePurchaseSection from "./WhoMadePurchaseSection";

const formSchema = z.object({
  insumo_id: z.string().min(1, { message: "Debe seleccionar un insumo." }),
  purchase_date: z.string().min(1, { message: "La fecha de compra es requerida." }),
  quantity_purchased: z.coerce.number().min(0.01, { message: "La cantidad comprada debe ser mayor a 0." }).max(999999.99, { message: "La cantidad comprada no debe exceder 999,999.99." }),
  unit_cost_at_purchase: z.coerce.number().min(0.01, { message: "El costo unitario debe ser mayor a 0." }).max(99999.99, { message: "El costo unitario no debe exceder 99,999.99." }),
  total_amount: z.coerce.number().min(0.01, { message: "El monto total debe ser mayor a 0." }).max(9999999.99, { message: "El monto total no debe exceder 9,999,999.99." }),
  supplier_name_at_purchase: z.string().max(100, { message: "El nombre del proveedor no debe exceder los 100 caracteres." }).nullable(),
  supplier_phone_at_purchase: z.string().nullable().refine((val) => {
    if (!val) return true;
    return /^\+51\d{9}$/.test(val);
  }, { message: "El teléfono debe empezar con +51 y tener 9 dígitos (ej. +51987654321)." }),
  supplier_address_at_purchase: z.string().max(255, { message: "La dirección del proveedor no debe exceder los 255 caracteres." }).nullable(),
  from_registered_supplier: z.boolean(),
  notes: z.string().max(100, { message: "El nombre no debe exceder los 100 caracteres." }).nullable(),
});

interface PurchaseRecordFormProps {
  initialData?: PurchaseRecord | null;
  prefilledInsumoId?: string;
  prefilledQuantity?: number;
  prefilledUnitCost?: number;
  prefilledSupplierName?: string;
  prefilledSupplierPhone?: string;
  prefilledSupplierAddress?: string;
  onSuccess: () => void;
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

  const [lastChangedField, setLastChangedField] = useState<'quantity' | 'unitCost' | 'total' | null>(null);

  const form = useForm<PurchaseRecordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insumo_id: prefilledInsumoId || "",
      purchase_date: initialData ? initialData.purchase_date : format(new Date(), "yyyy-MM-dd"),
      quantity_purchased: prefilledQuantity || 0,
      unit_cost_at_purchase: prefilledUnitCost || 0,
      total_amount: (prefilledQuantity && prefilledUnitCost) ? parseFloat((prefilledQuantity * prefilledUnitCost).toFixed(2)) : 0,
      supplier_name_at_purchase: prefilledSupplierName || "",
      supplier_phone_at_purchase: prefilledSupplierPhone || "",
      supplier_address_at_purchase: prefilledSupplierAddress || "",
      from_registered_supplier: true,
      notes: "",
    },
  });

  const selectedInsumoId = form.watch("insumo_id");
  const selectedInsumo = availableInsumosData?.data.find((insumo: Insumo) => insumo.id === selectedInsumoId);
  const purchaseUnit = selectedInsumo?.purchase_unit || "unidad";

  useEffect(() => {
    if (initialData) {
      form.reset({
        insumo_id: initialData.insumo_id,
        purchase_date: format(new Date(initialData.purchase_date), "yyyy-MM-dd"),
        quantity_purchased: initialData.quantity_purchased,
        unit_cost_at_purchase: initialData.unit_cost_at_purchase,
        total_amount: initialData.total_amount,
        supplier_name_at_purchase: initialData.supplier_name_at_purchase || "",
        supplier_phone_at_purchase: initialData.supplier_phone_at_purchase || "",
        supplier_address_at_purchase: initialData.supplier_address_at_purchase || "",
        from_registered_supplier: initialData.from_registered_supplier,
        notes: initialData.notes || "",
      });
    } else {
      form.reset({
        insumo_id: prefilledInsumoId || "",
        purchase_date: format(new Date(), "yyyy-MM-dd"),
        quantity_purchased: prefilledQuantity || 0,
        unit_cost_at_purchase: prefilledUnitCost || 0,
        total_amount: (prefilledQuantity && prefilledUnitCost) ? parseFloat((prefilledQuantity * prefilledUnitCost).toFixed(2)) : 0,
        supplier_name_at_purchase: prefilledSupplierName || "",
        supplier_phone_at_purchase: prefilledSupplierPhone || "",
        supplier_address_at_purchase: prefilledSupplierAddress || "",
        from_registered_supplier: true,
        notes: "",
      });
    }
  }, [initialData, form, prefilledInsumoId, prefilledQuantity, prefilledUnitCost, prefilledSupplierName, prefilledSupplierPhone, prefilledSupplierAddress]);

  const onSubmit = async (values: PurchaseRecordFormValues) => {
    const submitValues = { ...values };

    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, record: submitValues });
    } else {
      await addMutation.mutateAsync(submitValues);
    }
    onSuccess();
  };

  const isLoading = addMutation.isPending || updateMutation.isPending || isLoadingInsumos;

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <FormField
            control={form.control}
            name="insumo_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Insumo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading || isLoadingInsumos || !!initialData || !!prefilledInsumoId}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona un insumo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableInsumosData?.data.map((insumo: Insumo) => (
                      <SelectItem key={insumo.id} value={insumo.id}>
                        {insumo.nombre} ({insumo.purchase_unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <PurchaseDetailsSection
            isLoading={isLoading}
            selectedInsumoId={selectedInsumoId}
            purchaseUnit={purchaseUnit}
            setLastChangedField={setLastChangedField}
          />

          <SupplierDetailsSection
            isLoading={isLoading}
            selectedInsumoId={selectedInsumoId}
            selectedInsumo={selectedInsumo}
            initialData={initialData}
          />

          <WhoMadePurchaseSection isLoading={isLoading} />

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