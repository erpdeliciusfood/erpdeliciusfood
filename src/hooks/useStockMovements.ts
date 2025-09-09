import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStockMovements, createStockMovement } from "@/integrations/supabase/stockMovements";
import { StockMovement, StockMovementFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useStockMovements = () => {
  return useQuery<StockMovement[], Error>({
    queryKey: ["stockMovements"],
    queryFn: getStockMovements,
  });
};

export const useAddStockMovement = () => {
  const queryClient = useQueryClient();
  return useMutation<StockMovement, Error, StockMovementFormValues, { toastId: string }>({
    mutationFn: createStockMovement,
    onMutate: () => {
      const toastId: string = showLoading("Registrando movimiento de stock...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
      queryClient.invalidateQueries({ queryKey: ["insumos"] }); // Invalidate insumos to reflect stock changes
      showSuccess("Movimiento de stock registrado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al registrar movimiento de stock: ${error.message}`);
    },
  });
};