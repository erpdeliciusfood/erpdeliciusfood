import { useQuery } from "@tanstack/react-query";
import { getStockMovements } from "@/integrations/supabase/stockMovements";
import { StockMovementRecord } from "@/types";
import { format } from "date-fns"; // Added missing import

export const useStockMovements = (startDate?: Date, endDate?: Date) => {
  const formattedStartDate = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
  const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : undefined;

  return useQuery<StockMovementRecord[], Error>({
    queryKey: ["stockMovements", formattedStartDate, formattedEndDate],
    queryFn: () => {
      if (!formattedStartDate || !formattedEndDate) {
        throw new Error("Start date and end date are required for stock movements query.");
      }
      return getStockMovements(formattedStartDate, formattedEndDate);
    },
    enabled: !!formattedStartDate && !!formattedEndDate, // Only fetch if both dates are provided
  });
};