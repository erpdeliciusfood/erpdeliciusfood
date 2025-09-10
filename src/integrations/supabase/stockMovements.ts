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
  const { insumo_id, movement_type, quantity_change, total_purchase_amount, total_purchase_quantity, notes, menu_id } = movementData;

  // First, get the current stock and cost of the insumo
  const { data: currentInsumo, error: fetchInsumoError } = await supabase
    .from("insumos")
    .select("stock_quantity, costo_unitario")
    .eq("id", insumo_id)
    .single();

  if (fetchInsumoError) throw new Error(`Error fetching insumo stock: ${fetchInsumoError.message}`);
  if (!currentInsumo) throw new Error("Insumo not found.");

  let newStockQuantity = currentInsumo.stock_quantity;
  let newCostoUnitario = currentInsumo.costo_unitario; // Keep current cost for non-purchase movements
  let actualQuantityChange = quantity_change; // This will be the value recorded in stock_movements

  // Handle different movement types
  if (movement_type === "purchase_in") {
    if (total_purchase_amount === undefined || total_purchase_amount <= 0) {
      throw new Error("Monto total y cantidad comprada son requeridos para entradas por compra.");
    }
    if (total_purchase_quantity === undefined || total_purchase_quantity <= 0) {
      throw new Error("La cantidad comprada es requerida para entradas por compra.");
    }
    // Calculate new costo_unitario based on the purchase
    newCostoUnitario = total_purchase_amount / total_purchase_quantity;
    newStockQuantity += total_purchase_quantity;
    actualQuantityChange = total_purchase_quantity; // The change recorded is the total purchased
  } else if (movement_type === "adjustment_in") {
    if (quantity_change === undefined || quantity_change <= 0) {
      throw new Error("La cantidad de cambio es requerida para ajustes de entrada.");
    }
    newStockQuantity += quantity_change;
    actualQuantityChange = quantity_change;
  } else if (movement_type === "adjustment_out" || movement_type === "daily_prep_out") { // Handle daily_prep_out here
    if (quantity_change === undefined || quantity_change <= 0) {
      throw new Error("La cantidad de cambio es requerida para ajustes/salidas.");
    }
    newStockQuantity -= quantity_change;
    actualQuantityChange = -quantity_change; // Record as negative for deduction
  }
  // 'consumption_out' is handled by the Edge Function, so it's not part of this client-side creation

  // Update the insumo's stock_quantity and costo_unitario
  const { data: updatedInsumo, error: updateInsumoError } = await supabase
    .from("insumos")
    .update({ 
      stock_quantity: parseFloat(newStockQuantity.toFixed(2)), // Ensure precision
      costo_unitario: parseFloat(newCostoUnitario.toFixed(2)), // Ensure precision
    })
    .eq("id", insumo_id)
    .select("id, stock_quantity, costo_unitario") // Select only necessary fields
    .single();

  if (updateInsumoError) throw new Error(`Error updating insumo stock or cost: ${updateInsumoError.message}`);
  if (!updatedInsumo) throw new Error("Failed to update insumo stock or cost.");

  // Insert the stock movement record
  const { data: newMovement, error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      insumo_id,
      movement_type,
      quantity_change: parseFloat(actualQuantityChange.toFixed(2)), // Use the actual calculated change
      new_stock_quantity: parseFloat(updatedInsumo.stock_quantity.toFixed(2)), // Use the actual updated stock
      notes,
      source_document_id: menu_id, // Link to menu_id if provided
    })
    .select("*, insumos(id, nombre, purchase_unit, base_unit, conversion_factor)")
    .single();

  if (movementError) throw new Error(movementError.message);
  if (!newMovement) throw new Error("Failed to create stock movement.");

  return newMovement;
};