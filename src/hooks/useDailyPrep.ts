import { useQuery } from "@tanstack/react-query";
import { getMenus } from "@/integrations/supabase/menus";
import { Menu } from "@/types";

// This hook is a wrapper around useMenus, specifically for the daily prep context.
// It can be extended in the future if more specific data fetching or mutations are needed for daily prep.
export const useDailyPrepMenus = (date: string | undefined) => {
  return useQuery<Menu[], Error>({
    queryKey: ["dailyPrepMenus", date],
    queryFn: () => (date ? getMenus(date, date) : Promise.resolve([])),
    enabled: !!date,
  });
};