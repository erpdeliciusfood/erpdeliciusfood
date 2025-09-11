import { supabase } from "@/integrations/supabase/client";
import { ServiceReport, ServiceReportFormValues, Receta } from "@/types"; // Removed Receta

// Helper to map DB fields to ServiceReport interface fields
const mapDbServiceReportToServiceReport = (dbReport: any): ServiceReport => ({
  id: dbReport.id,
  report_date: dbReport.report_date,
  meal_service_id: dbReport.meal_service_id,
  total_servings: dbReport.total_servings, // Keep for ServiceReport interface
  total_revenue: dbReport.total_revenue,   // Keep for ServiceReport interface
  notes: dbReport.notes,
  meal_service: dbReport.meal_services, // Assuming 'meal_services' is the joined table
  service_report_platos: dbReport.service_report_platos?.map((srp: any) => ({
    id: srp.id,
    service_report_id: srp.service_report_id,
    receta_id: srp.receta_id, // Changed from plato_id
    quantity_sold: srp.quantity_sold,
    receta: {
      id: srp.platos.id,
      user_id: srp.platos.user_id, // Añadido user_id
      nombre: srp.platos.nombre,
      descripcion: srp.platos.descripcion,
      category: srp.platos.categoria,
      tiempo_preparacion: srp.platos.tiempo_preparacion,
      costo_total: srp.platos.costo_total,
      plato_insumos: [],
    } as Receta,
  })) || [],
  tickets_issued: dbReport.tickets_issued,
  meals_sold: dbReport.meals_sold,
  additional_services_revenue: dbReport.additional_services_revenue,
});

export const getServiceReports = async (): Promise<ServiceReport[]> => {
  const { data, error } = await supabase
    .from("service_reports")
    .select(`
      *,
      meal_services (id, name, description),
      service_report_platos (
        *,
        platos (id, nombre, descripcion, categoria, tiempo_preparacion, costo_total, user_id) -- Añadido user_id
      )
    `)
    .order("report_date", { ascending: false });
  if (error) throw error;
  return data.map(mapDbServiceReportToServiceReport);
};

export const createServiceReport = async (report: ServiceReportFormValues): Promise<ServiceReport> => {
  const { platos_vendidos, ...reportData } = report;
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated.");

  const { data: newReport, error: reportError } = await supabase
    .from("service_reports")
    .insert({
      ...reportData,
      user_id: user.id, // Add user_id here
      // total_servings and total_revenue are not directly inserted from form,
      // they are either calculated in DB or derived in frontend.
      // Ensure tickets_issued, meals_sold, additional_services_revenue are passed.
    })
    .select()
    .single();
  if (reportError) throw reportError;

  if (platos_vendidos && platos_vendidos.length > 0) {
    const serviceReportPlatosToInsert = platos_vendidos.map((item: { receta_id: string; quantity_sold: number; }) => ({ // Typed item, changed plato_id to receta_id
      service_report_id: newReport.id,
      receta_id: item.receta_id, // Changed plato_id to receta_id
      quantity_sold: item.quantity_sold,
    }));
    const { error: serviceReportPlatoError } = await supabase
      .from("service_report_platos")
      .insert(serviceReportPlatosToInsert);
    if (serviceReportPlatoError) throw serviceReportPlatoError;
  }

  return getServiceReportsById(newReport.id);
};

export const updateServiceReport = async (id: string, report: ServiceReportFormValues): Promise<ServiceReport> => {
  const { platos_vendidos, ...reportData } = report;
  if (!id) throw new Error("Service Report ID is required for update.");

  const { data: updatedReport, error: reportError } = await supabase
    .from("service_reports")
    .update({
      ...reportData,
      // total_servings and total_revenue are not directly updated from form.
      // Ensure tickets_issued, meals_sold, additional_services_revenue are passed.
    })
    .eq("id", id)
    .select()
    .single();
  if (reportError) throw reportError;

  // Delete existing service_report_platos and insert new ones
  await supabase.from("service_report_platos").delete().eq("service_report_id", id);

  if (platos_vendidos && platos_vendidos.length > 0) {
    const serviceReportPlatosToInsert = platos_vendidos.map((item: { receta_id: string; quantity_sold: number; }) => ({ // Typed item, changed plato_id to receta_id
      service_report_id: updatedReport.id,
      receta_id: item.receta_id, // Changed plato_id to receta_id
      quantity_sold: item.quantity_sold,
    }));
    const { error: serviceReportPlatoError } = await supabase
      .from("service_report_platos")
      .insert(serviceReportPlatosToInsert);
    if (serviceReportPlatoError) throw serviceReportPlatoError;
  }

  return getServiceReportsById(updatedReport.id);
};

export const deleteServiceReport = async (id: string): Promise<void> => {
  // Delete associated service_report_platos first
  await supabase.from("service_report_platos").delete().eq("service_report_id", id);
  const { error } = await supabase.from("service_reports").delete().eq("id", id);
  if (error) throw error;
};

export const getServiceReportsById = async (id: string): Promise<ServiceReport> => {
  const { data, error } = await supabase
    .from("service_reports")
    .select(`
      *,
      meal_services (id, name, description),
      service_report_platos (
        *,
        platos (id, nombre, descripcion, categoria, tiempo_preparacion, costo_total, user_id) -- Añadido user_id
      )
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapDbServiceReportToServiceReport(data);
};