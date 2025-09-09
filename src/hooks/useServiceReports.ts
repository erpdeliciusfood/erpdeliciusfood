import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServiceReports, createServiceReport, updateServiceReport, deleteServiceReport } from "@/integrations/supabase/serviceReports";
import { ServiceReport, ServiceReportFormValues } from "@/types";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

export const useServiceReports = () => {
  return useQuery<ServiceReport[], Error>({
    queryKey: ["serviceReports"],
    queryFn: getServiceReports,
  });
};

export const useAddServiceReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ServiceReport, Error, ServiceReportFormValues, { toastId: string }>({
    mutationFn: createServiceReport,
    onMutate: () => {
      const toastId: string = showLoading("Añadiendo reporte de servicio...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["serviceReports"] });
      showSuccess("Reporte de servicio añadido exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al añadir reporte de servicio: ${error.message}`);
    },
  });
};

export const useUpdateServiceReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ServiceReport, Error, { id: string; report: ServiceReportFormValues }, { toastId: string }>({
    mutationFn: ({ id, report }) => updateServiceReport(id, report),
    onMutate: () => {
      const toastId: string = showLoading("Actualizando reporte de servicio...");
      return { toastId };
    },
    onSuccess: (_, { id }, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["serviceReports"] });
      queryClient.invalidateQueries({ queryKey: ["serviceReports", id] });
      showSuccess("Reporte de servicio actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar reporte de servicio: ${error.message}`);
    },
  });
};

export const useDeleteServiceReport = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { toastId: string }>({
    mutationFn: deleteServiceReport,
    onMutate: () => {
      const toastId: string = showLoading("Eliminando reporte de servicio...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["serviceReports"] });
      showSuccess("Reporte de servicio eliminado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar reporte de servicio: ${error.message}`);
    },
  });
};