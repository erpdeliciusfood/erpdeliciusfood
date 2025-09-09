import { useQuery } from "@tanstack/react-query";
import { getConsumptionRecords } from "@/integrations/supabase/consumptionRecords";
import { ConsumptionRecord } from "@/types";

export const useConsumptionRecords = () => {
  return useQuery<ConsumptionRecord[], Error>({
    queryKey: ["consumptionRecords"],
    queryFn: getConsumptionRecords,
  });
};