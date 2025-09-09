import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from "@/integrations/supabase/insumos";
import { Insumo, InsumoFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useInsumos = () => {
  return useQuery<Insumo[], Error>({
    queryKey: ["insumos"],
    queryFn: getInsumos,
  });
};

export const useAddInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<Insumo, Error, InsumoFormValues, { toastId: string }>({
    mutationFn: createInsumo,
    onMutate: () => {
      const toastId: string = showLoading("Añadiendo insumo...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
      showSuccess("Insumo añadido exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al añadir insumo: ${error.message}`);
    },
  });
};

export const useUpdateInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<Insumo, Error, { id: string; insumo: InsumoFormValues }, { toastId: string }>({
    mutationFn: ({ id, insumo }) => updateInsumo(id, insumo),
    onMutate: () => {
      const toastId: string = showLoading("Actualizando insumo...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
      showSuccess("Insumo actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar insumo: ${error.message}`);
    },
  });
};

export const useDeleteInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteInsumo,
    onMutate: () => {
      const toastId: string = showLoading("Eliminando insumo...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
      showSuccess("Insumo eliminado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar insumo: ${error.message}`);
    },
  });
};