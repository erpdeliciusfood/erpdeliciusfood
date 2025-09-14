import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/integrations/supabase/suppliers";
import { Supplier, SupplierFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useSuppliers = () => {
  return useQuery<Supplier[], Error>({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
};

export const useAddSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation<Supplier, Error, SupplierFormValues, { toastId: string }>({
    mutationFn: createSupplier,
    onMutate: () => {
      const toastId: string = showLoading("Añadiendo proveedor...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      showSuccess("Proveedor añadido exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al añadir proveedor: ${error.message}`);
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation<Supplier, Error, { id: string; supplier: SupplierFormValues }, { toastId: string }>({
    mutationFn: ({ id, supplier }) => updateSupplier(id, supplier),
    onMutate: () => {
      const toastId: string = showLoading("Actualizando proveedor...");
      return { toastId };
    },
    onSuccess: (_, { id }, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", id] });
      queryClient.invalidateQueries({ queryKey: ["insumos"] }); // Invalidate insumos as they might reference this supplier
      showSuccess("Proveedor actualizado exitosamente.");
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
      const toastId: string = showLoading("Eliminando proveedor...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["insumos"] }); // Invalidate insumos as they might reference this supplier
      showSuccess("Proveedor eliminado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar proveedor: ${error.message}`);
    },
  });
};