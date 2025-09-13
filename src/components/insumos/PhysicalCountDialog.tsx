"use client";

import React, { useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // Corregido: de '*s z' a '* as z'
import { Insumo, InsumoFormValues } from "@/types";
import { useUpdateInsumo } from "@/hooks/useInsumos";
import { Loader2, CalendarIcon, AlertCircle } from "lucide-react";
import { format, formatISO } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";

const physicalCountSchema = z.object({
  last_physical_count_quantity: z.coerce.number().min(0, {
    message: "La cantidad contada no puede ser negativa.",
  }).max(999999, {
    message: "La cantidad contada no debe exceder 999999.",
  }),
  last_physical_count_date: z.string().min(1, {
    message: "La fecha del conteo físico es requerida.",
  }),
});

interface PhysicalCountDialogProps {
  insumo: Insumo;
  onClose: () => void;
}

const PhysicalCountDialog: React.FC<PhysicalCountDialogProps> = ({ insumo, onClose }) => {
  const updateInsumoMutation = useUpdateInsumo();

  const form = useForm<z.infer<typeof physicalCountSchema>>({
    resolver: zodResolver(physicalCountSchema),
    defaultValues: {
      last_physical_count_quantity: insumo.last_physical_count_quantity ?? 0,
      last_physical_count_date: insumo.last_physical_count_date || format(new Date(), "yyyy-MM-dd"),
    },
  });

  const currentPhysicalCount = form.watch("last_physical_count_quantity");
  const discrepancy = currentPhysicalCount - insumo.stock_quantity;

  useEffect(() => {
    form.reset({
      last_physical_count_quantity: insumo.last_physical_count_quantity ?? 0,
      last_physical_count_date: insumo.last_physical_count_date || format(new Date(), "yyyy-MM-dd"),
    });
  }, [insumo, form]);

  const onSubmit = async (values: z.infer<typeof physicalCountSchema>) => {
    try {
      const updatedInsumoData: InsumoFormValues = {
        nombre: insumo.nombre,
        base_unit: insumo.base_unit,
        costo_unitario: insumo.costo_unitario,
        stock_quantity: insumo.stock_quantity, // Keep current stock_quantity
        purchase_unit: insumo.purchase_unit,
        conversion_factor: insumo.conversion_factor,
        min_stock_level: insumo.min_stock_level ?? 0,
        category: insumo.category,
        supplier_name: insumo.supplier_name,
        supplier_phone: insumo.supplier_phone,
        supplier_address: insumo.supplier_address,
        pending_reception_quantity: insumo.pending_reception_quantity,
        pending_delivery_quantity: insumo.pending_delivery_quantity,
        last_physical_count_quantity: values.last_physical_count_quantity,
        last_physical_count_date: values.last_physical_count_date,
        discrepancy_quantity: discrepancy, // Update discrepancy based on new count
      };

      await updateInsumoMutation.mutateAsync({
        id: insumo.id,
        insumo: updatedInsumoData,
      });
      showSuccess("Conteo físico registrado exitosamente.");
      onClose();
    } catch (error: any) {
      showError(`Error al registrar conteo físico: ${error.message}`);
    }
  };

  const isUpdating = updateInsumoMutation.isPending;

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Conteo Físico de {insumo.nombre}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Stock Actual del Sistema</Label>
            <Input
              value={`${insumo.stock_quantity.toFixed(2)} ${insumo.purchase_unit}`}
              readOnly
              className="h-10 text-base mt-1 bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Último Conteo Físico</Label>
            <Input
              value={insumo.last_physical_count_quantity !== null ? `${insumo.last_physical_count_quantity.toFixed(2)} ${insumo.purchase_unit}` : "N/A"}
              readOnly
              className="h-10 text-base mt-1 bg-gray-100 dark:bg-gray-700"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="last_physical_count_quantity"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="last_physical_count_quantity" className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad Contada Físicamente ({insumo.purchase_unit})</Label>
              <Input
                id="last_physical_count_quantity"
                type="number"
                step="0.01"
                placeholder="Ej. 100.50"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="h-10 text-base mt-1"
                disabled={isUpdating}
              />
              {form.formState.errors.last_physical_count_quantity && (
                <FormMessage>{form.formState.errors.last_physical_count_quantity.message}</FormMessage>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_physical_count_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Fecha del Conteo Físico</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal h-10 text-base mt-1",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={isUpdating}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? formatISO(date, { representation: 'date' }) : null)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01") || isUpdating
                    }
                    initialFocus
                    locale={es} // Added locale={es}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.last_physical_count_date && (
                <FormMessage>{form.formState.errors.last_physical_count_date.message}</FormMessage>
              )}
            </FormItem>
          )}
        />

        <div className={`p-3 rounded-md flex items-center space-x-2 ${discrepancy !== 0 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'}`}>
          <AlertCircle className="h-5 w-5" />
          <p className="text-base font-medium">
            Diferencia: {discrepancy.toFixed(2)} {insumo.purchase_unit}
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Conteo
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default PhysicalCountDialog;