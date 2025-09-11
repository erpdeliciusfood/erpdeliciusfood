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
import * as z from "zod";
import { Loader2, Truck, Warehouse } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PurchaseRecord } from "@/types";
import { useUpdatePurchaseRecord } from "@/hooks/usePurchaseRecords";
import { showSuccess, showError } from "@/utils/toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  quantity_to_receive: z.coerce.number().min(0.01, {
    message: "La cantidad a recibir debe ser mayor a 0.",
  }),
});

interface PartialReceptionDialogProps {
  purchaseRecord: PurchaseRecord;
  onClose: () => void;
  targetStatus: 'received_by_company' | 'received_by_warehouse';
}

const PartialReceptionDialog: React.FC<PartialReceptionDialogProps> = ({
  purchaseRecord,
  onClose,
  targetStatus,
}) => {
  const updateMutation = useUpdatePurchaseRecord();

  const quantityPending = purchaseRecord.quantity_purchased - purchaseRecord.quantity_received;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity_to_receive: quantityPending,
    },
  });

  useEffect(() => {
    form.reset({
      quantity_to_receive: quantityPending,
    });
  }, [purchaseRecord, form, quantityPending]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const quantityToReceive = values.quantity_to_receive;

    if (quantityToReceive > quantityPending) {
      form.setError("quantity_to_receive", {
        type: "manual",
        message: `La cantidad a recibir (${quantityToReceive.toFixed(2)}) no puede ser mayor que la cantidad pendiente (${quantityPending.toFixed(2)}).`,
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: purchaseRecord.id,
        record: {
          ...purchaseRecord,
          quantity_received: purchaseRecord.quantity_received + quantityToReceive,
          status: quantityToReceive === quantityPending ? targetStatus : purchaseRecord.status, // Only change status if fully received
          received_date: purchaseRecord.received_date || format(new Date(), "yyyy-MM-dd"), // Set received date if not already set
        },
        partialReceptionQuantity: quantityToReceive, // Pass the partial quantity to the mutation
        targetStatus: targetStatus, // Pass the target status for logic in the mutation
      });
      showSuccess(`Se registraron ${quantityToReceive.toFixed(2)} ${purchaseRecord.insumos?.purchase_unit || 'unidades'} de ${purchaseRecord.insumos?.nombre || 'insumo desconocido'}.`);
      onClose();
    } catch (error: any) {
      showError(`Error al registrar la recepción: ${error.message}`);
    }
  };

  const isUpdating = updateMutation.isPending;

  const Icon = targetStatus === 'received_by_company' ? Truck : Warehouse;
  const title = targetStatus === 'received_by_company' ? "Registrar Recepción por Empresa" : "Registrar Recepción en Almacén";
  const description = targetStatus === 'received_by_company'
    ? `Ingresa la cantidad de ${purchaseRecord.insumos?.nombre || 'insumo desconocido'} recibida por la empresa. Esto moverá la cantidad de "Pendiente de Entrega" a "Pendiente de Recepción en Almacén".`
    : `Ingresa la cantidad de ${purchaseRecord.insumos?.nombre || 'insumo desconocido'} recibida en el almacén. Esto moverá la cantidad de "Pendiente de Recepción" a "Stock Actual".`;

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Icon className="mr-3 h-6 w-6" /> {title}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <p className="text-base text-gray-700 dark:text-gray-300">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Insumo</Label>
              <Input
                value={`${purchaseRecord.insumos?.nombre || 'N/A'} (${purchaseRecord.insumos?.purchase_unit || 'unidad'})`}
                readOnly
                className="h-10 text-base mt-1 bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad Ordenada</Label>
              <Input
                value={`${purchaseRecord.quantity_purchased.toFixed(2)} ${purchaseRecord.insumos?.purchase_unit || 'unidad'}`}
                readOnly
                className="h-10 text-base mt-1 bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad Recibida (hasta ahora)</Label>
              <Input
                value={`${purchaseRecord.quantity_received.toFixed(2)} ${purchaseRecord.insumos?.purchase_unit || 'unidad'}`}
                readOnly
                className="h-10 text-base mt-1 bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad Pendiente</Label>
              <Input
                value={`${quantityPending.toFixed(2)} ${purchaseRecord.insumos?.purchase_unit || 'unidad'}`}
                readOnly
                className="h-10 text-base mt-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="quantity_to_receive"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad a Recibir Ahora ({purchaseRecord.insumos?.purchase_unit || 'unidad'})</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={`Máx. ${quantityPending.toFixed(2)}`}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    className="h-12 text-base"
                    disabled={isUpdating}
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
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out"
              disabled={isUpdating || quantityPending <= 0}
            >
              {isUpdating && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Registrar Recepción
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default PartialReceptionDialog;