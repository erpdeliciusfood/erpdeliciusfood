import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMealTypes, createMealType, updateMealType, deleteMealType } from "@/integrations/supabase/mealTypes";
import { MealType } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

interface MealTypeFormValues {
  name: string;
  description: string | null;
}

export const useMealTypes = () => {
  return useQuery<MealType[], Error>({
    queryKey: ["mealTypes"],
    queryFn: getMealTypes,
  });
};

export const useAddMealType = () => {
  const queryClient = useQueryClient();
  return useMutation<MealType, Error, MealTypeFormValues, { toastId: string }>({
    mutationFn: createMealType,
    onMutate: () => {
      const toastId: string = showLoading("Añadiendo tipo de plato...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["mealTypes"] });
      showSuccess("Tipo de plato añadido exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al añadir tipo de plato: ${error.message}`);
    },
  });
};

export const useUpdateMealType = () => {
  const queryClient = useQueryClient();
  return useMutation<MealType, Error, { id: string; mealType: MealTypeFormValues }, { toastId: string }>({
    mutationFn: ({ id, mealType }) => updateMealType(id, mealType),
    onMutate: () => {
      const toastId: string = showLoading("Actualizando tipo de plato...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["mealTypes"] });
      showSuccess("Tipo de plato actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar tipo de plato: ${error.message}`);
    },
  });
};

export const useDeleteMealType = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteMealType,
    onMutate: () => {
      const toastId: string = showLoading("Eliminando tipo de plato...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["mealTypes"] });
      showSuccess("Tipo de plato eliminado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar tipo de plato: ${error.message}`);
    },
  });
};