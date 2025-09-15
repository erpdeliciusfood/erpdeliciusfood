import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecetas, getRecetaById, createReceta, updateReceta, deleteReceta } from "@/integrations/supabase/recetas"; // Changed imports
import { Receta, RecetaFormValues } from "@/types/index"; // Changed type imports
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useRecetas = () => { // Changed hook name
  return useQuery<Receta[], Error>({ // Changed type
    queryKey: ["recetas"], // Changed query key
    queryFn: getRecetas, // Changed function name
  });
};

export const useReceta = (id: string) => { // Changed hook name and type
  return useQuery<Receta | null, Error>({ // Changed type
    queryKey: ["recetas", id], // Changed query key
    queryFn: () => getRecetaById(id), // Changed function name
    enabled: !!id,
  });
};

export const useAddReceta = () => { // Changed hook name
  const queryClient = useQueryClient();
  return useMutation<Receta, Error, RecetaFormValues, { toastId: string }>({ // Changed type
    mutationFn: createReceta, // Changed function name
    onMutate: () => {
      const toastId: string = showLoading("Añadiendo receta..."); // Changed text
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["recetas"] }); // Changed query key
      showSuccess("Receta añadida exitosamente."); // Changed text
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al añadir receta: ${error.message}`); // Changed text
    },
  });
};

export const useUpdateReceta = () => { // Changed hook name
  const queryClient = useQueryClient();
  return useMutation<Receta, Error, { id: string; plato: RecetaFormValues }, { toastId: string }>({ // Changed type
    mutationFn: ({ id, plato }) => updateReceta(id, plato), // Changed function name and variable name
    onMutate: () => {
      const toastId: string = showLoading("Actualizando receta..."); // Changed text
      return { toastId };
    },
    onSuccess: (_, { id }, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["recetas"] }); // Changed query key
      queryClient.invalidateQueries({ queryKey: ["recetas", id] }); // Changed query key
      showSuccess("Receta actualizada exitosamente."); // Changed text
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar receta: ${error.message}`); // Changed text
    },
  });
};

export const useDeleteReceta = () => { // Changed hook name
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteReceta, // Changed function name
    onMutate: () => {
      const toastId: string = showLoading("Eliminando receta..."); // Changed text
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["recetas"] }); // Changed query key
      showSuccess("Receta eliminada exitosamente."); // Changed text
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar receta: ${error.message}`); // Changed text
    },
  });
};