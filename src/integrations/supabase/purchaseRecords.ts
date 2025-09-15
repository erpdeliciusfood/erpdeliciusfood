import { supabase } from "@/integrations/supabase/client";
import { PurchaseRecord, PurchaseRecordFormValues } from "@/types/index";
import { createStockMovement } from "./stockMovements"; // Import the stock movement function

export const getPurchaseRecords = async (): Promise<PurchaseRecord[]> => {
  const { data, error } = await supabase
    .from("purchase_records")
    .select("*, insumos(id, nombre, purchase_unit)") // Fetch related insumo data
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createPurchaseRecord = async (
  recordData: PurchaseRecordFormValues
): Promise<PurchaseRecord> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated.");

  // Set initial status for new purchase record, defaulting to 'ordered' if not specified
  const initialStatus = recordData.status || 'ordered';
  const recordDataWithStatus = { ...recordData, status: initialStatus };

  // Insert the purchase record
  const { data: newRecord, error: recordError } = await supabase
    .from("purchase_records")
    .insert({ ...recordDataWithStatus, user_id: user.id })
    .select()
    .single();

  if (recordError) throw new Error(recordError.message);
  if (!newRecord) throw new Error("Failed to create purchase record.");

  // Handle stock updates based on the initial status
  if (newRecord.status === 'ordered') {
    // For 'ordered', only update pending_delivery_quantity
    const { data: updatedInsumo, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
      insumo_id_param: newRecord.insumo_id,
      pending_delivery_change: newRecord.quantity_purchased, // Add to pending_delivery_quantity
      pending_reception_change: 0,
      stock_change: 0,
    });

    if (updateInsumoError) throw new Error(`Error updating insumo pending delivery quantity via RPC: ${updateInsumoError.message}`);
    if (!updatedInsumo) throw new Error(`Failed to update insumo pending delivery quantity via RPC: Insumo with ID ${newRecord.insumo_id} not found or update failed.`);

  } else if (newRecord.status === 'received_by_company') {
    // For 'received_by_company', update pending_delivery_quantity and pending_reception_quantity
    const { data: updatedInsumo, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
      insumo_id_param: newRecord.insumo_id,
      pending_delivery_change: -newRecord.quantity_purchased,
      pending_reception_change: newRecord.quantity_purchased,
      stock_change: 0,
    });
    if (updateInsumoError) throw new Error(`Error updating insumo quantities via RPC for reception_in: ${updateInsumoError.message}`);
    if (!updatedInsumo) throw new Error(`Failed to update insumo quantities via RPC for reception_in: Insumo with ID ${newRecord.insumo_id} not found or update failed.`);

    await createStockMovement({
      insumo_id: newRecord.insumo_id,
      movement_type: 'reception_in',
      quantity_change: newRecord.quantity_purchased,
      notes: `Recepción de compra por empresa (inicial): ${newRecord.notes || 'N/A'}`,
      user_id: user.id, // Pass user_id here
    });
  } else if (newRecord.status === 'received_by_warehouse') {
    // For 'received_by_warehouse', update stock_quantity directly
    const { data: updatedInsumo, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
      insumo_id_param: newRecord.insumo_id,
      pending_delivery_change: -newRecord.quantity_purchased, // Deduct from pending delivery
      pending_reception_change: 0, // No pending reception if directly to warehouse
      stock_change: newRecord.quantity_purchased, // Add to stock
    });
    if (updateInsumoError) throw new Error(`Error updating insumo quantities via RPC for purchase_in: ${updateInsumoError.message}`);
    if (!updatedInsumo) throw new Error(`Failed to update insumo quantities via RPC for purchase_in: Insumo with ID ${newRecord.insumo_id} not found or update failed.`);

    await createStockMovement({
      insumo_id: newRecord.insumo_id,
      movement_type: 'purchase_in', // This now means 'received by warehouse'
      quantity_change: newRecord.quantity_purchased,
      notes: `Ingreso a almacén de compra (inicial): ${newRecord.notes || 'N/A'}`,
      user_id: user.id, // Pass user_id here
    });
  }

  // Fetch the complete record with insumo details for the return value
  const { data: completeRecord, error: fetchError } = await supabase
    .from("purchase_records")
    .select("*, insumos(id, nombre, purchase_unit)")
    .eq("id", newRecord.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete purchase record: ${fetchError.message}`);

  return completeRecord;
};

export const updatePurchaseRecord = async (
  id: string,
  recordData: PurchaseRecordFormValues,
  partialReceptionQuantity?: number,
  targetStatus?: 'received_by_company' | 'received_by_warehouse'
): Promise<PurchaseRecord> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated.");

  // Fetch the old record to compare quantities and status changes
  const { data: oldRecord, error: fetchOldRecordError } = await supabase
    .from("purchase_records")
    .select("*, insumos(id, nombre, purchase_unit)")
    .eq("id", id)
    .single();

  if (fetchOldRecordError) throw new Error(`Error fetching old purchase record: ${fetchOldRecordError.message}`);
  if (!oldRecord) throw new Error("Old purchase record not found.");

  // Determine the quantity to use for stock movements.
  // If partialReceptionQuantity is provided, use it. Otherwise, use the the difference between old and new quantity_received.
  let quantityToMove = partialReceptionQuantity;
  if (partialReceptionQuantity === undefined) {
    // If no partial quantity, calculate the difference in total received quantity
    quantityToMove = (recordData.quantity_received ?? 0) - oldRecord.quantity_received;
  }

  // Update the purchase record
  const { data: updatedRecord, error: recordError } = await supabase
    .from("purchase_records")
    .update(recordData)
    .eq("id", id)
    .select()
    .single();

  if (recordError) throw new Error(recordError.message);
  if (!updatedRecord) throw new Error("Failed to update purchase record.");

  // --- Handle stock quantity adjustments based on status changes ---

  // Scenario 1: Item is marked as 'received_by_company' for the first time or partially
  if (targetStatus === 'received_by_company' && quantityToMove! > 0) {
    // Deduct from pending_delivery_quantity and add to pending_reception_quantity
    const { data: updatedInsumo, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
      insumo_id_param: updatedRecord.insumo_id,
      pending_delivery_change: -quantityToMove!,
      pending_reception_change: quantityToMove!,
      stock_change: 0,
    });
    if (updateInsumoError) throw new Error(`Error updating insumo quantities via RPC for reception_in: ${updateInsumoError.message}`);
    if (!updatedInsumo) throw new Error(`Failed to update insumo quantities via RPC for reception_in: Insumo with ID ${updatedRecord.insumo_id} not found or update failed.`);

    await createStockMovement({
      insumo_id: updatedRecord.insumo_id,
      movement_type: 'reception_in',
      quantity_change: quantityToMove!,
      notes: `Recepción de compra por empresa (parcial/total): ${updatedRecord.notes || 'N/A'}`,
      user_id: user.id, // Pass user_id here
    });
  }

  // Scenario 2: Item is marked as 'received_by_warehouse' for the first time or partially
  if (targetStatus === 'received_by_warehouse' && quantityToMove! > 0) {
    // Deduct from pending_reception_quantity and add to stock_quantity
    const { data: updatedInsumo, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
      insumo_id_param: updatedRecord.insumo_id,
      pending_delivery_change: 0,
      pending_reception_change: -quantityToMove!,
      stock_change: quantityToMove!,
    });
    if (updateInsumoError) throw new Error(`Error updating insumo quantities via RPC for purchase_in: ${updateInsumoError.message}`);
    if (!updatedInsumo) throw new Error(`Failed to update insumo quantities via RPC for purchase_in: Insumo with ID ${updatedRecord.insumo_id} not found or update failed.`);

    await createStockMovement({
      insumo_id: updatedRecord.insumo_id,
      movement_type: 'purchase_in', // This now means 'received by warehouse'
      quantity_change: quantityToMove!,
      notes: `Ingreso a almacén de compra (parcial/total): ${updatedRecord.notes || 'N/A'}`,
      user_id: user.id, // Pass user_id here
    });
  }

  // Scenario 3: Item is marked as 'cancelled'
  if (updatedRecord.status === 'cancelled' && oldRecord.status !== 'cancelled') {
    // Revert quantities based on previous status
    if (oldRecord.status === 'ordered') {
      const { data: updatedInsumo, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
        insumo_id_param: updatedRecord.insumo_id,
        pending_delivery_change: -oldRecord.quantity_purchased, // Revert full ordered quantity
        pending_reception_change: 0,
        stock_change: 0,
      });
      if (updateInsumoError) throw new Error(`Error updating insumo quantities via RPC for cancellation (ordered): ${updateInsumoError.message}`);
      if (!updatedInsumo) throw new Error(`Failed to update insumo quantities via RPC for cancellation (ordered): Insumo with ID ${updatedRecord.insumo_id} not found or update failed.`);

    } else if (oldRecord.status === 'received_by_company') {
      const { data: updatedInsumo, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
        insumo_id_param: updatedRecord.insumo_id,
        pending_delivery_change: 0,
        pending_reception_change: -oldRecord.quantity_received, // Revert only what was received by company
        stock_change: 0,
      });
      if (updateInsumoError) throw new Error(`Error updating insumo quantities via RPC for cancellation (received_by_company): ${updateInsumoError.message}`);
      if (!updatedInsumo) throw new Error(`Failed to update insumo quantities via RPC for cancellation (received_by_company): Insumo with ID ${updatedRecord.insumo_id} not found or update failed.`);

    } else if (oldRecord.status === 'received_by_warehouse') {
      const { data: updatedInsumo, error: updateInsumoError } = await supabase.rpc('update_insumo_quantities', {
        insumo_id_param: updatedRecord.insumo_id,
        pending_delivery_change: 0,
        pending_reception_change: 0,
        stock_change: -oldRecord.quantity_received, // Revert only what was received by warehouse
      });
      if (updateInsumoError) throw new Error(`Error updating insumo quantities via RPC for cancellation (received_by_warehouse): ${updateInsumoError.message}`);
      if (!updatedInsumo) throw new Error(`Failed to update insumo quantities via RPC for cancellation (received_by_warehouse): Insumo with ID ${updatedRecord.insumo_id} not found or update failed.`);
    }
    await createStockMovement({
      insumo_id: updatedRecord.insumo_id,
      movement_type: 'adjustment_out', // Use adjustment_out for cancellation
      quantity_change: oldRecord.quantity_received > 0 ? oldRecord.quantity_received : oldRecord.quantity_purchased, // Use received if any, else ordered
      notes: `Cancelación de compra: ${updatedRecord.notes || 'N/A'}`,
      user_id: user.id, // Pass user_id here
    });
  }

  // Fetch the complete record with insumo details for the return value
  const { data: completeRecord, error: fetchError } = await supabase
    .from("purchase_records")
    .select("*, insumos(id, nombre, purchase_unit)")
    .eq("id", updatedRecord.id)
    .single();

  if (fetchError) throw new Error(`Failed to fetch complete purchase record: ${fetchError.message}`);

  return completeRecord;
};

export const deletePurchaseRecord = async (id: string): Promise<void> => {
  // Deleting a purchase record will NOT automatically reverse stock or cost changes.
  // Manual stock adjustment should be performed if necessary.
  const { error } = await supabase
    .from("purchase_records")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};