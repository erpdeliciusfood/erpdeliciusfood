import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConsumptionRecord } from "@/types";

export const getConsumptionRecords = async (startDate?: string, endDate?: string): Promise<ConsumptionRecord[]> => {
  let query = supabase
    .from("consumption_records")
    .select("*, insumos(nombre, unidad_medida, costo_unitario), service_reports(report_date, menus(title))")
    .order("consumed_at", { ascending: false });

  if (startDate) {
    query = query.gte("consumed_at", startDate);
  }
  if (endDate) {
    query = query.lte("consumed_at", endDate);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
};

export const useConsumptionRecords = (startDate?: string, endDate?: string) => {
  return useQuery<ConsumptionRecord[], Error>({
    queryKey: ["consumptionRecords", startDate, endDate],
    queryFn: () => getConsumptionRecords(startDate, endDate),
    enabled: !!startDate && !!endDate, // Only fetch if both dates are provided
  });
};