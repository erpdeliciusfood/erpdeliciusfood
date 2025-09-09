import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from "@/integrations/supabase/insumos";
import { Insumo, InsumoFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useSession } from "@/contexts/SessionContext";

export const useInsumos = () => {
  return useQuery<Insumo[], Error>({
    queryKey: ["insumos"],
    queryFn: getInsumos,
  });
};

export const useAddInsumo = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<Insumo, Error, InsumoFormValues, { toastId: string }>({
    mutationFn: async (insumoData) => {
      if (!user?.id) throw new Error("User not authenticated.");
      return createInsumo(insumoData, user.id);
    },
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
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al añadir insumo: ${error.message}`);
    },
  });
};

export const useUpdateInsumo = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<Insumo, Error, { id: string; insumo: InsumoFormValues }, { toastId: string }>({
    mutationFn: async ({ id, insumo }) => {
      if (!user?.id) throw new Error("User not authenticated.");
      return updateInsumo(id, insumo, user.id);
    },
    onMutate: () => {
      const toastId: string = showLoading("Actualizando insumo...");
      return { toastId };
    },
    onSuccess: (_, { id }, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
      queryClient.invalidateQueries({ queryKey: ["insumos", id] });
      showSuccess("Insumo actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar insumo: ${error.message}`);
    },
  });
};

export const useDeleteInsumo = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: async (id) => {
      if (!user?.id) throw new Error("User not authenticated.");
      return deleteInsumo(id, user.id);
    },
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
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar insumo: ${error.message}`);
    },
  });
};