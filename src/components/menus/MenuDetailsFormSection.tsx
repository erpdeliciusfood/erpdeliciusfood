import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { format, parse } from "date-fns"; // MODIFICADO: Añadir 'parse'
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EventType, MenuFormValues, Menu } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MenuDetailsFormSectionProps {
  isLoading: boolean;
  preselectedDate?: Date;
  initialData?: Menu | null;
  availableEventTypes?: EventType[];
}

const MenuDetailsFormSection: React.FC<MenuDetailsFormSectionProps> = ({
  isLoading,
  preselectedDate,
  initialData,
  availableEventTypes,
}) => {
  const { control, watch, setValue } = useFormContext<MenuFormValues & { menu_type: "daily" | "event" }>();
  const menuType = watch("menu_type");
  const menuDate = watch("menu_date");

  // Effect for auto-titling daily menus
  useEffect(() => {
    if (menuType === "daily" && menuDate) {
      const formattedDate = format(new Date(menuDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
      // Only update if the title is different to prevent unnecessary re-renders
      if (watch("title") !== formattedDate) {
        setValue("title", formattedDate, { shouldValidate: true });
      }
    }
    // No action for 'event' type here, as its title is manually managed.
  }, [menuType, menuDate, setValue, watch]);

  useEffect(() => {
    if (preselectedDate && !initialData) {
      setValue("menu_type", "daily");
      setValue("menu_date", format(preselectedDate, "yyyy-MM-dd"));
    }
  }, [preselectedDate, initialData, setValue]);

  const eventTypePlaceholder = () => {
    if (isLoading) return "Cargando tipos de evento...";
    if (!availableEventTypes || availableEventTypes.length === 0) return "No hay tipos de evento disponibles";
    return "Selecciona un tipo de evento";
  };

  return (
    <Card className="p-4 shadow-sm">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-semibold">Detalles del Menú</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-4">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Menú</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Menú Semanal Estándar" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Breve descripción del menú..."
                  {...field}
                  value={field.value || ""}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="menu_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Menú</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
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
            control={control}
            name="menu_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha del Menú</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
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
                      selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
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
            control={control}
            name="event_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Evento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
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

        <FormField
          control={control}
          name="diner_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad de Comensales</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 100"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default MenuDetailsFormSection;