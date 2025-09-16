import { supabase } from "@/integrations/supabase/client";
import { Receta, RecetaFormValues } from "@/types/index"; // Changed type imports

// Helper function to calculate production cost
const calculateRecetaCosts = async ( // Changed function name
  insumosData: { insumo_id: string; cantidad_necesaria: number }[],
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

  return {
    costo_produccion: parseFloat(totalProductionCost.toFixed(2)),
  };
};

export const getRecetas = async (category?: string): Promise<Receta[]> => { // Changed function name and type, added category parameter
  let query = supabase
    .from("platos") // Keep table name as 'platos' in DB
    .select("*, plato_insumos(*, insumos(*))");

  if (category) {
    query = query.eq("category", category);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getRecetaById = async (id: string): Promise<Receta | null> => { // Changed function name and type
  const { data, error } = await supabase
    .from("platos") // Keep table name as 'platos' in DB
    .select("*, plato_insumos(*, insumos(*))")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(error.message);
  }
  return data;
};

export const createReceta = async (recetaData: RecetaFormValues): Promise<Receta> => { // Changed function name and type
  const { nombre, descripcion, category, insumos } = recetaData; // NEW: Destructure category

  // Get authenticated user ID
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated.");

  // Calculate production cost
  const { costo_produccion } = await calculateRecetaCosts(insumos); // Changed function name

  // Insert the main plato with calculated costs, user_id, and category
  const { data: newReceta, error: platoError } = await supabase // Changed variable name
    .from("platos") // Keep table name as 'platos' in DB
    .insert({ nombre, descripcion, category, costo_produccion, user_id: user.id }) // NEW: Include category
    .select()
    .single();

  if (platoError) throw new Error(platoError.message);
  if (!newReceta) throw new Error("Failed to create receta."); // Changed text

  // Insert associated insumos
  if (insumos && insumos.length > 0) {
    const platoInsumosToInsert = insumos.map((item) => ({
      plato_id: newReceta.id, // Reference newReceta.id
      insumo_id: item.insumo_id,
      cantidad_necesaria: item.cantidad_necesaria,
    }));

    const { error: platoInsumoError } = await supabase
      .from("plato_insumos")
      .insert(platoInsumosToInsert);

    if (platoInsumoError) {
      throw new Error(`Failed to add insumos to receta: ${platoInsumoError.message}`); // Changed text
    }
  }

  // Fetch the complete plato with its insumos for the return value
  const { data: completeReceta, error: fetchError } = await supabase // Changed variable name
    .from("platos") // Keep table name as 'platos' in DB
    .select("*, plato_insumos(*, insumos(*))")
    .eq("id", newReceta.id) // Reference newReceta.id
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete receta: ${fetchError.message}`);

  return completeReceta;
};

export const updateReceta = async (id: string, recetaData: RecetaFormValues): Promise<Receta> => { // Changed function name and type
  const { nombre, descripcion, category, insumos } = recetaData; // NEW: Destructure category

  // Calculate production cost
  const { costo_produccion } = await calculateRecetaCosts(insumos); // Changed function name

  // Update the main plato with calculated costs and category
  const { data: updatedReceta, error: platoError } = await supabase // Changed variable name
    .from("platos") // Keep table name as 'platos' in DB
    .update({ nombre, descripcion, category, costo_produccion }) // NEW: Include category
    .eq("id", id)
    .select()
    .single();

  if (platoError) throw new Error(platoError.message);
  if (!updatedReceta) throw new Error("Failed to update receta."); // Changed text

  // Delete existing plato_insumos for this plato
  const { error: deleteError } = await supabase
    .from("plato_insumos")
    .delete()
    .eq("plato_id", id);

  if (deleteError) throw new Error(`Failed to delete existing insumos for receta: ${deleteError.message}`); // Changed text

  // Insert new associated insumos
  if (insumos && insumos.length > 0) {
    const platoInsumosToInsert = insumos.map((item) => ({
      plato_id: updatedReceta.id, // Reference updatedReceta.id
      insumo_id: item.insumo_id,
      cantidad_necesaria: item.cantidad_necesaria,
    }));

    const { error: platoInsumoError } = await supabase
      .from("plato_insumos")
      .insert(platoInsumosToInsert);

    if (platoInsumoError) {
      throw new Error(`Failed to add new insumos to receta: ${platoInsumoError.message}`); // Changed text
    }
  }

  // Fetch the complete plato with its insumos for the return value
  const { data: completeReceta, error: fetchError } = await supabase // Changed variable name
    .from("platos") // Keep table name as 'platos' in DB
    .select("*, plato_insumos(*, insumos(*))")
    .eq("id", updatedReceta.id) // Reference updatedReceta.id
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete receta: ${fetchError.message}`);

  return completeReceta;
};

export const deleteReceta = async (id: string): Promise<void> => { // Changed function name
  const { error } = await supabase.from("platos").delete().eq("id", id); // Keep table name as 'platos' in DB
  if (error) throw new Error(error.message);
};