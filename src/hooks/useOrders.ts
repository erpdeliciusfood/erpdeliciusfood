import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerOrders, getCustomerOrderById, createCustomerOrder, updateCustomerOrder, deleteCustomerOrder } from "@/integrations/supabase/orders";
import { Order, OrderFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useCustomerOrders = () => {
  return useQuery<Order[], Error>({
    queryKey: ["customerOrders"],
    queryFn: getCustomerOrders,
  });
};

export const useCustomerOrder = (id: string) => {
  return useQuery<Order | null, Error>({
    queryKey: ["customerOrders", id],
    queryFn: () => getCustomerOrderById(id),
    enabled: !!id, // Only run the query if id is available
  });
};

export const useAddCustomerOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, OrderFormValues, { toastId: string }>({
    mutationFn: createCustomerOrder,
    onMutate: () => {
      const toastId: string = showLoading("Creando pedido de cliente...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["customerOrders"] });
      showSuccess("Pedido de cliente creado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al crear pedido de cliente: ${error.message}`);
    },
  });
};

export const useUpdateCustomerOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, { id: string; order: OrderFormValues }, { toastId: string }>({
    mutationFn: ({ id, order }) => updateCustomerOrder(id, order),
    onMutate: () => {
      const toastId: string = showLoading("Actualizando pedido de cliente...");
      return { toastId };
    },
    onSuccess: (_, { id }, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["customerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["customerOrders", id] }); // Invalidate specific order query
      showSuccess("Pedido de cliente actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar pedido de cliente: ${error.message}`);
    },
  });
};

export const useDeleteCustomerOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteCustomerOrder,
    onMutate: () => {
      const toastId: string = showLoading("Eliminando pedido de cliente...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["customerOrders"] });
      showSuccess("Pedido de cliente eliminado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar pedido de cliente: ${error.message}`);
    },
  });
};