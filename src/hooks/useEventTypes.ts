import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventTypes, createEventType, updateEventType, deleteEventType } from "@/integrations/supabase/eventTypes";
import { EventType } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useSession } from "@/contexts/SessionContext";

interface EventTypeFormValues {
  name: string;
  description: string | null;
}

export const useEventTypes = () => {
  return useQuery<EventType[], Error>({
    queryKey: ["eventTypes"],
    queryFn: getEventTypes,
  });
};

export const useAddEventType = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<EventType, Error, EventTypeFormValues, { toastId: string }>({
    mutationFn: async (eventTypeData) => {
      if (!user?.id) throw new Error("User not authenticated.");
      return createEventType(eventTypeData, user.id);
    },
    onMutate: () => {
      const toastId: string = showLoading("Añadiendo tipo de evento...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
      showSuccess("Tipo de evento añadido exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al añadir tipo de evento: ${error.message}`);
    },
  });
};

export const useUpdateEventType = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<EventType, Error, { id: string; eventType: EventTypeFormValues }, { toastId: string }>({
    mutationFn: async ({ id, eventType }) => {
      if (!user?.id) throw new Error("User not authenticated.");
      return updateEventType(id, eventType, user.id);
    },
    onMutate: () => {
      const toastId: string = showLoading("Actualizando tipo de evento...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
      showSuccess("Tipo de evento actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar tipo de evento: ${error.message}`);
    },
  });
};

export const useDeleteEventType = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: async (id) => {
      if (!user?.id) throw new Error("User not authenticated.");
      return deleteEventType(id, user.id);
    },
    onMutate: () => {
      const toastId: string = showLoading("Eliminando tipo de evento...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
      showSuccess("Tipo de evento eliminado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar tipo de evento: ${error.message}`);
    },
  });
};