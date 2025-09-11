import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUrgentPurchaseRequest } from "@/integrations/supabase/urgentPurchaseRequests";
import { UrgentPurchaseRequest, UrgentPurchaseRequestFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useSession } from "@/contexts/SessionContext";

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