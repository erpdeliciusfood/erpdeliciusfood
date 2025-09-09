import { supabase } from "@/integrations/supabase/client";
import { ServiceReport, ServiceReportFormValues } from "@/types";

export const getServiceReports = async (): Promise<ServiceReport[]> => {
  const { data, error } = await supabase
    .from("service_reports")
    .select("*, meal_services(*)")
    .order("report_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createServiceReport = async (report: ServiceReportFormValues): Promise<ServiceReport> => {
  const { data, error } = await supabase
    .from("service_reports")
    .insert(report)
    .select("*, meal_services(*)")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateServiceReport = async (id: string, report: ServiceReportFormValues): Promise<ServiceReport> => {
  const { data, error } = await supabase
    .from("service_reports")
    .update(report)
    .eq("id", id)
    .select("*, meal_services(*)")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteServiceReport = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("service_reports")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};