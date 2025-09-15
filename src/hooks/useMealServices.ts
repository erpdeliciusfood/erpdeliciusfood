import { useQuery } from "@tanstack/react-query";
import { getMealServices } from "@/integrations/supabase/mealServices";
import { MealService } from "@/types/index";

export const useMealServices = () => {
  return useQuery<MealService[], Error>({
    queryKey: ["mealServices"],
    queryFn: getMealServices,
  });
};