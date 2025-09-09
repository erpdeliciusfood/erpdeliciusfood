import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, getAllProfiles } from "@/integrations/supabase/profiles";
import { useSession } from "@/contexts/SessionContext";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Profile } from "@/types"; // Import Profile from types

interface ProfileFormValues {
  first_name: string | null;
  last_name: string | null;
  role?: 'user' | 'admin'; // Role can be updated by admin
}

export const useProfile = () => {
  const { user } = useSession();
  return useQuery<Profile | null, Error>({
    queryKey: ["profile", user?.id],
    queryFn: () => (user?.id ? getProfile(user.id) : Promise.resolve(null)),
    enabled: !!user?.id,
  });
};

export const useAllProfiles = () => {
  const { session } = useSession();
  const userRole = session?.user?.user_metadata?.role || 'user'; // Assuming role is in user_metadata for client-side check

  return useQuery<Profile[], Error>({
    queryKey: ["allProfiles"],
    queryFn: getAllProfiles,
    enabled: userRole === 'admin', // Only fetch all profiles if the current user is an admin
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  // The mutation now accepts an object with userId and profileData
  return useMutation<Profile, Error, { userId?: string; profileData: ProfileFormValues }, { toastId: string }>({
    mutationFn: ({ userId, profileData }) => {
      const targetUserId = userId || user?.id; // Use provided userId or current user's ID
      if (!targetUserId) throw new Error("User ID not provided and not authenticated.");
      return updateProfile(targetUserId, profileData);
    },
    onMutate: () => {
      const toastId: string = showLoading("Actualizando perfil...");
      return { toastId };
    },
    onSuccess: (_, variables, context) => {
      dismissToast(context.toastId);
      // Invalidate queries for the specific profile and all profiles
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId || user?.id] });
      queryClient.invalidateQueries({ queryKey: ["allProfiles"] });
      showSuccess("Perfil actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al actualizar perfil: ${error.message}`);
    },
  });
};