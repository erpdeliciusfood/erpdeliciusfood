import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from "@/integrations/supabase/insumos";
import { Insumo, InsumoFormValues } from "@/types"; // Importar Insumo
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useInsumos = () => {
  return useQuery<Insumo[], Error>({
    queryKey: ["insumos"],
    queryFn: getInsumos,
  });
};

export const useAddInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<Insumo, Error, InsumoFormValues, { toastId: string }>({ // Añadir tipo de contexto
    mutationFn: createInsumo,
    onMutate: () => {
      const toastId: string = showLoading("Añadiendo insumo..."); // Asegurar que toastId es string
      return { toastId }; // Retornar toastId en el contexto
    },
    onSuccess: (_, __, context) => { // Acceder al contexto
      dismissToast(context.toastId); // Pasar toastId
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
      showSuccess("Insumo añadido exitosamente.");
    },
    onError: (error, __, context) => { // Acceder al contexto
      dismissToast(context.toastId); // Pasar toastId
      showError(`Error al añadir insumo: ${error.message}`);
    },
  });
};

export const useUpdateInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<Insumo, Error, { id: string; insumo: InsumoFormValues }, { toastId: string }>({ // Añadir tipo de contexto
    mutationFn: ({ id, insumo }) => updateInsumo(id, insumo),
    onMutate: () => {
      const toastId: string = showLoading("Actualizando insumo..."); // Asegurar que toastId es string
      return { toastId }; // Retornar toastId en el contexto
    },
    onSuccess: (_, __, context) => { // Acceder al contexto
      dismissToast(context.toastId); // Pasar toastId
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
      showSuccess("Insumo actualizado exitosamente.");
    },
    onError: (error, __, context) => { // Acceder al contexto
      dismissToast(context.toastId); // Pasar toastId
      showError(`Error al actualizar insumo: ${error.message}`);
    },
  });
};

export const useDeleteInsumo = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({ // Añadir tipo de contexto
    mutationFn: deleteInsumo,
    onMutate: () => {
      const toastId: string = showLoading("Eliminando insumo..."); // Asegurar que toastId es string
      return { toastId }; // Retornar toastId en el contexto
    },
    onSuccess: (_, __, context) => { // Acceder al contexto
      dismissToast(context.toastId); // Pasar toastId
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
      showSuccess("Insumo eliminado exitosamente.");
    },
    onError: (error, __, context) => { // Acceder al contexto
      dismissToast(context.toastId); // Pasar toastId
      showError(`Error al eliminar insumo: ${error.message}`);
    },
  });
};