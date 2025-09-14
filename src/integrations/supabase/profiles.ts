import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types"; // Import Profile from types

interface ProfileFormValues {
  first_name: string | null;
  last_name: string | null;
  role?: 'user' | 'admin'; // Role can be updated by admin
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

export const getAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("first_name", { ascending: true });
  if (error) throw new Error(error.message);
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

// NEW: Function to update user role via Edge Function (for admin use)
export const updateUserRoleAdmin = async (targetUserId: string, newRole: 'user' | 'admin'): Promise<Profile> => {
  const { data, error } = await supabase.functions.invoke('update-user-role', {
    body: { targetUserId, newRole },
  });

  if (error) {
    throw new Error(`Error invoking update-user-role function: ${error.message}`);
  }

  // The Edge Function returns the updated profile
  return data.profile as Profile;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};