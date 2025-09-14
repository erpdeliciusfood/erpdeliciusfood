"use client";

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
import { Supplier, SupplierFormValues } from "@/types";
import { useAddSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "El nombre no debe exceder los 100 caracteres.",
  }),
  contact_person: z.string().max(100, {
    message: "El nombre de la persona de contacto no debe exceder los 100 caracteres.",
  }).nullable(),
  phone: z.string().nullable().refine((val) => {
    if (!val) return true; // Allow null or empty string
    // Regex for +51 followed by 9 digits
    return /^\+51\d{9}$/.test(val);
  }, {
    message: "El teléfono debe empezar con +51 y tener 9 dígitos (ej. +51987654321).",
  }),
  email: z.string().email({ message: "Debe ser un correo electrónico válido." }).max(100, {
    message: "El correo electrónico no debe exceder los 100 caracteres.",
  }).nullable(),
  address: z.string().max(255, {
    message: "La dirección no debe exceder los 255 caracteres.",
  }).nullable(),
});

interface SupplierFormProps {
  initialData?: Supplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddSupplier();
  const updateMutation = useUpdateSupplier();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        contact_person: initialData.contact_person || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
      });
    } else {
      form.reset({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: SupplierFormValues) => {
    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, supplier: values });
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Proveedor</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Distribuidora La Huerta"
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
          name="contact_person"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Persona de Contacto (Opcional)</FormLabel>
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Teléfono (Opcional)</FormLabel>
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Email (Opcional)</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Ej. contacto@lahuerta.com"
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Dirección (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej. Av. Los Girasoles 123, Lima"
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
            {initialData ? "Guardar Cambios" : "Añadir Proveedor"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SupplierForm;