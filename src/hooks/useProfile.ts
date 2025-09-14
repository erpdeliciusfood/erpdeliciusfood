import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, getAllProfiles, updateUserRoleAdmin } from "@/integrations/supabase/profiles";
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
  const { user, session } = useSession(); // Get session to check current user's role

  return useMutation<Profile, Error, { profileData: ProfileFormValues; targetUserId?: string }, { toastId: string }>({
    mutationFn: async ({ profileData, targetUserId }) => {
      const userIdToUpdate = targetUserId || user?.id;
      if (!userIdToUpdate) throw new Error("User not authenticated or target user ID not provided.");

      // If role is being updated and it's for another user (or self, but typically for others by admin)
      if (profileData.role && userIdToUpdate !== user?.id) {
        // Only allow admin to update other users' roles
        const currentUserRole = session?.user?.user_metadata?.role;
        if (currentUserRole !== 'admin') {
          throw new Error("You do not have permission to update other users' roles.");
        }
        return updateUserRoleAdmin(userIdToUpdate, profileData.role);
      } else {
        // For updating own profile or non-role fields
        return updateProfile(userIdToUpdate, profileData);
      }
    },
    onMutate: () => {
      const toastId: string = showLoading("Actualizando perfil...");
      return { toastId };
    },
    onSuccess: (_, variables, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["profile", variables.targetUserId || user?.id] });
      queryClient.invalidateQueries({ queryKey: ["allProfiles"] }); // Invalidate all profiles cache as well
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