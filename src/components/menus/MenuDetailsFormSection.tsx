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
import { EventType, MenuFormValues, Menu } from "@/types";
import { useEventTypes } from "@/hooks/useEventTypes"; // Import useEventTypes

interface MenuDetailsFormSectionProps {
  isLoading: boolean;
  preselectedDate?: Date;
  initialData?: Menu | null;
}

const MenuDetailsFormSection: React.FC<MenuDetailsFormSectionProps> = ({ isLoading, preselectedDate, initialData }) => {
  const form = useFormContext<MenuFormValues & { menu_type: "daily" | "event" }>();
  const { data: availableEventTypes, isLoading: isLoadingEventTypes } = useEventTypes(); // Fetch here

  const menuType = form.watch("menu_type");
  const menuDate = form.watch("menu_date");

  // Effect for auto-titling daily menus
  useEffect(() => {
    if (menuType === "daily" && menuDate) {
      const formattedDate = format(new Date(menuDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
      form.setValue("title", formattedDate, { shouldValidate: true });
    } else if (menuType === "event") {
      if (initialData && initialData.menu_date && !initialData.event_type_id) {
        form.setValue("title", "", { shouldValidate: true });
      } else if (!initialData && menuDate) {
        form.setValue("title", "", { shouldValidate: true });
      }
    }
  }, [menuType, menuDate, form, initialData]);

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
                disabled={isLoading || menuType === "daily"}
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
                    form.setValue("event_type_id", null);
                    form.setValue("menu_date", preselectedDate ? formatISO(preselectedDate, { representation: 'date' }) : null);
                  } else {
                    form.setValue("menu_date", null);
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
    </>
  );
};

export default MenuDetailsFormSection;