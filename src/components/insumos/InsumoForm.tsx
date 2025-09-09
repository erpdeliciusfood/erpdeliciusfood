import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Insumo, InsumoFormValues } from "@/types";
import { useAddInsumo, useUpdateInsumo } from "@/hooks/useInsumos";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }).max(50, {
    message: "El nombre no debe exceder los 50 caracteres.",
  }),
  unidad_medida: z.string().min(1, {
    message: "Debe seleccionar una unidad de medida.",
  }),
  costo_unitario: z.coerce.number().min(0.01, {
    message: "El costo unitario debe ser mayor a 0.",
  }).max(99999.99, {
    message: "El costo unitario no debe exceder 99999.99.",
  }),
  stock_quantity: z.coerce.number().min(0, {
    message: "La cantidad de stock no puede ser negativa.",
  }).max(999999, {
    message: "La cantidad de stock no debe exceder 999999.",
  }),
  supplier_name: z.string().min(1, { // Made mandatory
    message: "El nombre del proveedor es requerido.",
  }).max(100, {
    message: "El nombre del proveedor no debe exceder los 100 caracteres.",
  }),
  supplier_phone: z.string().min(1, { // Made mandatory
    message: "El teléfono del proveedor es requerido.",
  }).max(20, {
    message: "El teléfono del proveedor no debe exceder los 20 caracteres.",
  }),
});

interface InsumoFormProps {
  initialData?: Insumo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const UNIDADES_MEDIDA = [
  "kg", "g", "litro", "ml", "unidad", "atado", "manojo", "caja", "paquete", "botella", "lata", "saco", "galón", "onza", "libra", "taza", "cucharada", "cucharadita"
];

const InsumoForm: React.FC<InsumoFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddInsumo();
  const updateMutation = useUpdateInsumo();

  const form = useForm<InsumoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      nombre: "",
      unidad_medida: "",
      costo_unitario: 0,
      stock_quantity: 0,
      supplier_name: "", // Changed to empty string for mandatory field
      supplier_phone: "", // Changed to empty string for mandatory field
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nombre: initialData.nombre,
        unidad_medida: initialData.unidad_medida,
        costo_unitario: initialData.costo_unitario,
        stock_quantity: initialData.stock_quantity,
        supplier_name: initialData.supplier_name || "", // Ensure it's a string
        supplier_phone: initialData.supplier_phone || "", // Ensure it's a string
      });
    } else {
      form.reset({
        nombre: "",
        unidad_medida: "",
        costo_unitario: 0,
        stock_quantity: 0,
        supplier_name: "",
        supplier_phone: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: InsumoFormValues) => {
    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, insumo: values });
    } else {
      await addMutation.mutateAsync(values);
    }
    onSuccess();
  };

  const isLoading = addMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Insumo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Papa Amarilla"
                  {...field}
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
          name="unidad_medida"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Unidad de Medida</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona una unidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UNIDADES_MEDIDA.map((unidad) => (
                    <SelectItem key={unidad} value={unidad}>
                      {unidad}
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
          name="costo_unitario"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Costo Unitario (S/)</FormLabel>
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
          name="stock_quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad en Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  placeholder="Ej. 100"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
          name="supplier_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Proveedor</FormLabel>
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
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Teléfono del Proveedor</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. +51 987 654 321"
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
            {initialData ? "Guardar Cambios" : "Añadir Insumo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InsumoForm;