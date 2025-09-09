import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatos, getPlatoById, createPlato, updatePlato, deletePlato } from "@/integrations/supabase/platos";
import { Plato, PlatoFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useSession } from "@/contexts/SessionContext";

export const usePlatos = () => {
  return useQuery<Plato[], Error>({
    queryKey: ["platos"],
    queryFn: getPlatos,
  });
};

export const usePlato = (id: string) => {
  return useQuery<Plato | null, Error>({
    queryKey: ["platos", id],
    queryFn: () => getPlatoById(id),
    enabled: !!id, // Only run the query if id is available
  });
};

export const useAddPlato = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<Plato, Error, PlatoFormValues, { toastId: string }>({
    mutationFn: async (platoData) => {
      if (!user?.id) throw new Error("User not authenticated.");
      return createPlato(platoData, user.id);
    },
    onMutate: () => {
      const toastId: string = showLoading("Añadiendo plato...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["platos"] });
      showSuccess("Plato añadido exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al añadir plato: ${error.message}`);
    },
  });
};

export const useUpdatePlato = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<Plato, Error, { id: string; plato: PlatoFormValues }, { toastId: string }>({
    mutationFn: async ({ id, plato }) => {
      if (!user?.id) throw new Error("User not authenticated.");
      return updatePlato(id, plato, user.id);
    },
    onMutate: () => {
      const toastId: string = showLoading("Actualizando plato...");
      return { toastId };
    },
    onSuccess: (_, { id }, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["platos"] });
      queryClient.invalidateQueries({ queryKey: ["platos", id] }); // Invalidate specific plato query
      showSuccess("Plato actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar plato: ${error.message}`);
    },
  });
};

export const useDeletePlato = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: async (id) => {
      if (!user?.id) throw new Error("User not authenticated.");
      return deletePlato(id, user.id);
    },
    onMutate: () => {
      const toastId: string = showLoading("Eliminando plato...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["platos"] });
      showSuccess("Plato eliminado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) { // Added optional chaining
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar plato: ${error.message}`);
    },
  });
};