import { supabase } from "@/integrations/supabase/client";
import { Insumo, InsumoFormValues } from "@/types";

export const getInsumos = async (): Promise<Insumo[]> => {
  const { data, error } = await supabase.from("insumos").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const createInsumo = async (insumo: InsumoFormValues, userId: string): Promise<Insumo> => {
  const { data, error } = await supabase.from("insumos").insert({ ...insumo, user_id: userId }).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateInsumo = async (id: string, insumo: InsumoFormValues, userId: string): Promise<Insumo> => {
  const { data, error } = await supabase.from("insumos").update(insumo).eq("id", id).eq("user_id", userId).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteInsumo = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase.from("insumos").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
};