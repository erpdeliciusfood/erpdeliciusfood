import { supabase } from "@/integrations/supabase/client";
import { StockMovement, StockMovementFormValues } from "@/types";

export const getStockMovements = async (): Promise<StockMovement[]> => {
  const { data, error } = await supabase
    .from("stock_movements")
    .select("*, insumos(id, nombre, purchase_unit, base_unit, conversion_factor)")
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

  if (fetchInsumoError) {
    console.error("Error fetching insumo stock before RPC:", fetchInsumoError);
    throw new Error(`Error fetching insumo stock: ${fetchInsumoError.message}`);
  }
  if (!currentInsumo) {
    console.error("Insumo not found for ID:", insumo_id);
    throw new Error("Insumo not found.");
  }

  let pendingDeliveryChange = 0;
  let pendingReceptionChange = 0;
  let stockChange = 0;

  if (movement_type === "purchase_in") {
    stockChange = quantity_change;
  } else if (movement_type === "reception_in") {
    pendingReceptionChange = quantity_change;
  } else if (movement_type === "adjustment_in") {
    stockChange = quantity_change;
  } else if (movement_type === "adjustment_out" || movement_type === "daily_prep_out") {
    stockChange = -quantity_change;
  }

  const { data: updatedInsumoArray, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
    insumo_id_param: insumo_id,
    pending_delivery_change: pendingDeliveryChange,
    pending_reception_change: pendingReceptionChange,
    stock_change: stockChange,
  });

  if (updateInsumoError) {
    console.error("RPC Error in update_insumo_quantities for insumo_id:", insumo_id, updateInsumoError);
    throw new Error(`Error updating insumo quantities via RPC: ${updateInsumoError.message}`);
  }
  if (!updatedInsumoArray || updatedInsumoArray.length === 0) {
    console.error("RPC returned empty or null array for insumo_id:", insumo_id, "Array received:", updatedInsumoArray);
    throw new Error(`Failed to update insumo quantities via RPC: Insumo with ID ${insumo_id} not found or update failed.`);
  }

  const updatedInsumo = updatedInsumoArray[0];
  if (!updatedInsumo) {
    console.error("updatedInsumo is undefined after RPC call for insumo_id:", insumo_id, "Array received:", updatedInsumoArray);
    throw new Error(`Failed to retrieve updated insumo data after RPC call for insumo_id: ${insumo_id}.`);
  }

  const { data: newMovement, error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      insumo_id,
      movement_type,
      quantity_change: parseFloat(quantity_change.toFixed(2)),
      new_stock_quantity: parseFloat(updatedInsumo.stock_quantity.toFixed(2)),
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