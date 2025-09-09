import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Import Spanish locale
import { Menu, MenuFormValues, Plato, MealService, EventType } from "@/types";
import { useAddMenu, useUpdateMenu } from "@/hooks/useMenus";
import { usePlatos } from "@/hooks/usePlatos";
import { useMealServices } from "@/hooks/useMealServices";
import { useEventTypes } from "@/hooks/useEventTypes";
import { Loader2, PlusCircle, Trash2, CalendarIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  menu_date: z.string().nullable(), // Storing as string for form, will convert to Date for API
  event_type_id: z.string().nullable(),
  platos_por_servicio: z.array(
    z.object({
      meal_service_id: z.string().min(1, { message: "Debe seleccionar un servicio de comida." }),
      plato_id: z.string().min(1, { message: "Debe seleccionar un plato." }),
      quantity_needed: z.coerce.number().min(1, {
        message: "La cantidad debe ser al menos 1.",
      }).max(999, {
        message: "La cantidad no debe exceder 999.",
      }),
    })
  ).min(1, { message: "Debe añadir al menos un plato por servicio al menú." }),
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
});

interface MenuFormProps {
  initialData?: Menu | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddMenu();
  const updateMutation = useUpdateMenu();

  const { data: availablePlatos, isLoading: isLoadingPlatos } = usePlatos();
  const { data: availableMealServices, isLoading: isLoadingMealServices } = useMealServices();
  const { data: availableEventTypes, isLoading: isLoadingEventTypes } = useEventTypes();

  const form = useForm<MenuFormValues & { menu_type: "daily" | "event" }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      menu_type: "daily",
      menu_date: null,
      event_type_id: null,
      platos_por_servicio: [{ meal_service_id: "", plato_id: "", quantity_needed: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "platos_por_servicio",
  });

  const menuType = form.watch("menu_type");

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        menu_type: initialData.menu_date ? "daily" : "event",
        menu_date: initialData.menu_date || null,
        event_type_id: initialData.event_type_id || null,
        platos_por_servicio: initialData.menu_platos?.map(mp => ({
          meal_service_id: mp.meal_service_id,
          plato_id: mp.plato_id,
          quantity_needed: mp.quantity_needed,
        })) || [{ meal_service_id: "", plato_id: "", quantity_needed: 1 }],
      });
    } else {
      form.reset({
        title: "",
        description: "",
        menu_type: "daily",
        menu_date: null,
        event_type_id: null,
        platos_por_servicio: [{ meal_service_id: "", plato_id: "", quantity_needed: 1 }],
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: MenuFormValues & { menu_type: "daily" | "event" }) => {
    const submitValues: MenuFormValues = {
      title: values.title,
      description: values.description,
      platos_por_servicio: values.platos_por_servicio,
      menu_date: values.menu_type === "daily" ? values.menu_date : null,
      event_type_id: values.menu_type === "event" ? values.event_type_id : null,
    };

    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, menu: submitValues });
    } else {
      await addMutation.mutateAsync(submitValues);
    }
    onSuccess();
  };

  const isLoading = addMutation.isPending || updateMutation.isPending || isLoadingPlatos || isLoadingMealServices || isLoadingEventTypes;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Título del Menú</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Menú del Día / Menú Coffee Break"
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
                  placeholder="Una breve descripción del menú..."
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

        <FormField
          control={form.control}
          name="menu_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Tipo de Menú</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                  disabled={isLoading}
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="daily" />
                    </FormControl>
                    <FormLabel className="font-normal">Menú Diario</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="event" />
                    </FormControl>
                    <FormLabel className="font-normal">Menú de Evento</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {menuType === "daily" && (
          <FormField
            control={form.control}
            name="menu_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Fecha del Menú</FormLabel>
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
                      onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                      disabled={(date) =>
                        date < new Date("1900-01-01") || isLoading
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
        )}

        {menuType === "event" && (
          <FormField
            control={form.control}
            name="event_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Tipo de Evento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ""}
                  disabled={isLoading || isLoadingEventTypes}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona un tipo de evento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableEventTypes?.map((eventType: EventType) => (
                      <SelectItem key={eventType.id} value={eventType.id}>
                        {eventType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Platos por Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row gap-4 items-end border-b pb-4 last:border-b-0 last:pb-0">
                <FormField
                  control={form.control}
                  name={`platos_por_servicio.${index}.meal_service_id`}
                  render={({ field: serviceField }) => (
                    <FormItem className="flex-grow w-full md:w-1/3">
                      <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Servicio</FormLabel>
                      <Select
                        onValueChange={serviceField.onChange}
                        defaultValue={serviceField.value}
                        disabled={isLoading || isLoadingMealServices}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecciona un servicio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableMealServices?.map((service: MealService) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
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
                  name={`platos_por_servicio.${index}.plato_id`}
                  render={({ field: platoField }) => (
                    <FormItem className="flex-grow w-full md:w-1/3">
                      <FormLabel className={index === 0 ? "text-base font-semibold text-gray-800 dark:text-gray-200" : "sr-only"}>Plato</FormLabel>
                      <Select
                        onValueChange={platoField.onChange}
                        defaultValue={platoField.value}
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
                              {plato.nombre}
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
                  name={`platos_por_servicio.${index}.quantity_needed`}
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
              onClick={() => append({ meal_service_id: "", plato_id: "", quantity_needed: 1 })}
              className="w-full mt-4 px-6 py-3 text-lg"
              disabled={isLoading}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Añadir Plato a Servicio
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
            {initialData ? "Guardar Cambios" : "Crear Menú"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MenuForm;