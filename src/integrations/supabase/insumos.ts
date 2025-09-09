import { supabase } from "@/integrations/supabase/client";
import { Insumo, InsumoFormValues } from "@/types";

export const getInsumos = async (searchTerm?: string, category?: string): Promise<Insumo[]> => {
  let query = supabase.from("insumos").select("*");

  if (searchTerm) {
    query = query.ilike("nombre", `%${searchTerm}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const createInsumo = async (insumo: InsumoFormValues): Promise<Insumo> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated.");

  const { data, error } = await supabase.from("insumos").insert({ ...insumo, user_id: user.id }).select().single();
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