"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { UrgentPurchaseRequest, UrgentPurchaseRequestFormValues } from "@/types";
import { useUpdateUrgentPurchaseRequest } from "@/hooks/useUrgentPurchaseRequests";
import { useInsumos } from "@/hooks/useInsumos"; // To display insumo name
import { format } from "date-fns"; // NEW: Import format
import { es } from "date-fns/locale"; // NEW: Import es locale

const formSchema = z.object({
  quantity_requested: z.coerce.number().min(1, { message: "La cantidad solicitada debe ser al menos 1." }).max(999999, { message: "La cantidad no debe exceder 999999." }),
  notes: z.string().max(500, { message: "Las notas no deben exceder los 500 caracteres." }).nullable(),
  priority: z.enum(['urgent', 'high', 'medium', 'low'], { required_error: "La prioridad es requerida." }),
  status: z.enum(['pending', 'approved', 'rejected', 'fulfilled'], { required_error: "El estado es requerido." }),
  rejection_reason: z.string().max(500, { message: "El motivo de rechazo no debe exceder los 500 caracteres." }).nullable().optional(), // NEW: Add rejection_reason to schema
  fulfilled_purchase_record_id: z.string().nullable().optional(), // NEW: Add fulfilled_purchase_record_id to schema
});

interface UrgentPurchaseRequestFormProps {
  initialData?: UrgentPurchaseRequest | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const UrgentPurchaseRequestForm: React.FC<UrgentPurchaseRequestFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const updateUrgentPurchaseRequestMutation = useUpdateUrgentPurchaseRequest();
  const { isLoading: isLoadingInsumos } = useInsumos(undefined, undefined, 1, 1); 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity_requested: initialData?.quantity_requested || 1,
      notes: initialData?.notes || "",
      priority: initialData?.priority || 'urgent',
      status: initialData?.status || 'pending',
      rejection_reason: initialData?.rejection_reason || "", // NEW: Set default for rejection_reason
      fulfilled_purchase_record_id: initialData?.fulfilled_purchase_record_id || "", // NEW: Set default for fulfilled_purchase_record_id
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        quantity_requested: initialData.quantity_requested,
        notes: initialData.notes || "",
        priority: initialData.priority,
        status: initialData.status,
        rejection_reason: initialData.rejection_reason || "", // NEW: Reset rejection_reason
        fulfilled_purchase_record_id: initialData.fulfilled_purchase_record_id || "", // NEW: Reset fulfilled_purchase_record_id
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!initialData?.id) return; // Should not happen if initialData is provided

    const requestData: Partial<UrgentPurchaseRequestFormValues & { status: UrgentPurchaseRequest['status'] }> = {
      quantity_requested: values.quantity_requested,
      notes: values.notes,
      priority: values.priority,
      status: values.status,
      // rejection_reason and fulfilled_purchase_record_id are read-only in this form,
      // so they are not sent in the update payload. They are managed by other dialogs.
    };
    await updateUrgentPurchaseRequestMutation.mutateAsync({ id: initialData.id, request: requestData });
    onSuccess();
  };

  const isLoading = updateUrgentPurchaseRequestMutation.isPending || isLoadingInsumos;
  const insumoName = initialData?.insumos?.nombre || "Insumo Desconocido";
  const purchaseUnit = initialData?.insumos?.purchase_unit || "unidad";
  const currentStatus = form.watch("status"); // Watch current status to conditionally display fields

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Insumo</FormLabel>
            <Input
              value={`${insumoName} (${purchaseUnit})`}
              readOnly
              className="h-10 text-base mt-1 bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Fecha de Solicitud</FormLabel>
            <Input
              value={initialData?.request_date ? format(new Date(initialData.request_date), "PPP", { locale: es }) : "N/A"}
              readOnly
              className="h-10 text-base mt-1 bg-gray-100 dark:bg-gray-700"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="quantity_requested"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Cantidad Solicitada ({purchaseUnit})</FormLabel>
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
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Prioridad</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecciona la prioridad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Estado</FormLabel>
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
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="fulfilled">Cumplido</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {initialData?.insistence_count !== undefined && (
          <div>
            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Veces Solicitado (Insistencia)</FormLabel>
            <Input
              value={initialData.insistence_count.toString()}
              readOnly
              className="h-10 text-base mt-1 bg-gray-100 dark:bg-gray-700"
            />
          </div>
        )}

        {currentStatus === 'rejected' && (
          <FormField
            control={form.control}
            name="rejection_reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Motivo de Rechazo</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Motivo del rechazo"
                    {...field}
                    value={field.value || ""}
                    className="min-h-[80px] text-base bg-gray-100 dark:bg-gray-700"
                    readOnly
                    disabled // Ensure it's truly disabled for editing here
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {currentStatus === 'fulfilled' && (
          <FormField
            control={form.control}
            name="fulfilled_purchase_record_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">ID de Registro de Compra Cumplida</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ID del registro de compra"
                    {...field}
                    value={field.value || ""}
                    className="h-10 text-base bg-gray-100 dark:bg-gray-700"
                    readOnly
                    disabled // Ensure it's truly disabled for editing here
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalles adicionales sobre la solicitud..."
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
            onClick={onCancel}
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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Form>
  ); // NEW: Added missing closing parenthesis and semicolon
};

export default UrgentPurchaseRequestForm;