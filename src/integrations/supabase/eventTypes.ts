import { supabase } from "@/integrations/supabase/client";
import { EventType } from "@/types";

interface EventTypeFormValues {
  name: string;
  description: string | null;
}

export const getEventTypes = async (): Promise<EventType[]> => {
  const { data, error } = await supabase
    .from("event_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const createEventType = async (eventType: EventTypeFormValues): Promise<EventType> => {
  const { data, error } = await supabase
    .from("event_types")
    .insert(eventType)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateEventType = async (id: string, eventType: EventTypeFormValues): Promise<EventType> => {
  const { data, error } = await supabase
    .from("event_types")
    .update(eventType)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteEventType = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("event_types")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};