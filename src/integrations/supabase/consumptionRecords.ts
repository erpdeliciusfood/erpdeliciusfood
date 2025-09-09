import { supabase } from "@/integrations/supabase/client";
import { ConsumptionRecord } from "@/types";

export const getConsumptionRecords = async (): Promise<ConsumptionRecord[]> => {
  const { data, error } = await supabase
    .from("consumption_records")
    .select("*, insumos(*), orders(customer_name)") // 'orders' is the table name in Supabase, so this is correct.
    .order("consumed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};