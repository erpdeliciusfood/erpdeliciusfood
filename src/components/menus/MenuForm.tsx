import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { Menu, MenuFormValues } from "@/types";
import { useCreateMenu } from "@/hooks/menus/useCreateMenu";
import { useUpdateMenu } from "@/hooks/menus/useUpdateMenu";
import { useRecetas } from "@/hooks/useRecetas";
import { useMealServices } from "@/hooks/useMealServices";
import { useEventTypes } from "@/hooks/useEventTypes";
import { Loader2 } from "lucide-react";
import MenuDetailsFormSection from "./MenuDetailsFormSection";
import PlatosPorServicioFormSection from "./PlatosPorServicioFormSection";
import { formatISO } from "date-fns";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "El título debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "El título no debe exceder los 100 caracteres.",
  }),
  description: z.string().max(500, {
    message: "La descripción no debe exceder los 500 caracteres.",
  }).nullable(),
  menu_type: z.enum(["daily", "event"], {
    required_error: "Debe seleccionar un tipo de menú.",
  }),
  menu_date: z.string().nullable(),
  event_type_id: z.string().nullable(),
  platos_por_servicio: z.array(
    z.object({
      meal_service_id: z.string().min(1, { message: "Debe seleccionar un servicio de comida." }),
      receta_id: z.string().min(1, { message: "Debe seleccionar una receta." }), // Corrected property name
      dish_category: z.string().min(1, { message: "Debe seleccionar una categoría de receta." }),
      quantity_needed: z.coerce.number().min(1, {
        message: "La cantidad debe ser al menos 1.",
      }).max(999, {
        message: "La cantidad no debe exceder 999.",
      }),
    })
  ).min(1, { message: "Debe añadir al menos una receta por servicio al menú." }),
}).superRefine((data, ctx) => {
  if (data.menu_type === "daily" && !data.menu_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha del menú es requerida para menús diarios.",
      path: ["menu_date"],
    });
  }
  if (data.menu_type === "event" && !data.event_type_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El tipo de evento es requerido para menús de evento.",
      path: ["event_type_id"],
    });
  }

  // Custom validation for duplicate receta_id, meal_service_id, and dish_category combinations
  const seenCombinations = new Set<string>();
  data.platos_por_servicio.forEach((platoServicio, index) => {
    const combinationKey = `${platoServicio.meal_service_id}-${platoServicio.receta_id}-${platoServicio.dish_category}`; // Corrected property name
    if (seenCombinations.has(combinationKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Esta receta ya está asignada a este servicio y categoría. Por favor, selecciona una combinación única.",
        path: [`platos_por_servicio.${index}.receta_id`], // Corrected property name
      });
    }
    seenCombinations.add(combinationKey);
  });
});

interface MenuFormProps {
  initialData?: Menu | null;
  onSuccess: () => void;
  onCancel: () => void;
  preselectedDate?: Date;
}

const MenuForm: React.FC<MenuFormProps> = ({ initialData, onSuccess, onCancel, preselectedDate }) => {
  const addMutation = useCreateMenu(); // Updated hook
  const updateMutation = useUpdateMenu(); // Updated hook

  // Fetch all necessary data here
  const { data: availableRecetas, isLoading: isLoadingRecetas } = useRecetas();
  const { data: availableMealServices, isLoading: isLoadingMealServices } = useMealServices();
  const { data: availableEventTypes, isLoading: isLoadingEventTypes } = useEventTypes();

  const form = useForm<MenuFormValues & { menu_type: "daily" | "event" }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      menu_type: preselectedDate ? "daily" : "event", // Dynamically set default menu_type
      menu_date: preselectedDate ? formatISO(preselectedDate, { representation: 'date' }) : null,
      event_type_id: null,
      platos_por_servicio: [{ meal_service_id: "", receta_id: "", dish_category: "", quantity_needed: 1 }], // Corrected property name
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        menu_type: initialData.date ? "daily" : "event", // Corrected property access
        menu_date: initialData.date || null, // Corrected property access
        event_type_id: initialData.event_type_id || null,
        platos_por_servicio: initialData.menu_platos?.map(mp => ({
          meal_service_id: mp.meal_service_id,
          receta_id: mp.receta_id, // Corrected property name
          dish_category: mp.dish_category,
          quantity_needed: mp.quantity_needed,
        })) || [{ meal_service_id: "", receta_id: "", dish_category: "", quantity_needed: 1 }], // Corrected property name
      });
    } else {
      form.reset({
        title: "",
        description: "",
        menu_type: preselectedDate ? "daily" : "event", // Dynamically set default menu_type
        menu_date: preselectedDate ? formatISO(preselectedDate, { representation: 'date' }) : null,
        event_type_id: null,
        platos_por_servicio: [{ meal_service_id: "", receta_id: "", dish_category: "", quantity_needed: 1 }], // Corrected property name
      });
    }
  }, [initialData, form, preselectedDate]);

  const onSubmit = async (values: MenuFormValues & { menu_type: "daily" | "event" }) => {
    const submitValues: MenuFormValues = {
      title: values.title,
      description: values.description,
      platos_por_servicio: values.platos_por_servicio,
      menu_date: values.menu_type === "daily" && values.menu_date ? values.menu_date : null,
      event_type_id: values.menu_type === "event" && values.event_type_id ? values.event_type_id : null,
      menu_type: values.menu_type,
    };

    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, menu: submitValues });
    } else {
      await addMutation.mutateAsync(submitValues);
    }
    onSuccess();
  };

  // Calculate overall loading state
  const isLoading = addMutation.isPending || updateMutation.isPending || isLoadingRecetas || isLoadingMealServices || isLoadingEventTypes;

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <MenuDetailsFormSection
            isLoading={isLoading}
            preselectedDate={preselectedDate}
            initialData={initialData}
            availableEventTypes={availableEventTypes}
          />

          <PlatosPorServicioFormSection
            isLoading={isLoading}
            availablePlatos={availableRecetas}
            availableMealServices={availableMealServices}
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
              {initialData ? "Guardar Cambios" : "Crear Menú"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default MenuForm;