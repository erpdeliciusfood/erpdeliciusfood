import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenus, getMenuById, createMenu, updateMenu, deleteMenu } from "@/integrations/supabase/menus";
import { Menu, MenuFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useMenus = (startDate?: string, endDate?: string) => {
  return useQuery<Menu[], Error>({
    queryKey: ["menus", startDate, endDate],
    queryFn: () => getMenus(startDate, endDate),
  });
};

export const useMenuById = (id: string) => {
  return useQuery<Menu, Error>({
    queryKey: ["menus", id],
    queryFn: () => getMenuById(id),
    enabled: !!id,
  });
};

export const useAddMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<Menu, Error, MenuFormValues>({
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

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<Menu, Error, { id: string; menu: MenuFormValues }>({
    mutationFn: ({ id, menu }) => updateMenu(id, menu),
    onMutate: () => {
      return { toastId: showLoading("Actualizando menú...") };
    },
    onSuccess: () => {
      dismissToast();
      showSuccess("Menú actualizado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
    onError: (error, _, context) => {
      dismissToast(context?.toastId);
      showError(`Error al actualizar menú: ${error.message}`);
    },
  });
};

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteMenu,
    onMutate: () => {
      return { toastId: showLoading("Eliminando menú...") };
    },
    onSuccess: () => {
      dismissToast();
      showSuccess("Menú eliminado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
    onError: (error, _, context) => {
      dismissToast(context?.toastId);
      showError(`Error al eliminar menú: ${error.message}`);
    },
  });
};