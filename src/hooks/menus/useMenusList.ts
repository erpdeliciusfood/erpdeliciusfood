import { useQuery } from "@tanstack/react-query";
import { getMenus } from "@/integrations/supabase/menus";
import { Menu } from "@/types";

export const useMenusList = (startDate?: string, endDate?: string) => {
  return useQuery<Menu[], Error>({
    queryKey: ["menus", startDate, endDate],
    queryFn: () => getMenus(startDate, endDate),
  });
};