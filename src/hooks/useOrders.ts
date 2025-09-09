import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder } from "@/integrations/supabase/orders";
import { Order, OrderFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useOrders = () => {
  return useQuery<Order[], Error>({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
};

export const useOrder = (id: string) => {
  return useQuery<Order | null, Error>({
    queryKey: ["orders", id],
    queryFn: () => getOrderById(id),
    enabled: !!id, // Only run the query if id is available
  });
};

export const useAddOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, OrderFormValues, { toastId: string }>({
    mutationFn: createOrder,
    onMutate: () => {
      const toastId: string = showLoading("Creando pedido...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showSuccess("Pedido creado exitosamente.");
    },
    onError: (error, __, context) => {
      dismissToast(context.toastId);
      showError(`Error al crear pedido: ${error.message}`);
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, { id: string; order: OrderFormValues }, { toastId: string }>({
    mutationFn: ({ id, order }) => updateOrder(id, order),
    onMutate: () => {
      const toastId: string = showLoading("Actualizando pedido...");
      return { toastId };
    },
    onSuccess: (_, { id }, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] }); // Invalidate specific order query
      showSuccess("Pedido actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      dismissToast(context.toastId);
      showError(`Error al actualizar pedido: ${error.message}`);
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteOrder,
    onMutate: () => {
      const toastId: string = showLoading("Eliminando pedido...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showSuccess("Pedido eliminado exitosamente.");
    },
    onError: (error, __, context) => {
      dismissToast(context.toastId);
      showError(`Error al eliminar pedido: ${error.message}`);
    },
  });
};