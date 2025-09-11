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
  movementData: StockMovementFormValues,
  userId: string
): Promise<StockMovement> => {
  const { insumo_id, movement_type, quantity_change, total_purchase_amount, total_purchase_quantity, notes, menu_id } = movementData;

  // First, get the current stock and cost of the insumo, including new stock fields
  const { data: currentInsumo, error: fetchInsumoError } = await supabase
    .from("insumos")
    .select("stock_quantity, costo_unitario, pending_reception_quantity, pending_delivery_quantity")
    .eq("id", insumo_id)
    .single();

  if (fetchInsumoError) throw new Error(`Error fetching insumo stock: ${fetchInsumoError.message}`);
  if (!currentInsumo) throw new Error("Insumo not found.");

  let newStockQuantity = currentInsumo.stock_quantity;
  let newCostoUnitario = currentInsumo.costo_unitario;
  let actualQuantityChange: number = 0;

  // Determine how stock_quantity and costo_unitario change based on movement type
  if (movement_type === "purchase_in") { // This now means 'received by warehouse'
    if (total_purchase_amount === undefined || total_purchase_quantity === undefined || total_purchase_quantity <= 0) {
      throw new Error("Monto total y cantidad comprada son requeridos para entradas por compra.");
    }
    newCostoUnitario = total_purchase_amount / total_purchase_quantity; // Update cost based on this specific purchase
    newStockQuantity += total_purchase_quantity;
    actualQuantityChange = total_purchase_quantity;
  } else if (movement_type === "reception_in") {
    // For 'reception_in', pending_reception_quantity is updated by the RPC in purchaseRecords.ts.
    // stock_quantity does NOT change yet. We just record the movement.
    actualQuantityChange = quantity_change!; // Record the quantity that moved into pending_reception
    // newStockQuantity remains currentInsumo.stock_quantity
  } else if (movement_type === "adjustment_in") {
    newStockQuantity += quantity_change!;
    actualQuantityChange = quantity_change!;
  } else if (movement_type === "adjustment_out" || movement_type === "daily_prep_out") {
    newStockQuantity -= quantity_change!;
    actualQuantityChange = -quantity_change!;
  }
  // 'consumption_out' is handled by the Edge Function, so it's not part of this client-side creation

  // Only update stock_quantity and costo_unitario here.
  // pending_reception_quantity and pending_delivery_quantity are managed by the RPC.
  const { data: updatedInsumo, error: updateInsumoError } = await supabase
    .from("insumos")
    .update({ 
      stock_quantity: parseFloat(newStockQuantity.toFixed(2)),
      costo_unitario: parseFloat(newCostoUnitario.toFixed(2)),
      // Do NOT update pending_reception_quantity or pending_delivery_quantity here for 'reception_in'
      // as they are handled by the RPC in purchaseRecords.ts
    })
    .eq("id", insumo_id)
    .select("id, stock_quantity, costo_unitario, pending_reception_quantity, pending_delivery_quantity")
    .single();

  if (updateInsumoError) throw new Error(`Error updating insumo stock or cost: ${updateInsumoError.message}`);
  if (!updatedInsumo) throw new Error("Failed to update insumo stock or cost.");

  // Insert the stock movement record
  const { data: newMovement, error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      insumo_id,
      movement_type,
      quantity_change: parseFloat(actualQuantityChange.toFixed(2)),
      new_stock_quantity: parseFloat(updatedInsumo.stock_quantity.toFixed(2)), // This should reflect the final stock_quantity
      notes,
      menu_id: menu_id || null,
      user_id: userId,
    })
    .select("*, insumos(id, nombre, purchase_unit, base_unit, conversion_factor)")
    .single();

  if (movementError) throw new Error(movementError.message);
  if (!newMovement) throw new Error("Failed to create stock movement.");

  return newMovement;
};