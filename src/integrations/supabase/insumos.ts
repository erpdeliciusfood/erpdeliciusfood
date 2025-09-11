import { supabase } from "@/integrations/supabase/client";
import { Insumo, InsumoFormValues, InsumoSupplierHistory, InsumoPriceHistory } from "@/types";

// Helper to map DB fields to Insumo interface fields
const mapDbInsumoToInsumo = (dbInsumo: any): Insumo => ({
  id: dbInsumo.id,
  nombre: dbInsumo.nombre,
  base_unit: dbInsumo.unidad_medida, // Map DB field
  costo_unitario: dbInsumo.costo_unitario,
  stock_quantity: dbInsumo.stock_actual, // Map DB field
  min_stock_level: dbInsumo.stock_minimo, // Map DB field
  category: dbInsumo.categoria, // Map DB field
  proveedor_preferido_id: dbInsumo.proveedor_preferido_id,
  proveedor_preferido: dbInsumo.proveedores, // Assuming 'proveedores' is the joined table
  purchase_unit: dbInsumo.unidad_medida, // Assuming purchase_unit is same as base_unit for now
  conversion_factor: dbInsumo.conversion_factor || 1, // Default to 1 if not set
  supplier_name: dbInsumo.proveedores?.name || null,
  supplier_phone: dbInsumo.proveedores?.phone || null,
  supplier_address: dbInsumo.proveedores?.address || null,
  pending_reception_quantity: dbInsumo.pending_reception_quantity || 0,
  pending_delivery_quantity: dbInsumo.pending_delivery_quantity || 0,
  last_physical_count_quantity: dbInsumo.last_physical_count_quantity || null,
  last_physical_count_date: dbInsumo.last_physical_count_date || null,
  discrepancy_quantity: dbInsumo.discrepancy_quantity || null,
});

export const getInsumos = async (searchTerm?: string, category?: string, page: number = 1, limit: number = 10): Promise<{ data: Insumo[], count: number }> => {
  let query = supabase
    .from("insumos")
    .select("*, proveedores(*)", { count: 'exact' });

  if (searchTerm) {
    query = query.ilike("nombre", `%${searchTerm}%`);
  }
  if (category) {
    query = query.eq("categoria", category);
  }

  const startIndex = (page - 1) * limit;
  query = query.range(startIndex, startIndex + limit - 1);

  const { data, error, count } = await query.order("nombre", { ascending: true });
  if (error) throw error;
  return { data: data.map(mapDbInsumoToInsumo), count: count || 0 };
};

export const getInsumoById = async (id: string): Promise<Insumo> => {
  const { data, error } = await supabase
    .from("insumos")
    .select("*, proveedores(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapDbInsumoToInsumo(data);
};

export const createInsumo = async (insumo: InsumoFormValues): Promise<Insumo> => {
  const { data, error } = await supabase
    .from("insumos")
    .insert({
      nombre: insumo.nombre,
      unidad_medida: insumo.base_unit, // Map to DB field
      costo_unitario: insumo.costo_unitario,
      stock_actual: insumo.stock_quantity, // Map to DB field
      stock_minimo: insumo.min_stock_level, // Map to DB field
      categoria: insumo.category, // Map to DB field
      conversion_factor: insumo.conversion_factor,
      pending_reception_quantity: insumo.pending_reception_quantity || 0,
      pending_delivery_quantity: insumo.pending_delivery_quantity || 0,
      last_physical_count_quantity: insumo.last_physical_count_quantity,
      last_physical_count_date: insumo.last_physical_count_date,
      discrepancy_quantity: insumo.discrepancy_quantity,
      // proveedor_preferido_id will be handled separately if needed
    })
    .select("*, proveedores(*)")
    .single();
  if (error) throw error;
  return mapDbInsumoToInsumo(data);
};

export const updateInsumo = async (insumo: InsumoFormValues): Promise<Insumo> => {
  if (!insumo.id) throw new Error("Insumo ID is required for update.");
  const { data, error } = await supabase
    .from("insumos")
    .update({
      nombre: insumo.nombre,
      unidad_medida: insumo.base_unit, // Map to DB field
      costo_unitario: insumo.costo_unitario,
      stock_actual: insumo.stock_quantity, // Map to DB field
      stock_minimo: insumo.min_stock_level, // Map to DB field
      categoria: insumo.category, // Map to DB field
      conversion_factor: insumo.conversion_factor,
      pending_reception_quantity: insumo.pending_reception_quantity,
      pending_delivery_quantity: insumo.pending_delivery_quantity,
      last_physical_count_quantity: insumo.last_physical_count_quantity,
      last_physical_count_date: insumo.last_physical_count_date,
      discrepancy_quantity: insumo.discrepancy_quantity,
      // proveedor_preferido_id will be handled separately if needed
    })
    .eq("id", insumo.id)
    .select("*, proveedores(*)")
    .single();
  if (error) throw error;
  return mapDbInsumoToInsumo(data);
};

export const deleteInsumo = async (id: string): Promise<void> => {
  const { error } = await supabase.from("insumos").delete().eq("id", id);
  if (error) throw error;
};

export const getInsumoSupplierHistory = async (insumoId: string): Promise<InsumoSupplierHistory[]> => {
  const { data, error } = await supabase
    .from("insumo_supplier_history")
    .select("*")
    .eq("insumo_id", insumoId)
    .order("change_date", { ascending: false });
  if (error) throw error;
  return data;
};

export const getInsumoPriceHistory = async (insumoId: string): Promise<InsumoPriceHistory[]> => {
  const { data, error } = await supabase
    .from("insumo_price_history")
    .select("*")
    .eq("insumo_id", insumoId)
    .order("change_date", { ascending: false });
  if (error) throw error;
  return data;
};