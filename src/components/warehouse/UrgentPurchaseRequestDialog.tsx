"use client";

import React, { useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label"; // NEW: Import Label
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react"; // REMOVED: ShoppingBag
import { AggregatedInsumoNeed, UrgentPurchaseRequestFormValues } from "@/types";
import { useAddUrgentPurchaseRequest } from "@/hooks/useUrgentPurchaseRequests";

const formSchema = z.object({
  quantity_requested: z.coerce.number().min(1, { message: "La cantidad solicitada debe ser al menos 1." }).max(999999, { message: "La cantidad no debe exceder 999999." }),
  notes: z.string().max(500, { message: "Las notas no deben exceder los 500 caracteres." }).nullable(),
});

interface UrgentPurchaseRequestDialogProps {
  insumoNeed: AggregatedInsumoNeed;
  onClose: () => void;
}

const UrgentPurchaseRequestDialog: React.FC<UrgentPurchaseRequestDialogProps> = ({
  insumoNeed,
  onClose,
}) => {
  const addUrgentPurchaseRequestMutation = useAddUrgentPurchaseRequest();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity_requested: insumoNeed.missingQuantity > 0 ? Math.ceil(insumoNeed.missingQuantity) : 1, // Pre-fill with missing quantity, or 1 if none missing
      notes: `Solicitud urgente por stock insuficiente para preparación diaria del menú.`,
    },
  });

  useEffect(() => {
    form.reset({
      quantity_requested: insumoNeed.missingQuantity > 0 ? Math.ceil(insumoNeed.missingQuantity) : 1,
      notes: `Solicitud urgente por stock insuficiente para preparación diaria del menú.`,
    });
  }, [insumoNeed, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const requestData: UrgentPurchaseRequestFormValues = {
      insumo_id: insumoNeed.insumoId,
      quantity_requested: values.quantity_requested,
      notes: values.notes,
      source_module: 'warehouse',
      priority: 'urgent',
      reason: 'Stock Insufficient for Daily Prep',
      status: 'pending',
    };
    await addUrgentPurchaseRequestMutation.mutateAsync(requestData);
    onClose();
  };

  const isLoading = addUrgentPurchaseRequestMutation.isPending;

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Solicitar Compra Urgente para {insumoNeed.insumoNombre}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <p className="text-base text-gray-700 dark:text-gray-300">
            Genera una solicitud de compra urgente para cubrir el faltante de este insumo.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Stock Actual</Label>
              <Input
                value={`${insumoNeed.currentStock.toFixed(2)} ${insumoNeed.purchaseUnit}`}
                readOnly
                className="h-10 text-base mt-1 bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad Faltante</Label>
              <Input
                value={`${insumoNeed.missingQuantity.toFixed(2)} ${insumoNeed.purchaseUnit}`}
                readOnly
                className="h-10 text-base mt-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="quantity_requested"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad a Solicitar ({insumoNeed.purchaseUnit})</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    placeholder="Ej. 10"
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
                    placeholder="Detalles adicionales sobre la urgencia o el uso..."
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
              onClick={onClose}
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
              Crear Solicitud Urgente
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UrgentPurchaseRequestDialog;