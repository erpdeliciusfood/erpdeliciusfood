import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, OrderFormValues, Plato } from "@/types";
import { useAddOrder, useUpdateOrder } from "@/hooks/useOrders";
import { usePlatos } from "@/hooks/usePlatos";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";

const formSchema = z.object({
  customer_name: z.string().max(100, {
    message: "El nombre del cliente no debe exceder los 100 caracteres.",
  }).nullable(),
  status: z.enum(['pending', 'completed', 'cancelled'], {
    required_error: "El estado del pedido es requerido.",
  }),
  items: z.array(
    z.object({
      plato_id: z.string().min(1, { message: "Debe seleccionar un plato." }),
      quantity: z.coerce.number().min(1, {
        message: "La cantidad debe ser al menos 1.",
      }).max(999, {
        message: "La cantidad no debe exceder 999.",
      }),
      price_at_order: z.coerce.number().min(0.01, {
        message: "El precio debe ser mayor a 0.",
      }).max(99999.99, {
        message: "El precio no debe exceder 99999.99.",
      }),
    })
  ).min(1, { message: "Debe añadir al menos un plato al pedido." }),
});

interface OrderFormProps {
  initialData?: Order | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddOrder();
  const updateMutation = useUpdateOrder();
  const { data: availablePlatos, isLoading: isLoadingPlatos } = usePlatos();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: "",
      status: "pending",
      items: [{ plato_id: "", quantity: 1, price_at_order: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        customer_name: initialData.customer_name || "",
        status: initialData.status,
        items: initialData.order_items?.map(oi => ({
          plato_id: oi.plato_id,
          quantity: oi.quantity,
          price_at_order: oi.price_at_order,
        })) || [{ plato_id: "", quantity: 1, price_at_order: 0 }],
      });
    } else {
      form.reset({
        customer_name: "",
        status: "pending",
        items: [{ plato_id: "", quantity: 1, price_at_order: 0 }],
      });
    }
  }, [initialData, form]);

  const handlePlatoChange = (index: number, platoId: string) => {
    const selectedPlato = availablePlatos?.find(plato => plato.id === platoId);
    if (selectedPlato) {
      form.setValue(`items.${index}.price_at_order`, selectedPlato.precio_venta);
    }
    form.setValue(`items.${index}.plato_id`, platoId);
  };

  const onSubmit = async (values: OrderFormValues) => {
    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, order: values });
    } else {
      await addMutation.mutateAsync(values);
    }
    onSuccess();
  };

  const isLoading = addMutation.isPending || updateMutation.isPending || isLoadingPlatos;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Cliente (Opcional)</FormLabel>
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
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Estado del Pedido</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Platos del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row gap-4 items-end border-b pb-4 last:border-b-0 last:pb-0">
                <FormField
                  control={form.control}
                  name={`items.${index}.plato_id`}
                  render={({ field: platoItemField }) => (
                    <FormItem className="flex-grow w-full">
                      <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Plato</FormLabel>
                      <Select
                        onValueChange={(value) => handlePlatoChange(index, value)}
                        value={platoItemField.value}
                        disabled={isLoading || isLoadingPlatos}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecciona un plato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availablePlatos?.map((plato: Plato) => (
                            <SelectItem key={plato.id} value={plato.id}>
                              {plato.nombre} (S/ {plato.precio_venta.toFixed(2)})
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
                  name={`items.${index}.quantity`}
                  render={({ field: quantityField }) => (
                    <FormItem className="w-full md:w-1/4">
                      <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="Cantidad"
                          {...quantityField}
                          onChange={(e) => quantityField.onChange(parseInt(e.target.value))}
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
                  name={`items.${index}.price_at_order`}
                  render={({ field: priceField }) => (
                    <FormItem className="w-full md:w-1/4">
                      <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Precio Unitario (S/)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Precio"
                          {...priceField}
                          onChange={(e) => priceField.onChange(parseFloat(e.target.value))}
                          className="h-12 text-base"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  className="h-10 w-10 flex-shrink-0"
                  disabled={isLoading || fields.length === 1} // Disable if only one item
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ plato_id: "", quantity: 1, price_at_order: 0 })}
              className="w-full mt-4 px-6 py-3 text-lg"
              disabled={isLoading}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Añadir Plato
            </Button>
          </CardContent>
        </Card>

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
            {initialData ? "Guardar Cambios" : "Crear Pedido"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrderForm;