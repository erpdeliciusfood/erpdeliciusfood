"use client";

import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertTriangle, RotateCcw, Package } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AggregatedInsumoNeed } from "@/types";
import { useAddStockMovement } from "@/hooks/useStockMovements";
import { showSuccess, showError, showLoading, dismissToast, showInfo } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import Table components

const formSchema = z.object({
  deductor_name: z.string().min(1, { message: "El nombre de quien realiza la acción es requerido." }).max(100, { message: "El nombre no debe exceder los 100 caracteres." }),
  insumos_to_deduct: z.array(
    z.object({
      insumo_id: z.string(),
      insumo_nombre: z.string(),
      purchase_unit: z.string(),
      current_stock_quantity: z.number(),
      suggested_quantity: z.number(),
      quantity_to_deduct: z.coerce.number().min(0, { message: "La cantidad a deducir no puede ser negativa." }),
    })
  ).min(1, { message: "Debe haber al menos un insumo para deducir." }),
  confirm_deduction: z.boolean().refine(val => val === true, {
    message: "Debe confirmar que la deducción real de productos ha sido realizada.",
  }),
}).superRefine((data, ctx) => {
  data.insumos_to_deduct.forEach((item, index) => {
    if (item.quantity_to_deduct > item.current_stock_quantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La cantidad a deducir (${item.quantity_to_deduct.toFixed(2)}) no puede ser mayor que el stock actual (${item.current_stock_quantity.toFixed(2)}).`,
        path: [`insumos_to_deduct.${index}.quantity_to_deduct`],
      });
    }
    if (item.quantity_to_deduct === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La cantidad a deducir no puede ser cero. Si no desea deducir este insumo, desmárquelo en la lista anterior.",
        path: [`insumos_to_deduct.${index}.quantity_to_deduct`],
      });
    }
  });
});

interface DeductQuantitiesDialogProps {
  selectedInsumoNeeds: AggregatedInsumoNeed[];
  selectedDate: Date;
  menuId: string | null;
  onClose: () => void;
}

const DeductQuantitiesDialog: React.FC<DeductQuantitiesDialogProps> = ({
  selectedInsumoNeeds,
  selectedDate,
  menuId,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const addStockMovementMutation = useAddStockMovement();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deductor_name: "",
      insumos_to_deduct: selectedInsumoNeeds.map(need => ({
        insumo_id: need.insumo_id,
        insumo_nombre: need.insumo_nombre,
        purchase_unit: need.purchase_unit,
        current_stock_quantity: need.current_stock_quantity,
        suggested_quantity: need.total_needed_purchase_unit,
        quantity_to_deduct: need.total_needed_purchase_unit,
      })),
      confirm_deduction: false,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "insumos_to_deduct",
  });

  const isDeductingStock = addStockMovementMutation.isPending;
  const insumos_to_deduct = form.watch("insumos_to_deduct");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { deductor_name, insumos_to_deduct } = values;

    const deductToastId = showLoading("Deduciendo insumos para la preparación diaria...");
    let successfulDeductions = 0;
    let failedDeductions = 0;
    let adjustedDeductionsCount = 0;

    for (const item of insumos_to_deduct) {
      if (item.quantity_to_deduct > 0) {
        let notes = `Salida por preparación diaria para el menú del ${format(selectedDate, "PPP", { locale: es })}. Realizado por: ${deductor_name}`;
        
        if (item.quantity_to_deduct !== item.suggested_quantity) {
          adjustedDeductionsCount++;
          notes += `\n(Ajuste manual: Necesidad original ${item.suggested_quantity.toFixed(2)} ${item.purchase_unit}, Deducido: ${item.quantity_to_deduct.toFixed(2)} ${item.purchase_unit})`;
        }

        try {
          await addStockMovementMutation.mutateAsync({
            insumo_id: item.insumo_id,
            movement_type: 'daily_prep_out',
            quantity_change: item.quantity_to_deduct,
            notes: notes,
            menu_id: menuId,
          });
          successfulDeductions++;
        } catch (error: any) {
          failedDeductions++;
          showError(`Error al deducir ${item.insumo_nombre}: ${error.message}`);
        }
      }
    }

    dismissToast(deductToastId);
    if (successfulDeductions > 0) {
      let successMessage = `Se dedujeron ${successfulDeductions} insumos exitosamente para la preparación diaria.`;
      if (adjustedDeductionsCount > 0) {
        successMessage += ` Se realizaron ${adjustedDeductionsCount} ajustes manuales.`;
        showInfo("Revisa el módulo de Movimientos de Stock para ver los detalles de los ajustes.");
      }
      showSuccess(successMessage);
    }
    if (failedDeductions > 0) {
      showError(`Fallaron ${failedDeductions} deducciones de insumos.`);
    }

    queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
    queryClient.invalidateQueries({ queryKey: ["insumos"] });
    queryClient.invalidateQueries({ queryKey: ["menus"] });
    onClose();
  };

  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const isConfirmChecked = form.watch("confirm_deduction");

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Confirmar y Ajustar Cantidades a Deducir
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <p className="text-base text-gray-700 dark:text-gray-300">
            Revisa las cantidades sugeridas para la preparación diaria del <span className="font-semibold">{format(selectedDate, "PPP", { locale: es })}</span>.
            Puedes ajustar las cantidades si es necesario.
          </p>

          <FormField
            control={form.control}
            name="deductor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Nombre de quien realiza la acción</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Juan Pérez"
                    {...field}
                    className="h-10 text-base"
                    disabled={isDeductingStock}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            {fields.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-3 items-center border-b pb-3 last:border-b-0 last:pb-0">
                <div className="flex-grow">
                  <Label className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <Package className="mr-2 h-6 w-6 text-primary dark:text-primary-foreground" />
                    {item.insumo_nombre}
                  </Label>
                  <p className="text-base text-gray-700 dark:text-gray-300 mt-1">
                    Stock actual: <span className="font-semibold">{item.current_stock_quantity.toFixed(2)} {item.purchase_unit}</span>
                  </p>
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    Necesidad para receta: <span className="font-semibold text-blue-600 dark:text-blue-400">{item.suggested_quantity.toFixed(2)} {item.purchase_unit}</span>
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name={`insumos_to_deduct.${index}.quantity_to_deduct`}
                  render={({ field: quantityField }) => {
                    const isAdjusted = parseFloat(quantityField.value.toFixed(2)) !== parseFloat(item.suggested_quantity.toFixed(2));
                    return (
                      <FormItem className="w-full md:w-1/3">
                        <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">
                          Cantidad a Deducir ({item.purchase_unit})
                        </FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={`Sugerido: ${item.suggested_quantity.toFixed(2)} ${item.purchase_unit}`}
                              {...quantityField}
                              onChange={(e) => quantityField.onChange(parseFloat(e.target.value))}
                              className={cn(
                                "h-10 text-base",
                                isAdjusted && "border-blue-500 dark:border-blue-400 ring-blue-500 dark:ring-blue-400"
                              )}
                              disabled={isDeductingStock}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => form.setValue(`insumos_to_deduct.${index}.quantity_to_deduct`, item.suggested_quantity, { shouldValidate: true })}
                            className="h-10 w-10 flex-shrink-0"
                            disabled={isDeductingStock}
                            title="Restablecer a cantidad sugerida"
                          >
                            <RotateCcw className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          </Button>
                        </div>
                        <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                          Cantidad sugerida: {item.suggested_quantity.toFixed(2)} {item.purchase_unit}. Puedes ajustar este valor.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            ))}
          </div>

          {insumos_to_deduct.filter(item => item.quantity_to_deduct > 0).length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Resumen de Deducción para el {format(selectedDate, "PPP", { locale: es })}:
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Nota: La columna "Receta" no está disponible en la información actual de los insumos agregados.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Insumo</TableHead>
                    <TableHead className="text-right">Cantidad Deducida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insumos_to_deduct.filter(item => item.quantity_to_deduct > 0).map(item => (
                    <TableRow key={item.insumo_id}>
                      <TableCell className="font-medium">
                        {item.insumo_nombre}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity_to_deduct.toFixed(2)} {item.purchase_unit}
                        {parseFloat(item.quantity_to_deduct.toFixed(2)) !== parseFloat(item.suggested_quantity.toFixed(2)) && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium text-sm block md:inline-block">(Ajustado de {item.suggested_quantity.toFixed(2)})</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {insumos_to_deduct.filter(item => item.quantity_to_deduct > 0).length === 0 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400">
              <p>No hay insumos con cantidad a deducir mayor a cero.</p>
            </div>
          )}

          {hasErrors && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p className="text-base font-medium">
                Por favor, corrige los errores en las cantidades antes de confirmar.
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="confirm_deduction"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isDeductingStock}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    Confirmo que la deducción real de productos ha sido realizada.
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Esta acción actualizará el stock en el sistema.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-3 text-lg"
              disabled={isDeductingStock}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out"
              disabled={isDeductingStock || hasErrors || !isConfirmChecked}
            >
              {isDeductingStock && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Confirmar Deducción
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default DeductQuantitiesDialog;