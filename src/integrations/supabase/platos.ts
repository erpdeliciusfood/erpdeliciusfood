import { supabase } from "@/integrations/supabase/client";
import { Plato, PlatoFormValues } from "@/types"; // Removed Insumo import

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

// Helper function to calculate production cost
const calculatePlatoCost = async (insumosData: { insumo_id: string; cantidad_necesaria: number }[]): Promise<number> => {
  let totalCost = 0;
  if (insumosData && insumosData.length > 0) {
    const insumoIds = insumosData.map(item => item.insumo_id);
    const { data: fetchedInsumos, error: insumosError } = await supabase
      .from("insumos")
      .select("id, costo_unitario")
      .in("id", insumoIds);

    if (insumosError) throw new Error(`Failed to fetch insumo costs: ${insumosError.message}`);

    const insumoCostMap = new Map<string, number>();
    fetchedInsumos.forEach(insumo => insumoCostMap.set(insumo.id, insumo.costo_unitario));

    for (const item of insumosData) {
      const costoUnitario = insumoCostMap.get(item.insumo_id);
      if (costoUnitario !== undefined) {
        totalCost += costoUnitario * item.cantidad_necesaria;
      } else {
        console.warn(`Costo unitario no encontrado para el insumo ID: ${item.insumo_id}`);
      }
    }
  }
  return totalCost;
};

export const createPlato = async (platoData: PlatoFormValues, userId: string): Promise<Plato> => {
  const { nombre, descripcion, markup_percentage, insumos } = platoData;

  // Calculate production cost
  const costo_produccion = await calculatePlatoCost(insumos);

  // Calculate sales price
  const precio_venta = costo_produccion * (1 + markup_percentage);

  // Insert the main plato
  const { data: newPlato, error: platoError } = await supabase
    .from("platos")
    .insert({ nombre, descripcion, precio_venta, costo_produccion, markup_percentage, user_id: userId })
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

export const updatePlato = async (id: string, platoData: PlatoFormValues, userId: string): Promise<Plato> => {
  const { nombre, descripcion, markup_percentage, insumos } = platoData;

  // Calculate production cost
  const costo_produccion = await calculatePlatoCost(insumos);

  // Calculate sales price
  const precio_venta = costo_produccion * (1 + markup_percentage);

  // Update the main plato
  const { data: updatedPlato, error: platoError } = await supabase
    .from("platos")
    .update({ nombre, descripcion, precio_venta, costo_produccion, markup_percentage })
    .eq("id", id)
    .eq("user_id", userId) // Ensure user owns the plato
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

export const deletePlato = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase.from("platos").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
};