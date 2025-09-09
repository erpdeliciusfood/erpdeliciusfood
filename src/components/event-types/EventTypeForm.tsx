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
import { EventType } from "@/types";
import { useAddEventType, useUpdateEventType } from "@/hooks/useEventTypes";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "El nombre no debe exceder los 100 caracteres.",
  }),
  description: z.string().max(500, {
    message: "La descripción no debe exceder los 500 caracteres.",
  }).nullable(),
});

interface EventTypeFormValues {
  name: string;
  description: string | null;
}

interface EventTypeFormProps {
  initialData?: EventType | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const EventTypeForm: React.FC<EventTypeFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddEventType();
  const updateMutation = useUpdateEventType();

  const form = useForm<EventTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: EventTypeFormValues) => {
    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, eventType: values });
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
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre del Tipo de Evento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Coffee Break"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Una breve descripción del tipo de evento..."
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
            {initialData ? "Guardar Cambios" : "Añadir Tipo de Evento"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventTypeForm;