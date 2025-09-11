import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMenu } from "@/integrations/supabase/menus";
import { Menu, MenuFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<Menu, Error, { id: string; menu: MenuFormValues }>({
    mutationFn: ({ id, menu }) => updateMenu(id, menu),
    onMutate: () => {
      return { toastId: showLoading("Actualizando menú...") };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context?.toastId);
      showSuccess("Menú actualizado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
    onError: (error, _, context) => {
      dismissToast(context?.toastId);
      showError(`Error al actualizar menú: ${error.message}`);
    },
  });
};