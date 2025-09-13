import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventType, MenuFormValues } from "@/types"; // Removed Menu
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MenuDetailsFormSectionProps {
  isLoading: boolean;
  availableEventTypes: EventType[] | undefined;
}

const MenuDetailsFormSection: React.FC<MenuDetailsFormSectionProps> = ({
  isLoading,
  availableEventTypes,
}) => {
  const form = useFormContext<MenuFormValues>();

  const eventTypePlaceholder = () => {
    if (isLoading) return "Cargando tipos de evento...";
    if (!availableEventTypes || availableEventTypes.length === 0) return "No hay tipos de evento disponibles";
    return "Selecciona un tipo de evento";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Detalles del Menú</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Título del Menú</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Menú Semanal Saludable"
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
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej. Menú diseñado para una dieta balanceada..."
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
                    <FormLabel className="font-normal">
                      Menú Diario
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="event" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Menú para Evento
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("menu_type") === "daily" && (
          <FormField
            control={form.control}
            name="menu_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Fecha del Menú</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Input
                        placeholder="Selecciona una fecha"
                        className={cn(
                          "w-full pl-3 text-left font-normal h-12 text-base",
                          !field.value && "text-muted-foreground"
                        )}
                        value={field.value ? format(field.value, "PPP", { locale: es }) : ""}
                        readOnly
                        disabled={isLoading}
                      />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("menu_type") === "event" && (
          <FormField
            control={form.control}
            name="event_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Tipo de Evento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ""}
                  disabled={isLoading || !availableEventTypes || availableEventTypes.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder={eventTypePlaceholder()} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableEventTypes?.map((eventType) => (
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
      </CardContent>
    </Card>
  );
};

export default MenuDetailsFormSection;