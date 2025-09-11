import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/integrations/supabase/suppliers";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Supplier } from "@/types";

export const useSuppliers = () => {
  return useQuery<Supplier[], Error>({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation<Supplier, Error, Omit<Supplier, 'id' | 'created_at'>, { toastId: string }>({
    mutationFn: createSupplier,
    onMutate: () => {
      const toastId = showLoading("Creando proveedor...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      showSuccess("Proveedor creado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al crear proveedor: ${error.message}`);
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation<Supplier, Error, Supplier, { toastId: string }>({
    mutationFn: updateSupplier,
    onMutate: () => {
      const toastId = showLoading("Actualizando proveedor...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      showSuccess("Proveedor actualizado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar proveedor: ${error.message}`);
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteSupplier,
    onMutate: () => {
      const toastId = showLoading("Eliminando proveedor...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      showSuccess("Proveedor eliminado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar proveedor: ${error.message}`);
    },
  });
};