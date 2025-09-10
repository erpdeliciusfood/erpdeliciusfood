import { supabase } from "@/integrations/supabase/client";
import { PurchaseRecord, PurchaseRecordFormValues } from "@/types";
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

  // Set initial status for new purchase record
  const recordDataWithStatus = { ...recordData, status: 'ordered' };

  // Insert the purchase record
  const { data: newRecord, error: recordError } = await supabase
    .from("purchase_records")
    .insert({ ...recordDataWithStatus, user_id: user.id })
    .select()
    .single();

  if (recordError) throw new Error(recordError.message);
  if (!newRecord) throw new Error("Failed to create purchase record.");

  // Update the insumo's pending_delivery_quantity
  const { error: updateInsumoError } = await supabase
    .from("insumos")
    .update({
      pending_delivery_quantity: newRecord.quantity_purchased, // Add to pending_delivery_quantity
    })
    .eq("id", newRecord.insumo_id);

  if (updateInsumoError) throw new Error(`Error updating insumo pending delivery quantity: ${updateInsumoError.message}`);

  // No longer creating a 'purchase_in' stock movement here.
  // The 'purchase_in' movement will now be triggered when the item is "received by warehouse"
  // The 'reception_in' movement will be triggered when the item is "received by company"

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
  recordData: PurchaseRecordFormValues
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

  // Scenario 1: Item is marked as 'received_by_company' for the first time
  if (oldRecord.status === 'ordered' && updatedRecord.status === 'received_by_company') {
    // Deduct from pending_delivery_quantity and add to pending_reception_quantity
    await supabase.rpc('update_insumo_quantities', {
      insumo_id_param: updatedRecord.insumo_id,
      pending_delivery_change: -updatedRecord.quantity_purchased,
      pending_reception_change: updatedRecord.quantity_purchased,
      stock_change: 0,
    });
    await createStockMovement({
      insumo_id: updatedRecord.insumo_id,
      movement_type: 'reception_in',
      quantity_change: updatedRecord.quantity_purchased,
      notes: `Recepción de compra por empresa: ${updatedRecord.notes || 'N/A'}`,
    }, user.id);
  }

  // Scenario 2: Item is marked as 'received_by_warehouse' for the first time
  if (oldRecord.status === 'received_by_company' && updatedRecord.status === 'received_by_warehouse') {
    // Deduct from pending_reception_quantity and add to stock_quantity
    await supabase.rpc('update_insumo_quantities', {
      insumo_id_param: updatedRecord.insumo_id,
      pending_delivery_change: 0,
      pending_reception_change: -updatedRecord.quantity_purchased,
      stock_change: updatedRecord.quantity_purchased,
    });
    await createStockMovement({
      insumo_id: updatedRecord.insumo_id,
      movement_type: 'purchase_in', // This now means 'received by warehouse'
      quantity_change: updatedRecord.quantity_purchased,
      total_purchase_amount: updatedRecord.total_amount,
      total_purchase_quantity: updatedRecord.quantity_purchased,
      notes: `Ingreso a almacén de compra: ${updatedRecord.notes || 'N/A'}`,
    }, user.id);
  }

  // Scenario 3: Item is marked as 'cancelled'
  if (updatedRecord.status === 'cancelled' && oldRecord.status !== 'cancelled') {
    // Revert quantities based on previous status
    if (oldRecord.status === 'ordered') {
      await supabase.rpc('update_insumo_quantities', {
        insumo_id_param: updatedRecord.insumo_id,
        pending_delivery_change: -updatedRecord.quantity_purchased,
        pending_reception_change: 0,
        stock_change: 0,
      });
    } else if (oldRecord.status === 'received_by_company') {
      await supabase.rpc('update_insumo_quantities', {
        insumo_id_param: updatedRecord.insumo_id,
        pending_delivery_change: 0,
        pending_reception_change: -updatedRecord.quantity_purchased,
        stock_change: 0,
      });
    } else if (oldRecord.status === 'received_by_warehouse') {
      await supabase.rpc('update_insumo_quantities', {
        insumo_id_param: updatedRecord.insumo_id,
        pending_delivery_change: 0,
        pending_reception_change: 0,
        stock_change: -updatedRecord.quantity_purchased,
      });
    }
    await createStockMovement({
      insumo_id: updatedRecord.insumo_id,
      movement_type: 'adjustment_out', // Use adjustment_out for cancellation
      quantity_change: updatedRecord.quantity_purchased,
      notes: `Cancelación de compra: ${updatedRecord.notes || 'N/A'}`,
    }, user.id);
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