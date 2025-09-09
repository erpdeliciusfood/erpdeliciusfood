import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types"; // Import Profile from types

interface ProfileFormValues {
  first_name: string | null;
  last_name: string | null;
  role?: 'user' | 'admin'; // Role can be updated by admin
}

// Define the expected structure of the data returned by the Supabase query
interface SupabaseProfileWithAuth {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  role: 'user' | 'admin';
  auth_users: { email: string | null } | null; // The joined auth.users data
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
    .select("*, auth_users:auth.users(email)")
    .order("first_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return []; // Return an empty array if data is unexpectedly null
  }

  // Explicitly cast data to unknown first, then to the defined interface, to bypass parser errors
  const profilesWithAuth = data as unknown as SupabaseProfileWithAuth[];

  // Map the data to flatten the auth_users object and assign email directly to profile
  return profilesWithAuth.map(profile => ({
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    avatar_url: profile.avatar_url,
    updated_at: profile.updated_at,
    role: profile.role,
    email: profile.auth_users?.email || undefined, // Assign email, or undefined if not found
  }));
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