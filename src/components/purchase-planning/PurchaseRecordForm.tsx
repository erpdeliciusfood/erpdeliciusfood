import React, { useEffect, useState } from "react";
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
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Changed from Checkbox
import { cn } from "@/lib/utils";
import { format, formatISO } from "date-fns";
import { es } from "date-fns/locale";
import { PurchaseRecord, PurchaseRecordFormValues, Insumo } from "@/types";
import { useAddPurchaseRecord, useUpdatePurchaseRecord } from "@/hooks/usePurchaseRecords";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2, CalendarIcon, CheckCircle2, XCircle } from "lucide-react"; // Added icons

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
  notes: z.string().max(100, { message: "El nombre no debe exceder los 100 caracteres." }).nullable(), // Renamed from who_made_purchase to notes
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
  const { data: availableInsumosData, isLoading: isLoadingInsumos } = useInsumos();

  const [lastChangedField, setLastChangedField] = useState<'quantity' | 'unitCost' | 'total' | null>(null);

  const form = useForm<PurchaseRecordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insumo_id: prefilledInsumoId || "",
      purchase_date: format(new Date(), "yyyy-MM-dd"),
      quantity_purchased: prefilledQuantity || 0,
      unit_cost_at_purchase: prefilledUnitCost || 0,
      total_amount: (prefilledQuantity && prefilledUnitCost) ? parseFloat((prefilledQuantity * prefilledUnitCost).toFixed(2)) : 0,
      supplier_name_at_purchase: prefilledSupplierName || "",
      supplier_phone_at_purchase: prefilledSupplierPhone || "",
      supplier_address_at_purchase: prefilledSupplierAddress || "",
      from_registered_supplier: true,
      notes: "", // Renamed from who_made_purchase to notes
    },
  });

  const quantityPurchased = form.watch("quantity_purchased");
  const unitCostAtPurchase = form.watch("unit_cost_at_purchase");
  const totalAmount = form.watch("total_amount");
  const selectedInsumoId = form.watch("insumo_id");
  const fromRegisteredSupplier = form.watch("from_registered_supplier");

  // Find the selected insumo to get its purchase_unit and registered supplier details
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
        notes: initialData.notes || "", // Renamed from who_made_purchase to notes
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
        notes: "", // Renamed from who_made_purchase to notes
      });
    }
  }, [initialData, form, prefilledInsumoId, prefilledQuantity, prefilledUnitCost, prefilledSupplierName, prefilledSupplierPhone, prefilledSupplierAddress]);

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

  const onSubmit = async (values: PurchaseRecordFormValues) => {
    // Map notes to notes for the API (no change needed here as it's already 'notes')
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

        {(!selectedInsumoId || !fromRegisteredSupplier) && ( // Show these fields if no insumo selected OR not from registered supplier
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

        <FormField
          control={form.control}
          name="notes" // Reverted to notes
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Quién realizó la compra (Opcional)</FormLabel>
              <FormControl>
                <Input // Changed from Textarea to Input for a shorter field
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