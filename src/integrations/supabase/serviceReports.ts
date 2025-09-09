import { supabase } from "@/integrations/supabase/client";
import { ServiceReport, ServiceReportFormValues } from "@/types";

export const getServiceReports = async (): Promise<ServiceReport[]> => {
  const { data, error } = await supabase
    .from("service_reports")
    .select("*, meal_services(*), service_report_platos(*, platos(*))") // Fetch service_report_platos and nested platos
    .order("report_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createServiceReport = async (reportData: ServiceReportFormValues): Promise<ServiceReport> => {
  const { platos_vendidos, ...rest } = reportData;

  // Insert the main service report
  const { data: newReport, error: reportError } = await supabase
    .from("service_reports")
    .insert(rest)
    .select("*, meal_services(*)")
    .single();

  if (reportError) throw new Error(reportError.message);
  if (!newReport) throw new Error("Failed to create service report.");

  // Insert associated service_report_platos
  if (platos_vendidos && platos_vendidos.length > 0) {
    const serviceReportPlatosToInsert = platos_vendidos.map((item) => ({
      service_report_id: newReport.id,
      plato_id: item.plato_id,
      quantity_sold: item.quantity_sold,
    }));

    const { error: serviceReportPlatoError } = await supabase
      .from("service_report_platos")
      .insert(serviceReportPlatosToInsert);

    if (serviceReportPlatoError) {
      throw new Error(`Failed to add sold platos to service report: ${serviceReportPlatoError.message}`);
    }
  }

  // Fetch the complete service report with its relations for the return value
  const { data: completeReport, error: fetchError } = await supabase
    .from("service_reports")
    .select("*, meal_services(*), service_report_platos(*, platos(*))")
    .eq("id", newReport.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete service report: ${fetchError.message}`);

  return completeReport;
};

export const updateServiceReport = async (id: string, reportData: ServiceReportFormValues): Promise<ServiceReport> => {
  const { platos_vendidos, ...rest } = reportData;

  // Update the main service report
  const { data: updatedReport, error: reportError } = await supabase
    .from("service_reports")
    .update(rest)
    .eq("id", id)
    .select("*, meal_services(*)")
    .single();

  if (reportError) throw new Error(reportError.message);
  if (!updatedReport) throw new Error("Failed to update service report.");

  // Delete existing service_report_platos for this report
  const { error: deleteError } = await supabase
    .from("service_report_platos")
    .delete()
    .eq("service_report_id", id);

  if (deleteError) throw new Error(`Failed to delete existing sold platos for service report: ${deleteError.message}`);

  // Insert new associated service_report_platos
  if (platos_vendidos && platos_vendidos.length > 0) {
    const serviceReportPlatosToInsert = platos_vendidos.map((item) => ({
      service_report_id: updatedReport.id,
      plato_id: item.plato_id,
      quantity_sold: item.quantity_sold,
    }));

    const { error: serviceReportPlatoError } = await supabase
      .from("service_report_platos")
      .insert(serviceReportPlatosToInsert);

    if (serviceReportPlatoError) {
      throw new Error(`Failed to add new sold platos to service report: ${serviceReportPlatoError.message}`);
    }
  }

  // Fetch the complete service report with its relations for the return value
  const { data: completeReport, error: fetchError } = await supabase
    .from("service_reports")
    .select("*, meal_services(*), service_report_platos(*, platos(*))")
    .eq("id", updatedReport.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete service report: ${fetchError.message}`);

  return completeReport;
};

export const deleteServiceReport = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("service_reports")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};