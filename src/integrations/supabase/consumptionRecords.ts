import { supabase } from "@/integrations/supabase/client";
import { ConsumptionRecord } from "@/types";

export const getConsumptionRecords = async (): Promise<ConsumptionRecord[]> => {
  const { data, error } = await supabase
    .from("consumption_records")
    .select("*, insumos(*), orders(customer_name)") // Fetch related insumo and order customer name
    .order("consumed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};