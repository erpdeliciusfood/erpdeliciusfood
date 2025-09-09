import { supabase } from "@/integrations/supabase/client";
import { MealService } from "@/types";

export const getMealServices = async (): Promise<MealService[]> => {
  const { data, error } = await supabase
    .from("meal_services")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};