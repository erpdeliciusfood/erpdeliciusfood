import { supabase } from "@/integrations/supabase/client";
import { Insumo, InsumoFormValues } from "@/types";

export const getInsumos = async (): Promise<Insumo[]> => {
  const { data, error } = await supabase.from("insumos").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const createInsumo = async (insumo: InsumoFormValues): Promise<Insumo> => {
  const { data, error } = await supabase.from("insumos").insert(insumo).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateInsumo = async (id: string, insumo: InsumoFormValues): Promise<Insumo> => {
  const { data, error } = await supabase.from("insumos").update(insumo).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteInsumo = async (id: string): Promise<void> => {
  const { error } = await supabase.from("insumos").delete().eq("id", id);
  if (error) throw new Error(error.message);
};