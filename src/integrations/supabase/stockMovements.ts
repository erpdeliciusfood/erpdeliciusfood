import { supabase } from "@/integrations/supabase/client";
import { StockMovement, StockMovementFormValues } from "@/types";

export const getStockMovements = async (): Promise<StockMovement[]> => {
  const { data, error } = await supabase
    .from("stock_movements")
    .select("*, insumos(id, nombre, purchase_unit, base_unit, conversion_factor)") // Fetch related insumo data
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createStockMovement = async (
  movementData: StockMovementFormValues
): Promise<StockMovement> => {
  const { insumo_id, movement_type, quantity_change, notes } = movementData;

  // First, get the current stock of the insumo
  const { data: currentInsumo, error: fetchInsumoError } = await supabase
    .from("insumos")
    .select("stock_quantity")
    .eq("id", insumo_id)
    .single();

  if (fetchInsumoError) throw new Error(`Error fetching insumo stock: ${fetchInsumoError.message}`);
  if (!currentInsumo) throw new Error("Insumo not found.");

  let newStockQuantity = currentInsumo.stock_quantity;

  // Update stock_quantity based on movement_type
  if (movement_type === "purchase_in" || movement_type === "adjustment_in") {
    newStockQuantity += quantity_change;
  } else if (movement_type === "adjustment_out") {
    newStockQuantity -= quantity_change;
  }
  // 'consumption_out' is handled by the Edge Function, so it's not part of this client-side creation

  // Update the insumo's stock_quantity
  const { data: updatedInsumo, error: updateInsumoError } = await supabase
    .from("insumos")
    .update({ stock_quantity: newStockQuantity })
    .eq("id", insumo_id)
    .select("id, stock_quantity") // Select only necessary fields
    .single();

  if (updateInsumoError) throw new Error(`Error updating insumo stock: ${updateInsumoError.message}`);
  if (!updatedInsumo) throw new Error("Failed to update insumo stock.");

  // Insert the stock movement record
  const { data: newMovement, error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      insumo_id,
      movement_type,
      quantity_change,
      new_stock_quantity: updatedInsumo.stock_quantity, // Use the actual updated stock
      notes,
    })
    .select("*, insumos(id, nombre, purchase_unit, base_unit, conversion_factor)")
    .single();

  if (movementError) throw new Error(movementError.message);
  if (!newMovement) throw new Error("Failed to create stock movement.");

  return newMovement;
};