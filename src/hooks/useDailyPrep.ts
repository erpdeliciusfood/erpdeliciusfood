import { useQuery } from "@tanstack/react-query";
import { useMenusList } from "@/hooks/useMenus"; // Updated import
import { Menu } from "@/types";

// This hook is a wrapper around useMenusList, specifically for the daily prep context.
// It can be extended in the future if more specific data fetching or mutations are needed for daily prep.
export const useDailyPrepMenus = (date: string | undefined) => {
  return useQuery<Menu[], Error>({
    queryKey: ["dailyPrepMenus", date],
    queryFn: () => (date ? useMenusList(date, date).queryFn!() : Promise.resolve([])), // Directly call queryFn
    enabled: !!date,
  });
};