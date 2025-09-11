import { supabase } from "@/integrations/supabase/client";
import { Receta, RecetaFormValues, Insumo } from "@/types"; // Changed type imports, removed unused PlatoInsumo

// Helper to map DB fields to Receta interface fields
const mapDbRecetaToReceta = (dbReceta: any): Receta => ({
  id: dbReceta.id,
  nombre: dbReceta.nombre,
  descripcion: dbReceta.descripcion,
  category: dbReceta.categoria, // Map DB field
  tiempo_preparacion: dbReceta.tiempo_preparacion,
  costo_total: dbReceta.costo_total,
  plato_insumos: dbReceta.plato_insumos?.map((pi: any) => ({
    id: pi.id,
    receta_id: pi.receta_id,
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
    .from("recetas") // Changed from platos
    .select(`
      *,
      plato_insumos (
        *,
        insumos (id, nombre, base_unit, costo_unitario, stock_quantity, min_stock_level, category, conversion_factor, pending_reception_quantity, pending_delivery_quantity)
      )
    `)
    .order("nombre", { ascending: true });
  if (error) throw error;
  return data.map(mapDbRecetaToReceta);
};

export const getRecetaById = async (id: string): Promise<Receta> => {
  const { data, error } = await supabase
    .from("recetas") // Changed from platos
    .select(`
      *,
      plato_insumos (
        *,
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
  const { data: newReceta, error: recetaError } = await supabase
    .from("recetas") // Changed from platos
    .insert({
      nombre: recetaData.nombre,
      descripcion: recetaData.descripcion,
      categoria: recetaData.category, // Map to DB field
      // tiempo_preparacion and costo_total are not passed from form
    })
    .select()
    .single();
  if (recetaError) throw recetaError;

  if (insumos && insumos.length > 0) {
    const platoInsumosToInsert = insumos.map((item: { insumo_id: string; cantidad_necesaria: number; }) => ({ // Typed item
      receta_id: newReceta.id, // Reference newReceta.id
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
    .from("recetas") // Changed from platos
    .update({
      nombre: recetaData.nombre,
      descripcion: recetaData.descripcion,
      categoria: recetaData.category, // Map to DB field
      // tiempo_preparacion and costo_total are not passed from form
    })
    .eq("id", id)
    .select()
    .single();
  if (recetaError) throw recetaError;

  // Delete existing plato_insumos and insert new ones
  await supabase.from("plato_insumos").delete().eq("receta_id", id);

  if (insumos && insumos.length > 0) {
    const platoInsumosToInsert = insumos.map((item: { insumo_id: string; cantidad_necesaria: number; }) => ({ // Typed item
      receta_id: updatedReceta.id, // Reference updatedReceta.id
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
  await supabase.from("plato_insumos").delete().eq("receta_id", id);
  const { error } = await supabase.from("recetas").delete().eq("id", id); // Changed from platos
  if (error) throw error;
};