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

  const { data, error } = await supabase
    .from("urgent_purchase_requests")
    .insert({
      insumo_id,
      quantity_requested,
      notes,
      source_module,
      priority,
      requested_by_user_id: userId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
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