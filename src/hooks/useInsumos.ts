import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInsumos, getInsumoById, createInsumo, updateInsumo, deleteInsumo, createMultipleInsumos, getInsumoSupplierHistory, getInsumoPriceHistory } from "@/integrations/supabase/insumos";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Insumo, InsumoFormValues, InsumoSupplierHistory, InsumoPriceHistory } from "@/types";

export const useInsumos = (searchTerm?: string, category?: string, page?: number, limit?: number) => {
  return useQuery<Insumo[], Error>({
    queryKey: ["insumos", searchTerm, category, page, limit],
    queryFn: async () => {
      const { data } = await getInsumos(searchTerm, category, page, limit);
      return data;
    },
  });
};

export const useInsumo = (id: string) => {
  return useQuery<Insumo, Error>({
    queryKey: ["insumo", id],
    queryFn: () => getInsumoById(id),
    enabled: !!id,
  });
};

export const useCreateInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<Insumo, Error, InsumoFormValues, { toastId: string }>({
    mutationFn: createInsumo,
    onMutate: () => {
      const toastId = showLoading("Creando insumo...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      showSuccess("Insumo creado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al crear insumo: ${error.message}`);
    },
  });
};

export const useUpdateInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<Insumo, Error, { id: string; updates: Partial<InsumoFormValues> }, { toastId: string }>({
    mutationFn: ({ id, updates }) => updateInsumo(id, updates),
    onMutate: () => {
      const toastId = showLoading("Actualizando insumo...");
      return { toastId };
    },
    onSuccess: (_, variables, context) => {
      dismissToast(context.toastId);
      showSuccess("Insumo actualizado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
      queryClient.setQueryData(["insumo", variables.id], (oldData: Insumo | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...variables.updates };
      });
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
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteInsumo,
    onMutate: () => {
      const toastId = showLoading("Eliminando insumo...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      showSuccess("Insumo eliminado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar insumo: ${error.message}`);
    },
  });
};

export const useCreateMultipleInsumos = () => {
  const queryClient = useQueryClient();
  return useMutation<number, Error, InsumoFormValues[], { toastId: string }>({
    mutationFn: createMultipleInsumos,
    onMutate: () => {
      const toastId = showLoading("Importando insumos...");
      return { toastId };
    },
    onSuccess: (count, __, context) => {
      dismissToast(context.toastId);
      showSuccess(`${count} insumos importados exitosamente.`);
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al importar insumos: ${error.message}`);
    },
  });
};

export const useInsumoSupplierHistory = (insumoId: string) => {
  return useQuery<InsumoSupplierHistory[], Error>({
    queryKey: ["insumoSupplierHistory", insumoId],
    queryFn: () => getInsumoSupplierHistory(insumoId),
    enabled: !!insumoId,
  });
};

export const useInsumoPriceHistory = (insumoId: string) => {
  return useQuery<InsumoPriceHistory[], Error>({
    queryKey: ["insumoPriceHistory", insumoId],
    queryFn: () => getInsumoPriceHistory(insumoId),
    enabled: !!insumoId,
  });
};