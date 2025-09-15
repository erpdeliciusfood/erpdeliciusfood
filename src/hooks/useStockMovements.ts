import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStockMovements, createStockMovement } from "@/integrations/supabase/stockMovements";
import { StockMovement, StockMovementFormValues } from "@/types/index";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useSession } from "@/contexts/SessionContext"; // NEW: Import useSession

export const useStockMovements = () => {
  return useQuery<StockMovement[], Error>({
    queryKey: ["stockMovements"],
    queryFn: getStockMovements,
  });
};

export const useAddStockMovement = () => {
  const queryClient = useQueryClient();
  const { user } = useSession(); // NEW: Get user from session

  return useMutation<StockMovement, Error, StockMovementFormValues, { toastId: string }>({
    mutationFn: async (movementData) => { // NEW: Use an async function to pass userId
      if (!user?.id) {
        throw new Error("User not authenticated.");
      }
      return createStockMovement({ ...movementData, user_id: user.id }); // Pass user_id within movementData
    },
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