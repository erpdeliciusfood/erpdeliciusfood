import { supabase } from "@/integrations/supabase/client";
import { Plato, PlatoFormValues } from "@/types"; // Removed PlatoInsumo

export const getPlatos = async (): Promise<Plato[]> => {
  const { data, error } = await supabase
    .from("platos")
    .select("*, plato_insumos(*, insumos(*))") // Fetch plato_insumos and nested insumos
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getPlatoById = async (id: string): Promise<Plato | null> => {
  const { data, error } = await supabase
    .from("platos")
    .select("*, plato_insumos(*, insumos(*))")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(error.message);
  }
  return data;
};

export const createPlato = async (platoData: PlatoFormValues): Promise<Plato> => {
  const { nombre, descripcion, precio_venta, insumos } = platoData;

  // Insert the main plato
  const { data: newPlato, error: platoError } = await supabase
    .from("platos")
    .insert({ nombre, descripcion, precio_venta })
    .select()
    .single();

  if (platoError) throw new Error(platoError.message);
  if (!newPlato) throw new Error("Failed to create plato.");

  // Insert associated insumos
  if (insumos && insumos.length > 0) {
    const platoInsumosToInsert = insumos.map((item) => ({
      plato_id: newPlato.id,
      insumo_id: item.insumo_id,
      cantidad_necesaria: item.cantidad_necesaria,
    }));

    const { error: platoInsumoError } = await supabase
      .from("plato_insumos")
      .insert(platoInsumosToInsert);

    if (platoInsumoError) {
      // If insumo insertion fails, consider rolling back plato creation or handling appropriately
      // For now, we'll just throw the error
      throw new Error(`Failed to add insumos to plato: ${platoInsumoError.message}`);
    }
  }

  // Fetch the complete plato with its insumos for the return value
  const { data: completePlato, error: fetchError } = await supabase
    .from("platos")
    .select("*, plato_insumos(*, insumos(*))")
    .eq("id", newPlato.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete plato: ${fetchError.message}`);

  return completePlato;
};

export const updatePlato = async (id: string, platoData: PlatoFormValues): Promise<Plato> => {
  const { nombre, descripcion, precio_venta, insumos } = platoData;

  // Update the main plato
  const { data: updatedPlato, error: platoError } = await supabase
    .from("platos")
    .update({ nombre, descripcion, precio_venta })
    .eq("id", id)
    .select()
    .single();

  if (platoError) throw new Error(platoError.message);
  if (!updatedPlato) throw new Error("Failed to update plato.");

  // Delete existing plato_insumos for this plato
  const { error: deleteError } = await supabase
    .from("plato_insumos")
    .delete()
    .eq("plato_id", id);

  if (deleteError) throw new Error(`Failed to delete existing insumos for plato: ${deleteError.message}`);

  // Insert new associated insumos
  if (insumos && insumos.length > 0) {
    const platoInsumosToInsert = insumos.map((item) => ({
      plato_id: updatedPlato.id,
      insumo_id: item.insumo_id,
      cantidad_necesaria: item.cantidad_necesaria,
    }));

    const { error: platoInsumoError } = await supabase
      .from("plato_insumos")
      .insert(platoInsumosToInsert);

    if (platoInsumoError) {
      throw new Error(`Failed to add new insumos to plato: ${platoInsumoError.message}`);
    }
  }

  // Fetch the complete plato with its insumos for the return value
  const { data: completePlato, error: fetchError } = await supabase
    .from("platos")
    .select("*, plato_insumos(*, insumos(*))")
    .eq("id", updatedPlato.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete plato: ${fetchError.message}`);

  return completePlato;
};

export const deletePlato = async (id: string): Promise<void> => {
  const { error } = await supabase.from("platos").delete().eq("id", id);
  if (error) throw new Error(error.message);
};