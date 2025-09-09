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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ServiceReport, ServiceReportFormValues, MealService } from "@/types";
import { useAddServiceReport, useUpdateServiceReport } from "@/hooks/useServiceReports";
import { useMealServices } from "@/hooks/useMealServices";
import { Loader2, CalendarIcon } from "lucide-react";

const formSchema = z.object({
  report_date: z.string().min(1, { message: "La fecha del reporte es requerida." }),
  meal_service_id: z.string().min(1, { message: "Debe seleccionar un servicio de comida." }),
  tickets_issued: z.coerce.number().min(0, { message: "Los tickets emitidos no pueden ser negativos." }).int({ message: "Los tickets emitidos deben ser un número entero." }),
  meals_sold: z.coerce.number().min(0, { message: "Las colaciones vendidas no pueden ser negativas." }).int({ message: "Las colaciones vendidas deben ser un número entero." }),
  additional_services_revenue: z.coerce.number().min(0, { message: "Los ingresos adicionales no pueden ser negativos." }).max(999999.99, { message: "Los ingresos adicionales no deben exceder 999999.99." }),
  notes: z.string().max(500, { message: "Las notas no deben exceder los 500 caracteres." }).nullable(),
});

interface ServiceReportFormProps {
  initialData?: ServiceReport | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ServiceReportForm: React.FC<ServiceReportFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const addMutation = useAddServiceReport();
  const updateMutation = useUpdateServiceReport();
  const { data: availableMealServices, isLoading: isLoadingMealServices } = useMealServices();

  const form = useForm<ServiceReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report_date: format(new Date(), "yyyy-MM-dd"),
      meal_service_id: "",
      tickets_issued: 0,
      meals_sold: 0,
      additional_services_revenue: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        report_date: initialData.report_date,
        meal_service_id: initialData.meal_service_id,
        tickets_issued: initialData.tickets_issued,
        meals_sold: initialData.meals_sold,
        additional_services_revenue: initialData.additional_services_revenue,
        notes: initialData.notes || "",
      });
    } else {
      form.reset({
        report_date: format(new Date(), "yyyy-MM-dd"),
        meal_service_id: "",
        tickets_issued: 0,
        meals_sold: 0,
        additional_services_revenue: 0,
        notes: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: ServiceReportFormValues) => {
    if (initialData) {
      await updateMutation.mutateAsync({ id: initialData.id, report: values });
    } else {
      await addMutation.mutateAsync(values);
    }
    onSuccess();
  };

  const isLoading = addMutation.isPending || updateMutation.isPending || isLoadingMealServices;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
        <FormField
          control={form.control}
          name="report_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Fecha del Reporte</FormLabel>
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
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
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
          name="meal_service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Servicio de Comida</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
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
          name="tickets_issued"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Tickets Emitidos</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  placeholder="Ej. 150"
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
          name="meals_sold"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Colaciones Vendidas</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  placeholder="Ej. 120"
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
          name="additional_services_revenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Ingresos Servicios Adicionales (S/)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ej. 50.00"
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
                  placeholder="Cualquier observación relevante sobre el servicio..."
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
            {initialData ? "Guardar Cambios" : "Crear Reporte"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceReportForm;