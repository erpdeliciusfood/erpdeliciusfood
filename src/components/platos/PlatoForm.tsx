"use client";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plato, PlatoFormValues } from "@/types";
import { useAddPlato, useUpdatePlato } from "@/hooks/usePlatos";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2, PlusCircle, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "El nombre no debe exceder los 100 caracteres.",
  }),
  descripcion: z.string().max(500, {
    message: "La descripción no debe exceder los 500 caracteres.",
  }).nullable(),
  insumos: z.array(
    z.object({
      insumo_id: z.string().min(1, { message: "Debe seleccionar un insumo." }),
      cantidad_necesaria: z.coerce.number().min(0.01, {
        message: "La cantidad debe ser mayor a 0.",
      }).max(99999.99, {
        message: "La cantidad no debe exceder 99999.99.",
      }),
    })
  ).min(1, { message: "Debe añadir al menos un insumo al plato." }),
});

interface PlatoFormProps {
  initialData?: Plato | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const PlatoForm: React.FC<PlatoFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddPlato();
  const updateMutation = useUpdatePlato();
  // Fetch all insumos for the combobox, without pagination
  const { data: availableInsumosData, isLoading: isLoadingInsumos } = useInsumos(undefined, undefined, 1, 9999); 
  const availableInsumos = availableInsumosData?.data || [];

  const form = useForm<PlatoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      insumos: [{ insumo_id: "", cantidad_necesaria: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "insumos",
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nombre: initialData.nombre,
        descripcion: initialData.descripcion || "",
        insumos: initialData.plato_insumos?.map(pi => ({
          insumo_id: pi.insumo_id,
          cantidad_necesaria: pi.cantidad_necesaria,
        })) || [{ insumo_id: "", cantidad_necesaria: 0 }],
      });
    } else {
      form.reset({
        nombre: "",
        descripcion: "",
        insumos: [{ insumo_id: "", cantidad_necesaria: 0 }],
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: PlatoFormValues) => {
    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, plato: values });
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
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Plato</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Lomo Saltado"
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
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Descripción</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Jugoso lomo fino salteado con cebolla y tomate..."
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

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Insumos del Plato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row gap-4 items-end p-4 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700/30"> {/* Added styling for visual separation */}
                <FormField
                  control={form.control}
                  name={`insumos.${index}.insumo_id`}
                  render={({ field: insumoField }) => (
                    <FormItem className="flex-grow w-full">
                      <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Insumo</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between h-12 text-base",
                                !insumoField.value && "text-muted-foreground"
                              )}
                              disabled={isLoading || isLoadingInsumos}
                            >
                              {insumoField.value
                                ? availableInsumos.find(
                                    (insumo) => insumo.id === insumoField.value
                                  )?.nombre
                                : "Selecciona un insumo"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar insumo..." />
                            <CommandEmpty>No se encontró el insumo.</CommandEmpty>
                            <CommandGroup>
                              {availableInsumos.map((insumo) => (
                                <CommandItem
                                  value={insumo.nombre}
                                  key={insumo.id}
                                  onSelect={() => {
                                    insumoField.onChange(insumo.id);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      insumo.id === insumoField.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {insumo.nombre} ({insumo.base_unit})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`insumos.${index}.cantidad_necesaria`}
                  render={({ field: cantidadField }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Cantidad"
                          {...cantidadField}
                          onChange={(e) => cantidadField.onChange(parseFloat(e.target.value))}
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
                  disabled={isLoading || fields.length === 1}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ insumo_id: "", cantidad_necesaria: 0 })}
              className="w-full mt-4 px-6 py-3 text-lg"
              disabled={isLoading || availableInsumos.length === 0}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Añadir Insumo
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
            {initialData ? "Guardar Cambios" : "Añadir Plato"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PlatoForm;