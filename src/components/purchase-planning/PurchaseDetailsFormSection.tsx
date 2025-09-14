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
import { Insumo, PurchaseRecordFormValues } from "@/types";
import { CalendarIcon } from "lucide-react";

interface PurchaseDetailsFormSectionProps {
  isLoading: boolean;
  availableInsumos: Insumo[] | undefined;
  purchaseUnit: string;
  initialDataPresent: boolean;
  prefilledInsumoId?: string;
}

const PurchaseDetailsFormSection: React.FC<PurchaseDetailsFormSectionProps> = ({
  isLoading,
  availableInsumos,
  purchaseUnit,
  initialDataPresent,
  prefilledInsumoId,
}) => {
  const form = useFormContext<PurchaseRecordFormValues>();

  return (
    <>
      <FormField
        control={form.control}
        name="insumo_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Insumo</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoading || !availableInsumos || availableInsumos.length === 0 || initialDataPresent || !!prefilledInsumoId}
            >
              <FormControl>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecciona un insumo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableInsumos?.map((insumo: Insumo) => (
                  <SelectItem key={insumo.id} value={insumo.id}>
                    {insumo.nombre} ({insumo.purchase_unit})
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
        name="purchase_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Fecha de Compra</FormLabel>
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
                      <span>Selecciona una fecha</span>
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

      <FormField
        control={form.control}
        name="quantity_purchased"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Cantidad Comprada {form.watch("insumo_id") && `(en ${purchaseUnit})`}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 10.5"
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
        name="unit_cost_at_purchase"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Costo Unitario de Compra (S/)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 2.50"
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
        name="total_amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Monto Total (S/)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 26.25"
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
    </>
  );
};

export default PurchaseDetailsFormSection;