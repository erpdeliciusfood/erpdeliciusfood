import { supabase } from "@/integrations/supabase/client";
import { Receta, RecetaFormValues, Insumo } from "@/types"; // Changed type imports, removed unused PlatoInsumo

// Helper to map DB fields to Receta interface fields
const mapDbRecetaToReceta = (dbReceta: any): Receta => ({
  id: dbReceta.id,
  nombre: dbReceta.nombre,
  descripcion: dbReceta.descripcion,
  category: dbReceta.categoria, // Map DB field 'categoria' to 'category'
  tiempo_preparacion: dbReceta.tiempo_preparacion || 0, // Map DB field, default to 0 if null
  costo_total: dbReceta.costo_total || 0, // Map DB field 'costo_total' (was costo_produccion)
  plato_insumos: dbReceta.plato_insumos?.map((pi: any) => ({
    id: pi.id,
    plato_id: pi.plato_id, // Map DB field 'plato_id' to 'plato_id' in interface
    insumo_id: pi.insumo_id,
    cantidad_necesaria: pi.cantidad_necesaria,
    insumo: {
      id: pi.insumos.id,
      nombre: pi.insumos.nombre,
      base_unit: pi.insumos.base_unit, // Map DB field
      costo_unitario: pi.insumos.costo_unitario,
      stock_quantity: pi.insumos.stock_quantity, // Map DB field
      min_stock_level: pi.insumos.min_stock_level, // Map DB field
      category: pi.insumos.category, // Map DB field
      purchase_unit: pi.insumos.purchase_unit, // Assuming purchase_unit is same as base_unit
      conversion_factor: pi.insumos.conversion_factor || 1,
      pending_reception_quantity: pi.insumos.pending_reception_quantity || 0,
      pending_delivery_quantity: pi.insumos.pending_delivery_quantity || 0,
    } as Insumo, // Cast to Insumo
  })) || [],
});

export const getRecetas = async (): Promise<Receta[]> => {
  const { data, error } = await supabase
    .from("platos") // Changed from "recetas" to "platos"
    .select(`
      *,
      plato_insumos (
        id, plato_id, insumo_id, cantidad_necesaria,
        insumos (id, nombre, base_unit, costo_unitario, stock_quantity, min_stock_level, category, conversion_factor, pending_reception_quantity, pending_delivery_quantity)
      )
    `)
    .order("nombre", { ascending: true });
  if (error) throw error;
  return data.map(mapDbRecetaToReceta);
};

export const getRecetaById = async (id: string): Promise<Receta> => {
  const { data, error } = await supabase
    .from("platos") // Changed from "recetas" to "platos"
    .select(`
      *,
      plato_insumos (
        id, plato_id, insumo_id, cantidad_necesaria,
        insumos (id, nombre, base_unit, costo_unitario, stock_quantity, min_stock_level, category, conversion_factor, pending_reception_quantity, pending_delivery_quantity)
      )
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapDbRecetaToReceta(data);
};

export const createReceta = async (receta: RecetaFormValues): Promise<Receta> => {
  const { insumos, ...recetaData } = receta;

  // Obtener el ID del usuario actual
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error("User not authenticated or session not found.");
  }
  const userId = session.user.id;

  const { data: newReceta, error: recetaError } = await supabase
    .from("platos") // Changed from "recetas" to "platos"
    .insert({
      nombre: recetaData.nombre,
      descripcion: recetaData.descripcion,
      categoria: recetaData.category, // Map 'category' from form to DB 'categoria'
      tiempo_preparacion: 0, // Default value, as it's not in RecetaFormValues
      costo_total: 0, // Default value, as it's calculated, not from form
      user_id: userId, // Explicitly set user_id
    })
    .select()
    .single();
  if (recetaError) throw recetaError;

  if (insumos && insumos.length > 0) {
    const platoInsumosToInsert = insumos.map((item: { insumo_id: string; cantidad_necesaria: number; }) => ({
      plato_id: newReceta.id, // Map 'receta_id' from interface to DB 'plato_id'
      insumo_id: item.insumo_id,
      cantidad_necesaria: item.cantidad_necesaria,
    }));
    const { error: platoInsumoError } = await supabase
      .from("plato_insumos")
      .insert(platoInsumosToInsert);
    if (platoInsumoError) throw platoInsumoError;
  }

  return getRecetaById(newReceta.id);
};

export const updateReceta = async (id: string, receta: RecetaFormValues): Promise<Receta> => {
  const { insumos, ...recetaData } = receta;
  if (!id) throw new Error("Receta ID is required for update.");

  const { data: updatedReceta, error: recetaError } = await supabase
    .from("platos") // Changed from "recetas" to "platos"
    .update({
      nombre: recetaData.nombre,
      descripcion: recetaData.descripcion,
      categoria: recetaData.category, // Map 'category' from form to DB 'categoria'
      // tiempo_preparacion and costo_total are not updated from form, they are calculated or default
    })
    .eq("id", id)
    .select()
    .single();
  if (recetaError) throw recetaError;

  // Delete existing plato_insumos and insert new ones
  await supabase.from("plato_insumos").delete().eq("plato_id", id); // Changed 'receta_id' to 'plato_id'

  if (insumos && insumos.length > 0) {
    const platoInsumosToInsert = insumos.map((item: { insumo_id: string; cantidad_necesaria: number; }) => ({
      plato_id: updatedReceta.id, // Map 'receta_id' from interface to DB 'plato_id'
      insumo_id: item.insumo_id,
      cantidad_necesaria: item.cantidad_necesaria,
    }));
    const { error: platoInsumoError } = await supabase
      .from("plato_insumos")
      .insert(platoInsumosToInsert);
    if (platoInsumoError) throw platoInsumoError;
  }

  return getRecetaById(updatedReceta.id);
};

export const deleteReceta = async (id: string): Promise<void> => {
  // Delete associated plato_insumos first
  await supabase.from("plato_insumos").delete().eq("plato_id", id); // Changed 'receta_id' to 'plato_id'
  const { error } = await supabase.from("platos").delete().eq("id", id); // Changed from "recetas" to "platos"
  if (error) throw error;
};