import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createUrgentPurchaseRequest, getUrgentPurchaseRequests, updateUrgentPurchaseRequest, deleteUrgentPurchaseRequest } from "@/integrations/supabase/urgentPurchaseRequests";
import { UrgentPurchaseRequest, UrgentPurchaseRequestFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useSession } from "@/contexts/SessionContext";

export const useUrgentPurchaseRequests = () => {
  return useQuery<UrgentPurchaseRequest[], Error>({
    queryKey: ["urgentPurchaseRequests"],
    queryFn: getUrgentPurchaseRequests,
  });
};

export const useAddUrgentPurchaseRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<UrgentPurchaseRequest, Error, UrgentPurchaseRequestFormValues, { toastId: string }>({
    mutationFn: async (requestData) => {
      if (!user?.id) {
        throw new Error("User not authenticated.");
      }
      return createUrgentPurchaseRequest(requestData, user.id);
    },
    onMutate: () => {
      const toastId: string = showLoading("Creando solicitud de compra urgente...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["urgentPurchaseRequests"] }); // Invalidate relevant queries
      showSuccess("Solicitud de compra urgente creada exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al crear solicitud de compra urgente: ${error.message}`);
    },
  });
};

export const useUpdateUrgentPurchaseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<UrgentPurchaseRequest, Error, { id: string; request: Partial<UrgentPurchaseRequestFormValues & { status: UrgentPurchaseRequest['status']; fulfilled_purchase_record_id?: string | null }> }, { toastId: string }>({
    mutationFn: ({ id, request }) => updateUrgentPurchaseRequest(id, request),
    onMutate: () => {
      const toastId: string = showLoading("Actualizando solicitud de compra urgente...");
      return { toastId };
    },
    onSuccess: (_, { id }, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["urgentPurchaseRequests"] });
      queryClient.invalidateQueries({ queryKey: ["urgentPurchaseRequests", id] });
      showSuccess("Solicitud de compra urgente actualizada exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar solicitud de compra urgente: ${error.message}`);
    },
  });
};

export const useDeleteUrgentPurchaseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteUrgentPurchaseRequest,
    onMutate: () => {
      const toastId: string = showLoading("Eliminando solicitud de compra urgente...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["urgentPurchaseRequests"] });
      showSuccess("Solicitud de compra urgente eliminada exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar solicitud de compra urgente: ${error.message}`);
    },
  });
};