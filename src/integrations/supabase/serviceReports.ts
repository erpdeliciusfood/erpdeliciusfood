import { supabase } from "@/integrations/supabase/client";
import { ServiceReport, ServiceReportFormValues } from "@/types";

export const getServiceReports = async (): Promise<ServiceReport[]> => {
  const { data, error } = await supabase
    .from("service_reports")
    .select("*, meal_services(*), platos_vendidos_data:service_report_platos(*, platos(*))") // Fetch service_report_platos and nested platos
    .order("report_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createServiceReport = async (reportData: ServiceReportFormValues): Promise<ServiceReport> => {
  const { platos_vendidos, ...reportDetails } = reportData;

  // Insert the main service report
  const { data: newReport, error: reportError } = await supabase
    .from("service_reports")
    .insert(reportDetails)
    .select("*, meal_services(*)")
    .single();

  if (reportError) throw new Error(reportError.message);
  if (!newReport) throw new Error("Failed to create service report.");

  // Insert associated platos_vendidos
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

  // Invoke the edge function to deduct stock
  const { data: deductStockData, error: deductStockError } = await supabase.functions.invoke('deduct-stock', {
    body: { service_report_id: newReport.id, user_id: newReport.user_id },
  });

  if (deductStockError) {
    console.error('Error invoking deduct-stock function:', deductStockError);
    // Depending on criticality, you might want to roll back or just log
  } else {
    console.log('Deduct stock function invoked successfully:', deductStockData);
  }

  // Fetch the complete report with its relations for the return value
  const { data: completeReport, error: fetchError } = await supabase
    .from("service_reports")
    .select("*, meal_services(*), platos_vendidos_data:service_report_platos(*, platos(*))")
    .eq("id", newReport.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete service report: ${fetchError.message}`);

  return completeReport;
};

export const updateServiceReport = async (id: string, reportData: ServiceReportFormValues): Promise<ServiceReport> => {
  const { platos_vendidos, ...reportDetails } = reportData;

  // Update the main service report
  const { data: updatedReport, error: reportError } = await supabase
    .from("service_reports")
    .update(reportDetails)
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

  // Insert new associated platos_vendidos
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

  // Invoke the edge function to deduct stock (re-deduct for updated report)
  const { data: deductStockData, error: deductStockError } = await supabase.functions.invoke('deduct-stock', {
    body: { service_report_id: updatedReport.id, user_id: updatedReport.user_id },
  });

  if (deductStockError) {
    console.error('Error invoking deduct-stock function on update:', deductStockError);
  } else {
    console.log('Deduct stock function invoked successfully on update:', deductStockData);
  }

  // Fetch the complete report with its relations for the return value
  const { data: completeReport, error: fetchError } = await supabase
    .from("service_reports")
    .select("*, meal_services(*), platos_vendidos_data:service_report_platos(*, platos(*))")
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