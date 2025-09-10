import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, // Added FormDescription
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, formatISO } from "date-fns";
import { es } from "date-fns/locale";
import { PurchaseRecord, PurchaseRecordFormValues, Insumo } from "@/types";
import { useAddPurchaseRecord, useUpdatePurchaseRecord } from "@/hooks/usePurchaseRecords";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2, CalendarIcon } from "lucide-react";

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
  notes: z.string().max(500, { message: "Las notas no deben exceder los 500 caracteres." }).nullable(),
});

interface PurchaseRecordFormProps {
  initialData?: PurchaseRecord | null;
  prefilledInsumoId?: string; // For generating from purchase analysis
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
  const { data: availableInsumos, isLoading: isLoadingInsumos } = useInsumos();

  const form = useForm<PurchaseRecordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insumo_id: prefilledInsumoId || "",
      purchase_date: format(new Date(), "yyyy-MM-dd"),
      quantity_purchased: prefilledQuantity || 0,
      unit_cost_at_purchase: prefilledUnitCost || 0,
      total_amount: (prefilledQuantity && prefilledUnitCost) ? prefilledQuantity * prefilledUnitCost : 0,
      supplier_name_at_purchase: prefilledSupplierName || "",
      supplier_phone_at_purchase: prefilledSupplierPhone || "",
      supplier_address_at_purchase: prefilledSupplierAddress || "",
      from_registered_supplier: true,
      notes: "",
    },
  });

  const quantityPurchased = form.watch("quantity_purchased");
  const unitCostAtPurchase = form.watch("unit_cost_at_purchase");
  const selectedInsumoId = form.watch("insumo_id");

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
        total_amount: (prefilledQuantity && prefilledUnitCost) ? prefilledQuantity * prefilledUnitCost : 0,
        supplier_name_at_purchase: prefilledSupplierName || "",
        supplier_phone_at_purchase: prefilledSupplierPhone || "",
        supplier_address_at_purchase: prefilledSupplierAddress || "",
        from_registered_supplier: true,
        notes: "",
      });
    }
  }, [initialData, form, prefilledInsumoId, prefilledQuantity, prefilledUnitCost, prefilledSupplierName, prefilledSupplierPhone, prefilledSupplierAddress]);

  useEffect(() => {
    // Auto-calculate total_amount
    const calculatedTotal = quantityPurchased * unitCostAtPurchase;
    if (form.getValues("total_amount") !== calculatedTotal) {
      form.setValue("total_amount", parseFloat(calculatedTotal.toFixed(2)), { shouldValidate: true });
    }
  }, [quantityPurchased, unitCostAtPurchase, form]);

  useEffect(() => {
    // When insumo_id changes, pre-fill supplier details from registered insumo
    if (selectedInsumoId && !initialData) { // Only for new records, not when editing
      const selectedInsumo = availableInsumos?.find(insumo => insumo.id === selectedInsumoId);
      if (selectedInsumo) {
        form.setValue("supplier_name_at_purchase", selectedInsumo.supplier_name || "");
        form.setValue("supplier_phone_at_purchase", selectedInsumo.supplier_phone || "");
        form.setValue("supplier_address_at_purchase", selectedInsumo.supplier_address || "");
        form.setValue("from_registered_supplier", true);
      }
    }
  }, [selectedInsumoId, availableInsumos, form, initialData]);

  const onSubmit = async (values: PurchaseRecordFormValues) => {
    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, record: values });
    } else {
      await addMutation.mutateAsync(values);
    }
    onSuccess();
  };

  const isLoading = addMutation.isPending || updateMutation.isPending || isLoadingInsumos;

  return (
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
                disabled={isLoading || isLoadingInsumos || !!initialData || !!prefilledInsumoId} // Disable if editing or prefilled
              >
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona un insumo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableInsumos?.map((insumo: Insumo) => (
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
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad Comprada</FormLabel>
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
  );
};

export default PurchaseRecordForm;