import { useQuery } from "@tanstack/react-query";
import { getMenuById } from "@/integrations/supabase/menus";
import { Menu } from "@/types";

export const useMenu = (id: string) => {
  return useQuery<Menu, Error>({
    queryKey: ["menus", id],
    queryFn: () => getMenuById(id),
    enabled: !!id,
  });
};