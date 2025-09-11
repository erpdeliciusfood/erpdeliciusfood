import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenus, getMenuById, createMenu, updateMenu, deleteMenu } from "@/integrations/supabase/menus";
import { Menu, MenuFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useMenus = (startDate?: string, endDate?: string) => {
  return useQuery<Menu[], Error>({
    queryKey: ["menus", startDate, endDate], // Include dates in query key
    queryFn: () => getMenus(startDate, endDate),
  });
};

export const useMenu = (id: string) => {
  return useQuery<Menu | null, Error>({
    queryKey: ["menus", id],
    queryFn: () => getMenuById(id),
    enabled: !!id, // Only run the query if id is available
  });
};

export const useAddMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<Menu, Error, MenuFormValues, { toastId: string }>({
    mutationFn: createMenu,
    onMutate: () => {
      const toastId: string = showLoading("Creando menú...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["menus"] }); // Invalidate all menus to refresh calendar
      showSuccess("Menú creado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al crear menú: ${error.message}`);
    },
  });
};

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<Menu, Error, { id: string; menu: MenuFormValues }, { toastId: string }>({
    mutationFn: ({ id, menu }) => updateMenu(id, menu),
    onMutate: () => {
      const toastId: string = showLoading("Actualizando menú...");
      return { toastId };
    },
    onSuccess: (_, { id }, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["menus"] }); // Invalidate all menus to refresh calendar
      queryClient.invalidateQueries({ queryKey: ["menus", id] }); // Invalidate specific menu query
      showSuccess("Menú actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar menú: ${error.message}`);
    },
  });
};

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteMenu,
    onMutate: () => {
      const toastId: string = showLoading("Eliminando menú...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["menus"] }); // Invalidate all menus to refresh calendar
      showSuccess("Menú eliminado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar menú: ${error.message}`);
    },
  });
};