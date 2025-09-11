"use client";

import React, { useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, XCircle } from "lucide-react";
import { UrgentPurchaseRequest } from "@/types";
import { useUpdateUrgentPurchaseRequest } from "@/hooks/useUrgentPurchaseRequests";
import { showSuccess, showError } from "@/utils/toast";

const formSchema = z.object({
  rejection_reason: z.string().min(10, { message: "El motivo de rechazo debe tener al menos 10 caracteres." }).max(500, { message: "El motivo de rechazo no debe exceder los 500 caracteres." }),
});

interface RejectUrgentRequestDialogProps {
  urgentRequest: UrgentPurchaseRequest;
  onClose: () => void;
}

const RejectUrgentRequestDialog: React.FC<RejectUrgentRequestDialogProps> = ({
  urgentRequest,
  onClose,
}) => {
  const updateMutation = useUpdateUrgentPurchaseRequest();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rejection_reason: urgentRequest.rejection_reason || "",
    },
  });

  useEffect(() => {
    form.reset({
      rejection_reason: urgentRequest.rejection_reason || "",
    });
  }, [urgentRequest, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateMutation.mutateAsync({
        id: urgentRequest.id,
        request: {
          status: 'rejected',
          rejection_reason: values.rejection_reason,
        },
      });
      showSuccess(`Solicitud de compra urgente para ${urgentRequest.insumo?.nombre || "Insumo Desconocido"} rechazada exitosamente.`);
      onClose();
    } catch (error: any) {
      showError(`Error al rechazar la solicitud: ${error.message}`);
    }
  };

  const isUpdating = updateMutation.isPending;

  return (
    <DialogContent className="sm:max-w-[425px] md:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <XCircle className="mr-3 h-6 w-6 text-red-600" /> Rechazar Solicitud Urgente
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
          <p className="text-base text-gray-700 dark:text-gray-300">
            Por favor, proporciona un motivo claro para rechazar la solicitud de compra urgente de <span className="font-semibold">{urgentRequest.insumo?.nombre || "Insumo Desconocido"}</span>.
          </p>

          <FormField
            control={form.control}
            name="rejection_reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Motivo de Rechazo</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej. No hay presupuesto disponible, el insumo ya fue adquirido por otro medio, etc."
                    {...field}
                    value={field.value || ""}
                    className="min-h-[100px] text-base"
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
              className="px-6 py-3 text-lg bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-destructive transition-colors duration-200 ease-in-out"
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Confirmar Rechazo
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default RejectUrgentRequestDialog;