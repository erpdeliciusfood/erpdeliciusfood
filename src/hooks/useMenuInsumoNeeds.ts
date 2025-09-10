import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAggregatedInsumoNeedsForDate, deductDailyPrepStock } from "@/integrations/supabase/warehouse";
import { AggregatedInsumoNeed } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useAggregatedInsumoNeeds = (date: string | undefined) => {
  return useQuery<AggregatedInsumoNeed[], Error>({
    queryKey: ["aggregatedInsumoNeeds", date],
    queryFn: () => {
      if (!date) return Promise.resolve([]);
      return getAggregatedInsumoNeedsForDate(date);
    },
    enabled: !!date,
  });
};

export const useDeductDailyPrepStock = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { menuId: string; insumoNeeds: { insumo_id: string; quantity_to_deduct: number; current_stock_quantity: number }[] }, { toastId: string }>({
    mutationFn: ({ menuId, insumoNeeds }) => deductDailyPrepStock(menuId, insumoNeeds),
    onMutate: () => {
      const toastId: string = showLoading("Debitando insumos para preparación diaria...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["aggregatedInsumoNeeds"] }); // Invalidate needs for the date
      queryClient.invalidateQueries({ queryKey: ["stockMovements"] }); // Invalidate stock movements
      queryClient.invalidateQueries({ queryKey: ["insumos"] }); // Invalidate insumos to reflect stock changes
      showSuccess("Insumos debitados exitosamente para preparación diaria.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al debitar insumos: ${error.message}`);
    },
  });
};