import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMenu } from "@/integrations/supabase/menus";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteMenu,
    onMutate: () => {
      return { toastId: showLoading("Eliminando menú...") };
    },
    onSuccess: (_, __, context) => {
      if (context?.toastId) dismissToast(context.toastId);
      showSuccess("Menú eliminado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
    onError: (error, _, context) => {
      if (context?.toastId) dismissToast(context.toastId);
      showError(`Error al eliminar menú: ${error.message}`);
    },
  });
};