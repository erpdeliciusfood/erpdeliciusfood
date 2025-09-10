import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { format, formatISO } from "date-fns";
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
import { EventType, type MenuFormValues, Menu } from "@/types"; // Changed to type import

interface MenuDetailsFormSectionProps {
  isLoading: boolean;
  preselectedDate?: Date;
  initialData?: Menu | null;
  availableEventTypes: EventType[] | undefined;
}

const MenuDetailsFormSection: React.FC<MenuDetailsFormSectionProps> = ({ isLoading, preselectedDate, initialData, availableEventTypes }) => {
  const form = useFormContext<MenuFormValues & { menu_type: "daily" | "event" }>();

  const menuType = form.watch("menu_type");
  const menuDate = form.watch("menu_date");

  // Effect for auto-titling daily menus
  useEffect(() => {
    if (menuType === "daily" && menuDate) {
      const formattedDate = format(new Date(menuDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
      // Only update if the title is different to prevent unnecessary re-renders
      if (form.getValues("title") !== formattedDate) {
        form.setValue("title", formattedDate, { shouldValidate: true });
      }
    }
    // No action for 'event' type here, as its title is manually managed.
  }, [menuType, menuDate, form]);

  const eventTypePlaceholder = () => {
    if (isLoading) return "Cargando tipos de evento...";
    if (!availableEventTypes || availableEventTypes.length === 0) return "No hay tipos de evento disponibles";
    return "Selecciona un tipo de evento";
  };

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Título del Menú</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej. Menú Coffee Break"
                {...field}
                className="h-12 text-base"
                disabled={isLoading || menuType === "daily"} // Disable title input for daily menus
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
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value === "daily") {
                    form.setValue("event_type_id", null); // Clear event type ID
                    const newMenuDate = preselectedDate ? formatISO(preselectedDate, { representation: 'date' }) : null;
                    form.setValue("menu_date", newMenuDate); // Set menu date
                    // Auto-generate title if it's a new menu or if the title is currently empty
                    if (!initialData || !form.getValues("title")) {
                      if (newMenuDate) {
                        const newTitle = format(new Date(newMenuDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
                        form.setValue("title", newTitle, { shouldValidate: true });
                      }
                    }
                  } else { // value === "event"
                    form.setValue("menu_date", null); // Clear menu date
                    // Do NOT clear title here. It should be manually entered for event menus.
                  }
                }}
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
                    onSelect={(date) => field.onChange(date ? formatISO(date, { representation: 'date' }) : null)}
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
                disabled={isLoading || !availableEventTypes || availableEventTypes.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder={eventTypePlaceholder()} />
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
    </>
  );
};

export default MenuDetailsFormSection;