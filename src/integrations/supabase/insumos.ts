import { supabase } from "@/integrations/supabase/client";
import { Insumo, InsumoFormValues, InsumoSupplierHistory, InsumoPriceHistory } from "@/types";

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

  // Ensure non-nullable fields are not null
  const processedInsumo = {
    ...insumo,
    supplier_name: insumo.supplier_name || '',
    supplier_phone: insumo.supplier_phone || '',
  };

  const { data, error } = await supabase.from("insumos").insert({ ...processedInsumo, user_id: user.id }).select().single();
  if (error) throw new Error(error.message);
  return data;
};

// NEW: Function to create multiple insumos in a batch
export const createMultipleInsumos = async (insumos: InsumoFormValues[]): Promise<number> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated.");

  const insumosWithUserId = insumos.map(insumo => ({
    ...insumo,
    user_id: user.id,
    // Ensure non-nullable fields are not null by defaulting to empty string
    supplier_name: insumo.supplier_name || '',
    supplier_phone: insumo.supplier_phone || '',
  }));

  const { data, error } = await supabase.from("insumos").insert(insumosWithUserId).select("id");

  if (error) throw new Error(error.message);
  return data ? data.length : 0;
};

export const updateInsumo = async (id: string, insumo: InsumoFormValues): Promise<Insumo> => {
  // Ensure non-nullable fields are not null
  const processedInsumo = {
    ...insumo,
    supplier_name: insumo.supplier_name || '',
    supplier_phone: insumo.supplier_phone || '',
  };

  const { data, error } = await supabase.from("insumos").update(processedInsumo).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteInsumo = async (id: string): Promise<void> => {
  const { error } = await supabase.from("insumos").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const getInsumoSupplierHistory = async (insumoId: string): Promise<InsumoSupplierHistory[]> => {
  const { data, error } = await supabase
    .from("insumo_supplier_history")
    .select("*")
    .eq("insumo_id", insumoId)
    .order("changed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getInsumoPriceHistory = async (insumoId: string): Promise<InsumoPriceHistory[]> => {
  const { data, error } = await supabase
    .from("insumo_price_history")
    .select("*")
    .eq("insumo_id", insumoId)
    .order("changed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};