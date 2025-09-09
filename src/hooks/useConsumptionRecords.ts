import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConsumptionRecord } from "@/types";

export const getConsumptionRecords = async (): Promise<ConsumptionRecord[]> => {
  const { data, error } = await supabase
    .from("consumption_records")
    .select("*, insumos(nombre, unidad_medida), service_reports(report_date, menus(title))")
    .order("consumed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const useConsumptionRecords = () => {
  return useQuery<ConsumptionRecord[], Error>({
    queryKey: ["consumptionRecords"],
    queryFn: getConsumptionRecords,
  });
};