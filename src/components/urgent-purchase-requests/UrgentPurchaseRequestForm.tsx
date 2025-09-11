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
  // fulfilled_purchase_record_id: z.string().nullable().optional(), // Optional: if we want to link to a specific purchase record
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
  // Removed 'insumoData' as it was unused. 'isLoadingInsumos' is still useful for overall loading state.
  const { isLoading: isLoadingInsumos } = useInsumos(undefined, undefined, 1, 1); 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity_requested: initialData?.quantity_requested || 1,
      notes: initialData?.notes || "",
      priority: initialData?.priority || 'urgent',
      status: initialData?.status || 'pending',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        quantity_requested: initialData.quantity_requested,
        notes: initialData.notes || "",
        priority: initialData.priority,
        status: initialData.status,
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
    };
    await updateUrgentPurchaseRequestMutation.mutateAsync({ id: initialData.id, request: requestData });
    onSuccess();
  };

  const isLoading = updateUrgentPurchaseRequestMutation.isPending || isLoadingInsumos;
  const insumoName = initialData?.insumos?.nombre || "Insumo Desconocido";
  const purchaseUnit = initialData?.insumos?.purchase_unit || "unidad";

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
  );
};

export default UrgentPurchaseRequestForm;