import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

interface ProfileFormValues {
  first_name: string | null;
  last_name: string | null;
}

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    // If no profile exists, return null instead of throwing an error
    if (error.code === 'PGRST116') { // No rows found
      return null;
    }
    throw new Error(error.message);
  }
  return data;
};

export const updateProfile = async (userId: string, profile: ProfileFormValues): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};