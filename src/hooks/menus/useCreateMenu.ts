import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMenu } from "@/integrations/supabase/menus";
import { Menu, MenuFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<Menu, Error, MenuFormValues, { toastId: string }>({
    mutationFn: createMenu,
    onMutate: () => {
      return { toastId: showLoading("Agregando menú...") };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context?.toastId);
      showSuccess("Menú agregado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
    onError: (error, _, context) => {
      dismissToast(context?.toastId);
      showError(`Error al agregar menú: ${error.message}`);
    },
  });
};