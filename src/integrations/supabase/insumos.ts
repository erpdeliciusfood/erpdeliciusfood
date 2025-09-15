import { supabase } from "@/integrations/supabase/client";
import { Insumo, InsumoFormValues, InsumoSupplierHistory, InsumoPriceHistory } from "@/types/index";

export const getInsumos = async (
  searchTerm?: string,
  category?: string,
  page: number = 1, // New parameter for current page
  pageSize: number = 10 // New parameter for items per page
): Promise<{ data: Insumo[]; count: number }> => {
  let query = supabase.from("insumos").select("*, pending_reception_quantity, pending_delivery_quantity, last_physical_count_quantity, last_physical_count_date, discrepancy_quantity", { count: 'exact' }); // Request exact count and NEW fields

  if (searchTerm) {
    query = query.ilike("nombre", `%${searchTerm}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  query = query.order("nombre", { ascending: true }).order("created_at", { ascending: false });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data || [], count: count || 0 };
};

export const createInsumo = async (insumo: InsumoFormValues): Promise<Insumo> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated.");

  // Ensure non-nullable fields are not null and set defaults for new stock fields
  const processedInsumo = {
    ...insumo,
    supplier_name: insumo.supplier_name || '',
    supplier_phone: insumo.supplier_phone || '',
    supplier_address: insumo.supplier_address || '',
    pending_reception_quantity: insumo.pending_reception_quantity ?? 0, // Default to 0
    pending_delivery_quantity: insumo.pending_delivery_quantity ?? 0, // Default to 0
    last_physical_count_quantity: insumo.last_physical_count_quantity ?? 0, // Default to 0
    last_physical_count_date: insumo.last_physical_count_date || null, // Default to null
    discrepancy_quantity: insumo.discrepancy_quantity ?? 0, // Default to 0
  };

  const { data, error } = await supabase.from("insumos").insert({ ...processedInsumo, user_id: user.id }).select("*, pending_reception_quantity, pending_delivery_quantity, last_physical_count_quantity, last_physical_count_date, discrepancy_quantity").single(); // Select NEW fields
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
    supplier_address: insumo.supplier_address || '',
    pending_reception_quantity: insumo.pending_reception_quantity ?? 0, // Default to 0
    pending_delivery_quantity: insumo.pending_delivery_quantity ?? 0, // Default to 0
    last_physical_count_quantity: insumo.last_physical_count_quantity ?? 0, // Default to 0
    last_physical_count_date: insumo.last_physical_count_date || null, // Default to null
    discrepancy_quantity: insumo.discrepancy_quantity ?? 0, // Default to 0
  }));

  const { data, error } = await supabase.from("insumos").insert(insumosWithUserId).select("id");

  if (error) throw new Error(error.message);
  return data ? data.length : 0;
};

export const updateInsumo = async (id: string, insumo: InsumoFormValues): Promise<Insumo> => {
  // Ensure non-nullable fields are not null and set defaults for new stock fields
  const processedInsumo = {
    ...insumo,
    supplier_name: insumo.supplier_name || '',
    supplier_phone: insumo.supplier_phone || '',
    supplier_address: insumo.supplier_address || '',
    pending_reception_quantity: insumo.pending_reception_quantity ?? 0, // Default to 0
    pending_delivery_quantity: insumo.pending_delivery_quantity ?? 0, // Default to 0
    last_physical_count_quantity: insumo.last_physical_count_quantity ?? 0, // Default to 0
    last_physical_count_date: insumo.last_physical_count_date || null, // Default to null
    discrepancy_quantity: insumo.discrepancy_quantity ?? 0, // Default to 0
  };

  const { data, error } = await supabase.from("insumos").update(processedInsumo).eq("id", id).select("*, pending_reception_quantity, pending_delivery_quantity, last_physical_count_quantity, last_physical_count_date, discrepancy_quantity").single(); // Select NEW fields
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