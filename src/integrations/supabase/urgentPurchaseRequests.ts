import { supabase } from "@/integrations/supabase/client";
import { UrgentPurchaseRequest, UrgentPurchaseRequestFormValues } from "@/types";

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