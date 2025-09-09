import { supabase } from "@/integrations/supabase/client";
import { ServiceReport, ServiceReportFormValues } from "@/types";

export const getServiceReports = async (): Promise<ServiceReport[]> => {
  const { data, error } = await supabase
    .from("service_reports")
    .select("*, meal_services(name), platos_vendidos_data:service_report_platos(*, platos(nombre, precio_venta, costo_produccion))") // Fetch meal_service name and sold platos data including precio_venta and costo_produccion
    .order("report_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createServiceReport = async (reportData: ServiceReportFormValues): Promise<ServiceReport> => {
  const { platos_vendidos, ...baseReport } = reportData;

  // Insert the main service report
  const { data: newReport, error: reportError } = await supabase
    .from("service_reports")
    .insert(baseReport)
    .select("*, meal_services(name)") // Fetch meal_service name on insert
    .single();

  if (reportError) throw new Error(reportError.message);
  if (!newReport) throw new Error("Failed to create service report.");

  // Insert associated sold platos
  if (platos_vendidos && platos_vendidos.length > 0) {
    const serviceReportPlatosToInsert = platos_vendidos.map((item) => ({
      service_report_id: newReport.id,
      plato_id: item.plato_id,
      quantity_sold: item.quantity_sold,
    }));

    const { error: platosVendidosError } = await supabase
      .from("service_report_platos")
      .insert(serviceReportPlatosToInsert);

    if (platosVendidosError) {
      throw new Error(`Failed to add sold platos to service report: ${platosVendidosError.message}`);
    }
  }

  // Fetch the complete service report with its relations for the return value
  const { data: completeReport, error: fetchError } = await supabase
    .from("service_reports")
    .select("*, meal_services(name), platos_vendidos_data:service_report_platos(*, platos(nombre, precio_venta, costo_produccion))") // Deep fetch for plato details
    .eq("id", newReport.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete service report: ${fetchError.message}`);

  return completeReport;
};

export const updateServiceReport = async (id: string, reportData: ServiceReportFormValues): Promise<ServiceReport> => {
  const { platos_vendidos, ...baseReport } = reportData;

  // Update the main service report
  const { data: updatedReport, error: reportError } = await supabase
    .from("service_reports")
    .update(baseReport)
    .eq("id", id)
    .select("*, meal_services(name)") // Fetch meal_service name on update
    .single();

  if (reportError) throw new Error(reportError.message);
  if (!updatedReport) throw new Error("Failed to update service report.");

  // Delete existing sold platos for this service report
  const { error: deleteError } = await supabase
    .from("service_report_platos")
    .delete()
    .eq("service_report_id", id);

  if (deleteError) throw new Error(`Failed to delete existing sold platos for service report: ${deleteError.message}`);

  // Insert new associated sold platos
  if (platos_vendidos && platos_vendidos.length > 0) {
    const serviceReportPlatosToInsert = platos_vendidos.map((item) => ({
      service_report_id: updatedReport.id,
      plato_id: item.plato_id,
      quantity_sold: item.quantity_sold,
    }));

    const { error: platosVendidosError } = await supabase
      .from("service_report_platos")
      .insert(serviceReportPlatosToInsert);

    if (platosVendidosError) {
      throw new Error(`Failed to add new sold platos to service report: ${platosVendidosError.message}`);
    }
  }

  // Fetch the complete service report with its relations for the return value
  const { data: completeReport, error: fetchError } = await supabase
    .from("service_reports")
    .select("*, meal_services(name), platos_vendidos_data:service_report_platos(*, platos(nombre, precio_venta, costo_produccion))") // Deep fetch for plato details
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