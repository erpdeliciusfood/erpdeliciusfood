import { supabase } from "@/integrations/supabase/client";

export const generateQuebradoReport = async (
  startDate: string,
  endDate: string,
  dinerCount: number
): Promise<{ message: string; downloadUrl?: string }> => {
  const { data, error } = await supabase.functions.invoke('generate-quebrado', {
    body: { startDate, endDate, dinerCount },
  });

  if (error) {
    throw new Error(`Error invoking generate-quebrado function: ${error.message}`);
  }

  // Assuming the Edge Function returns a message and optionally a download URL
  return data as { message: string; downloadUrl?: string };
};