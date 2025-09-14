import React from "react";
import { useFormContext } from "react-hook-form";
import {
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, formatISO, parseISO } from "date-fns"; // Importar parseISO
import { es } from "date-fns/locale";
import { PurchaseRecordFormValues } from "@/types";
import { CalendarIcon } from "lucide-react";

interface StatusAndReceivedDateFormSectionProps {
  isLoading: boolean;
}

const StatusAndReceivedDateFormSection: React.FC<StatusAndReceivedDateFormSectionProps> = ({
  isLoading,
}) => {
  const form = useFormContext<PurchaseRecordFormValues>();
  const currentStatus = form.watch("status");

  return (
    <>
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Estado de la Compra</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="ordered">Ordenado</SelectItem>
                <SelectItem value="received_by_company">Recibido por Empresa</SelectItem>
                <SelectItem value="received_by_warehouse">Recibido en Almacén</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {(currentStatus === 'received_by_company' || currentStatus === 'received_by_warehouse') && (
        <FormField
          control={form.control}
          name="received_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Fecha de Recepción</FormLabel>
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
                        format(parseISO(field.value), "PPP", { locale: es }) // Usar parseISO aquí
                      ) : (
                        <span>Selecciona una fecha de recepción</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parseISO(field.value) : undefined} // Usar parseISO aquí
                    onSelect={(date) => field.onChange(date ? formatISO(date, { representation: 'date' }) : null)}
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
      )}
    </>
  );
};

export default StatusAndReceivedDateFormSection;