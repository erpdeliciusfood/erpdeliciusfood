import { supabase } from "@/integrations/supabase/client";
import { PurchaseRecord, PurchaseRecordFormValues } from "@/types";
import { createStockMovement } from "./stockMovements"; // Import the stock movement function

export const getPurchaseRecords = async (): Promise<PurchaseRecord[]> => {
  const { data, error } = await supabase
    .from("purchase_records")
    .select("*")
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

  // Insert the purchase record
  const { data: newRecord, error: recordError } = await supabase
    .from("purchase_records")
    .insert({ ...recordData, user_id: user.id })
    .select()
    .single();

  if (recordError) throw new Error(recordError.message);
  if (!newRecord) throw new Error("Failed to create purchase record.");

  // Also create a stock movement for 'purchase_in'
  await createStockMovement({
    insumo_id: newRecord.insumo_id,
    movement_type: 'purchase_in',
    quantity_change: newRecord.quantity_purchased,
    total_purchase_amount: newRecord.total_amount,
    total_purchase_quantity: newRecord.quantity_purchased,
    notes: `Compra registrada: ${newRecord.notes || 'N/A'}`,
  });

  return newRecord;
};

export const updatePurchaseRecord = async (
  id: string,
  recordData: PurchaseRecordFormValues
): Promise<PurchaseRecord> => {
  // For simplicity, updating a purchase record will not automatically adjust stock or cost.
  // If stock/cost adjustment is needed, it should be done via a separate stock movement adjustment.
  // This prevents complex recalculations and potential data inconsistencies if historical stock movements are not re-processed.
  const { data: updatedRecord, error: recordError } = await supabase
    .from("purchase_records")
    .update(recordData)
    .eq("id", id)
    .select()
    .single();

  if (recordError) throw new Error(recordError.message);
  if (!updatedRecord) throw new Error("Failed to update purchase record.");

  return updatedRecord;
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