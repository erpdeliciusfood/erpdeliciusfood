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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockMovementFormValues, Insumo } from "@/types";
import { useAddStockMovement } from "@/hooks/useStockMovements";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  insumo_id: z.string().min(1, { message: "Debe seleccionar un insumo." }),
  movement_type: z.enum(["purchase_in", "reception_in", "adjustment_in", "adjustment_out"], { // NEW: Added 'reception_in'
    required_error: "Debe seleccionar un tipo de movimiento.",
  }),
  quantity_change: z.coerce.number().min(0.01, {
    message: "La cantidad de cambio debe ser mayor a 0.",
  }).max(999999.99, {
    message: "La cantidad de cambio no debe exceder 999999.99.",
  }).optional(),
  total_purchase_amount: z.coerce.number().min(0.01, {
    message: "El monto total de la compra debe ser mayor a 0.",
  }).max(9999999.99, {
    message: "El monto total de la compra no debe exceder 9,999,999.99.",
  }).optional(),
  total_purchase_quantity: z.coerce.number().min(0.01, {
    message: "La cantidad comprada debe ser mayor a 0.",
  }).max(999999.99, {
    message: "La cantidad comprada no debe exceder 999,999.99.",
  }).optional(),
  notes: z.string().max(500, {
    message: "Las notas no deben exceder los 500 caracteres.",
  }).nullable(),
}).superRefine((data, ctx) => {
  if (data.movement_type === "purchase_in") {
    if (data.total_purchase_amount === undefined || data.total_purchase_amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El monto total de la compra es requerido para entradas por compra.",
        path: ["total_purchase_amount"],
      });
    }
    if (data.total_purchase_quantity === undefined || data.total_purchase_quantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La cantidad comprada es requerida para entradas por compra.",
        path: ["total_purchase_quantity"],
      });
    }
  } else if (data.movement_type === "reception_in" || data.movement_type === "adjustment_in" || data.movement_type === "adjustment_out") { // NEW: Include reception_in
    if (data.quantity_change === undefined || data.quantity_change <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La cantidad de cambio es requerida para este tipo de movimiento.",
        path: ["quantity_change"],
      });
    }
  }
});

interface StockMovementFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const StockMovementForm: React.FC<StockMovementFormProps> = ({ onSuccess, onCancel }) => {
  const addMutation = useAddStockMovement();
  const { data: availableInsumosData, isLoading: isLoadingInsumos } = useInsumos(); // Renamed to availableInsumosData

  const form = useForm<StockMovementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insumo_id: "",
      movement_type: "purchase_in",
      quantity_change: 0,
      total_purchase_amount: 0,
      total_purchase_quantity: 0,
      notes: "",
    },
  });

  const movementType = form.watch("movement_type");
  const selectedInsumoId = form.watch("insumo_id");
  const selectedInsumo = availableInsumosData?.data.find((insumo: Insumo) => insumo.id === selectedInsumoId); // Access .data and type insumo
  const purchaseUnit = selectedInsumo?.purchase_unit || "unidad";

  useEffect(() => {
    // Reset form fields when it's opened or closed, or when movement type changes
    form.reset({
      insumo_id: "",
      movement_type: movementType, // Keep current movement type
      quantity_change: 0,
      total_purchase_amount: 0,
      total_purchase_quantity: 0,
      notes: "",
    });
  }, [form, movementType]); // Depend on movementType to reset relevant fields

  const onSubmit = async (values: StockMovementFormValues) => {
    // Ensure quantity_change is correctly set for non-purchase_in movements
    const submitValues: StockMovementFormValues = {
      ...values,
      quantity_change: values.movement_type === "purchase_in" ? values.total_purchase_quantity! : values.quantity_change!,
    };

    await addMutation.mutateAsync(submitValues);
    onSuccess();
  };

  const isLoading = addMutation.isPending || isLoadingInsumos;

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
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona un insumo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableInsumosData?.data.map((insumo: Insumo) => ( // Access .data and type insumo
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
          name="movement_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Tipo de Movimiento</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="purchase_in">Entrada por Compra (Almacén)</SelectItem> {/* Clarified text */}
                  <SelectItem value="reception_in">Recepción por Empresa</SelectItem> {/* NEW: Reception by company */}
                  <SelectItem value="adjustment_in">Ajuste de Entrada</SelectItem>
                  <SelectItem value="adjustment_out">Ajuste de Salida</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {movementType === "purchase_in" ? (
          <>
            <FormField
              control={form.control}
              name="total_purchase_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Monto Total de la Compra (S/)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ej. 100.00"
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
              name="total_purchase_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad Comprada {selectedInsumoId && `(en ${purchaseUnit})`}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ej. 20"
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
          </>
        ) : (
          <FormField
            control={form.control}
            name="quantity_change"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad de Cambio {selectedInsumoId && `(en ${purchaseUnit})`}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ej. 50"
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalles adicionales sobre el movimiento..."
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
            Registrar Movimiento
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StockMovementForm;