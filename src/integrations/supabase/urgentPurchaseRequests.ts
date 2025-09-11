import { supabase } from "@/integrations/supabase/client";
import { UrgentPurchaseRequest, UrgentPurchaseRequestFormValues } from "@/types";

export const getUrgentPurchaseRequests = async (): Promise<UrgentPurchaseRequest[]> => {
  const { data, error } = await supabase
    .from("urgent_purchase_requests")
    .select("*, insumos(id, nombre, purchase_unit)") // Fetch related insumo data
    .order("request_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createUrgentPurchaseRequest = async (
  requestData: UrgentPurchaseRequestFormValues,
  userId: string
): Promise<UrgentPurchaseRequest> => {
  const { insumo_id, quantity_requested, notes, source_module = 'warehouse', priority = 'urgent' } = requestData;

  // Check for existing pending or approved requests for the same insumo
  const { data: existingRequests, error: fetchError } = await supabase
    .from("urgent_purchase_requests")
    .select("id, insistence_count, quantity_requested, notes")
    .eq("insumo_id", insumo_id)
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: false });

  if (fetchError) throw new Error(`Error checking for existing urgent requests: ${fetchError.message}`);

  if (existingRequests && existingRequests.length > 0) {
    // If an existing request is found, update its insistence_count and quantity
    const latestExistingRequest = existingRequests[0];
    const newInsistenceCount = (latestExistingRequest.insistence_count || 0) + 1;
    const newQuantityRequested = Math.max(latestExistingRequest.quantity_requested, quantity_requested); // Take the max quantity
    const newNotes = latestExistingRequest.notes ? `${latestExistingRequest.notes}\n(Re-solicitado el ${new Date().toLocaleString()})` : notes;

    const { data: updatedRequest, error: updateError } = await supabase
      .from("urgent_purchase_requests")
      .update({
        insistence_count: newInsistenceCount,
        quantity_requested: newQuantityRequested,
        notes: newNotes,
        // Do not change status or priority unless explicitly requested
      })
      .eq("id", latestExistingRequest.id)
      .select()
      .single();

    if (updateError) throw new Error(`Error updating existing urgent request: ${updateError.message}`);
    if (!updatedRequest) throw new Error("Failed to update existing urgent request.");

    // Fetch the complete updated request with insumo details for the return value
    const { data: completeUpdatedRequest, error: fetchUpdatedError } = await supabase
      .from("urgent_purchase_requests")
      .select("*, insumos(id, nombre, purchase_unit)")
      .eq("id", updatedRequest.id)
      .single();

    if (fetchUpdatedError) throw new Error(`Failed to fetch complete updated urgent request: ${fetchUpdatedError.message}`);
    return completeUpdatedRequest;

  } else {
    // No existing pending/approved request, create a new one
    const { data, error } = await supabase
      .from("urgent_purchase_requests")
      .insert({
        insumo_id,
        quantity_requested,
        notes,
        source_module,
        priority,
        requested_by_user_id: userId,
        insistence_count: 1, // New request starts with 1
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};

export const updateUrgentPurchaseRequest = async (
  id: string,
  requestData: Partial<UrgentPurchaseRequestFormValues & { status: UrgentPurchaseRequest['status']; fulfilled_purchase_record_id?: string | null }>
): Promise<UrgentPurchaseRequest> => {
  const { data, error } = await supabase
    .from("urgent_purchase_requests")
    .update(requestData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteUrgentPurchaseRequest = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("urgent_purchase_requests")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};