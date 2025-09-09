import { supabase } from "@/integrations/supabase/client";
import { Plato, PlatoFormValues } from "@/types";

// Helper function to calculate production cost and markup percentage
const calculatePlatoCosts = async (
  insumosData: { insumo_id: string; cantidad_necesaria: number }[],
  precio_venta: number
) => {
  let totalProductionCost = 0;

  for (const item of insumosData) {
    const { data: insumo, error } = await supabase
      .from("insumos")
      .select("costo_unitario, conversion_factor")
      .eq("id", item.insumo_id)
      .single();

    if (error) throw new Error(`Error fetching insumo for cost calculation: ${error.message}`);
    if (insumo) {
      // costo_unitario is per purchase_unit. Convert to cost per base_unit.
      const costPerBaseUnit = insumo.costo_unitario / insumo.conversion_factor;
      totalProductionCost += costPerBaseUnit * item.cantidad_necesaria;
    }
  }

  const markupPercentage = totalProductionCost > 0
    ? ((precio_venta - totalProductionCost) / totalProductionCost) * 100
    : 0;

  return {
    costo_produccion: parseFloat(totalProductionCost.toFixed(2)),
    markup_percentage: parseFloat(markupPercentage.toFixed(2)),
  };
};

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

  // Calculate production cost and markup percentage
  const { costo_produccion, markup_percentage } = await calculatePlatoCosts(insumos, precio_venta);

  // Insert the main plato with calculated costs
  const { data: newPlato, error: platoError } = await supabase
    .from("platos")
    .insert({ nombre, descripcion, precio_venta, costo_produccion, markup_percentage })
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

export const updatePlato = async (id: string, platoData: PlatoFormValues): Promise<Plato> => {
  const { nombre, descripcion, precio_venta, insumos } = platoData;

  // Calculate production cost and markup percentage
  const { costo_produccion, markup_percentage } = await calculatePlatoCosts(insumos, precio_venta);

  // Update the main plato with calculated costs
  const { data: updatedPlato, error: platoError } = await supabase
    .from("platos")
    .update({ nombre, descripcion, precio_venta, costo_produccion, markup_percentage })
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