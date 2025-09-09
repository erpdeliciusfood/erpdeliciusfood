import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatos, getPlatoById, createPlato, updatePlato, deletePlato } from "@/integrations/supabase/platos";
import { Plato, PlatoFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

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
  return useMutation<Plato, Error, PlatoFormValues, { toastId: string }>({
    mutationFn: createPlato,
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
      dismissToast(context.toastId);
      showError(`Error al añadir plato: ${error.message}`);
    },
  });
};

export const useUpdatePlato = () => {
  const queryClient = useQueryClient();
  return useMutation<Plato, Error, { id: string; plato: PlatoFormValues }, { toastId: string }>({
    mutationFn: ({ id, plato }) => updatePlato(id, plato),
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
      dismissToast(context.toastId);
      showError(`Error al actualizar plato: ${error.message}`);
    },
  });
};

export const useDeletePlato = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deletePlato,
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
      dismissToast(context.toastId);
      showError(`Error al eliminar plato: ${error.message}`);
    },
  });
};