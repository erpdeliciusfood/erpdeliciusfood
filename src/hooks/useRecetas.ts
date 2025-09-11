import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecetas, getRecetaById, createReceta, updateReceta, deleteReceta } from "@/integrations/supabase/recetas"; // Changed imports
import { Receta, RecetaFormValues } from "@/types"; // Changed type imports
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useRecetas = () => {
  return useQuery<Receta[], Error>({
    queryKey: ["recetas"],
    queryFn: getRecetas,
  });
};

export const useRecetaById = (id: string) => {
  return useQuery<Receta, Error>({
    queryKey: ["recetas", id],
    queryFn: () => getRecetaById(id),
    enabled: !!id,
  });
};

export const useAddReceta = () => {
  const queryClient = useQueryClient();
  return useMutation<Receta, Error, RecetaFormValues, { toastId: string }>({
    mutationFn: createReceta,
    onMutate: () => {
      return { toastId: showLoading("Agregando receta...") };
    },
    onSuccess: (_, __, context) => {
      if (context?.toastId) dismissToast(context.toastId);
      showSuccess("Receta agregada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["recetas"] });
    },
    onError: (error, _, context) => {
      if (context?.toastId) dismissToast(context.toastId);
      showError(`Error al agregar receta: ${error.message}`);
    },
  });
};

export const useUpdateReceta = () => {
  const queryClient = useQueryClient();
  return useMutation<Receta, Error, { id: string; plato: RecetaFormValues }, { toastId: string }>({
    mutationFn: ({ id, plato }) => updateReceta(id, plato),
    onMutate: () => {
      return { toastId: showLoading("Actualizando receta...") };
    },
    onSuccess: (_, __, context) => {
      if (context?.toastId) dismissToast(context.toastId);
      showSuccess("Receta actualizada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["recetas"] });
    },
    onError: (error, _, context) => {
      if (context?.toastId) dismissToast(context.toastId);
      showError(`Error al actualizar receta: ${error.message}`);
    },
  });
};

export const useDeleteReceta = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteReceta,
    onMutate: () => {
      return { toastId: showLoading("Eliminando receta...") };
    },
    onSuccess: (_, __, context) => {
      if (context?.toastId) dismissToast(context.toastId);
      showSuccess("Receta eliminada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["recetas"] });
    },
    onError: (error, _, context) => {
      if (context?.toastId) dismissToast(context.toastId);
      showError(`Error al eliminar receta: ${error.message}`);
    },
  });
};