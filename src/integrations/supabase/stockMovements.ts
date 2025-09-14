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
  const { insumo_id, movement_type, quantity_change, notes, menu_id } = movementData;

  // First, get the current stock and cost of the insumo, including new stock fields
  const { data: currentInsumo, error: fetchInsumoError } = await supabase
    .from("insumos")
    .select("stock_quantity, costo_unitario, pending_reception_quantity, pending_delivery_quantity")
    .eq("id", insumo_id)
    .single();

  if (fetchInsumoError) throw new Error(`Error fetching insumo stock: ${fetchInsumoError.message}`);
  if (!currentInsumo) throw new Error("Insumo not found.");

  let pendingDeliveryChange = 0;
  let pendingReceptionChange = 0;
  let stockChange = 0;
  // let newCostoUnitario = currentInsumo.costo_unitario; // Default to current cost - REMOVED: Unused

  // Determine how stock quantities and cost change based on movement type
  if (movement_type === "purchase_in") { // This now means 'received by warehouse'
    // For 'purchase_in', we assume the quantity_change is the total quantity purchased
    // and we need to update the unit cost based on this purchase.
    // The form will provide the total amount and quantity for this.
    // For simplicity here, we'll assume quantity_change is the total_purchase_quantity
    // and the unit cost is derived from it.
    // In a real scenario, the form would provide total_amount and total_quantity_purchased
    // and this function would calculate newCostoUnitario = total_amount / total_quantity_purchased.
    // For now, we'll just add to stock and update cost if provided.
    stockChange = quantity_change;
    // If a new unit cost is implied by the purchase, it should be passed here.
    // For this refactor, we'll assume the form handles the cost update if it's a purchase_in.
    // If the form doesn't provide a new unit cost, it remains the same.
    // This RPC doesn't take new unit cost directly, only quantity changes.
    // The `update_insumo_price_timestamp` trigger will handle price history.
  } else if (movement_type === "reception_in") {
    // For 'reception_in', pending_reception_quantity is updated.
    pendingReceptionChange = quantity_change;
  } else if (movement_type === "adjustment_in") {
    stockChange = quantity_change;
  } else if (movement_type === "adjustment_out" || movement_type === "daily_prep_out") {
    stockChange = -quantity_change;
  }
  // 'consumption_out' is handled by the Edge Function, so it's not part of this client-side creation

  // Call the RPC to update insumo quantities and get the updated insumo data
  const { data: updatedInsumoArray, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
    insumo_id_param: insumo_id,
    pending_delivery_change: pendingDeliveryChange,
    pending_reception_change: pendingReceptionChange,
    stock_change: stockChange,
  });

  if (updateInsumoError) throw new Error(`Error updating insumo quantities via RPC: ${updateInsumoError.message}`);
  if (!updatedInsumoArray || updatedInsumoArray.length === 0) throw new Error("Failed to update insumo quantities via RPC.");

  const updatedInsumo = updatedInsumoArray[0]; // The RPC returns an array, take the first element

  // Insert the stock movement record
  const { data: newMovement, error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      insumo_id,
      movement_type,
      quantity_change: parseFloat(quantity_change.toFixed(2)), // Record the absolute change
      new_stock_quantity: parseFloat(updatedInsumo.stock_quantity.toFixed(2)), // Use the final stock from RPC
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