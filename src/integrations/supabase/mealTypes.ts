import { supabase } from "@/integrations/supabase/client";
import { MealType } from "@/types";

interface MealTypeFormValues {
  name: string;
  description: string | null;
}

export const getMealTypes = async (): Promise<MealType[]> => {
  const { data, error } = await supabase
    .from("meal_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const createMealType = async (mealType: MealTypeFormValues): Promise<MealType> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated.");

  const { data, error } = await supabase
    .from("meal_types")
    .insert({ ...mealType, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateMealType = async (id: string, mealType: MealTypeFormValues): Promise<MealType> => {
  const { data, error } = await supabase
    .from("meal_types")
    .update(mealType)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteMealType = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("meal_types")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};