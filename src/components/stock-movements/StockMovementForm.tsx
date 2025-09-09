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
  movement_type: z.enum(["purchase_in", "adjustment_in", "adjustment_out"], {
    required_error: "Debe seleccionar un tipo de movimiento.",
  }),
  quantity_change: z.coerce.number().min(0.01, {
    message: "La cantidad de cambio debe ser mayor a 0.",
  }).max(999999.99, {
    message: "La cantidad de cambio no debe exceder 999999.99.",
  }),
  notes: z.string().max(500, {
    message: "Las notas no deben exceder los 500 caracteres.",
  }).nullable(),
});

interface StockMovementFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const StockMovementForm: React.FC<StockMovementFormProps> = ({ onSuccess, onCancel }) => {
  const addMutation = useAddStockMovement();
  const { data: availableInsumos, isLoading: isLoadingInsumos } = useInsumos();

  const form = useForm<StockMovementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insumo_id: "",
      movement_type: "purchase_in",
      quantity_change: 0,
      notes: "",
    },
  });

  useEffect(() => {
    // Reset form when it's opened or closed
    form.reset({
      insumo_id: "",
      movement_type: "purchase_in",
      quantity_change: 0,
      notes: "",
    });
  }, [form]);

  const onSubmit = async (values: StockMovementFormValues) => {
    await addMutation.mutateAsync(values);
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
                  <SelectItem value="purchase_in">Entrada por Compra</SelectItem>
                  <SelectItem value="adjustment_in">Ajuste de Entrada</SelectItem>
                  <SelectItem value="adjustment_out">Ajuste de Salida</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity_change"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad de Cambio (en Unidad de Compra)</FormLabel>
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