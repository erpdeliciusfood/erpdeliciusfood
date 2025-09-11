import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInsumos, createInsumo, updateInsumo, deleteInsumo, getInsumoSupplierHistory, getInsumoPriceHistory } from "@/integrations/supabase/insumos";
import { Insumo, InsumoFormValues, InsumoSupplierHistory, InsumoPriceHistory } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useInsumos = (searchTerm?: string, category?: string, page?: number, limit?: number) => {
  return useQuery<{ data: Insumo[], count: number }, Error>({
    queryKey: ["insumos", searchTerm, category, page, limit],
    queryFn: () => getInsumos(searchTerm, category, page, limit),
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

export const useAddInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<Insumo, Error, InsumoFormValues, { toastId: string }>({
    mutationFn: createInsumo,
    onMutate: () => {
      return { toastId: showLoading("Agregando insumo...") };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context?.toastId);
      showSuccess("Insumo agregado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
    onError: (error, _, context) => {
      dismissToast(context?.toastId);
      showError(`Error al agregar insumo: ${error.message}`);
    },
  });
};

export const useUpdateInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<Insumo, Error, { id: string; insumo: InsumoFormValues }>({
    mutationFn: ({ id, insumo }) => updateInsumo({ ...insumo, id }),
    onMutate: () => {
      return { toastId: showLoading("Actualizando insumo...") };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context?.toastId);
      showSuccess("Insumo actualizado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
    onError: (error, _, context) => {
      dismissToast(context?.toastId);
      showError(`Error al actualizar insumo: ${error.message}`);
    },
  });
};

export const useDeleteInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteInsumo,
    onMutate: () => {
      return { toastId: showLoading("Eliminando insumo...") };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context?.toastId);
      showSuccess("Insumo eliminado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
    onError: (error, _, context) => {
      dismissToast(context?.toastId);
      showError(`Error al eliminar insumo: ${error.message}`);
    },
  });
};