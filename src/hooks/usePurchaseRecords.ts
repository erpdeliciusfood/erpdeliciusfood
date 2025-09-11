import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPurchaseRecords, createPurchaseRecord, updatePurchaseRecord, deletePurchaseRecord } from "@/integrations/supabase/purchaseRecords";
import { PurchaseRecord, PurchaseRecordFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const usePurchaseRecords = () => {
  return useQuery<PurchaseRecord[], Error>({
    queryKey: ["purchaseRecords"],
    queryFn: getPurchaseRecords,
  });
};

export const useAddPurchaseRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<PurchaseRecord, Error, PurchaseRecordFormValues, { toastId: string }>({
    mutationFn: createPurchaseRecord,
    onMutate: () => {
      const toastId: string = showLoading("Registrando compra...");
      return { toastId };
    },
    onSuccess: (_, __, context) => { // Removed 'newRecord' from here as it's not directly used in this callback
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["purchaseRecords"] });
      queryClient.invalidateQueries({ queryKey: ["stockMovements"] }); // Invalidate stock movements
      queryClient.invalidateQueries({ queryKey: ["insumos"] }); // Invalidate insumos to reflect stock/cost changes
      showSuccess("Compra registrada exitosamente.");
      // The newRecord is still returned by mutateAsync and can be used by the component calling the mutation.
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al registrar compra: ${error.message}`);
    },
  });
};

export const useUpdatePurchaseRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<PurchaseRecord, Error, { id: string; record: PurchaseRecordFormValues }, { toastId: string }>({
    mutationFn: ({ id, record }) => updatePurchaseRecord(id, record),
    onMutate: () => {
      const toastId: string = showLoading("Actualizando registro de compra...");
      return { toastId };
    },
    onSuccess: (_, { id }, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["purchaseRecords"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseRecords", id] });
      showSuccess("Registro de compra actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar registro de compra: ${error.message}`);
    },
  });
};

export const useDeletePurchaseRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deletePurchaseRecord,
    onMutate: () => {
      const toastId: string = showLoading("Eliminando registro de compra...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["purchaseRecords"] });
      showSuccess("Registro de compra eliminado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar registro de compra: ${error.message}`);
    },
  });
};