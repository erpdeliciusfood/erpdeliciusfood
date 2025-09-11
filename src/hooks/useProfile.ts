import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, getAllProfiles, deleteUser } from "@/integrations/supabase/profiles";
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

  return useMutation<Profile, Error, { profileData: ProfileFormValues; targetUserId?: string }, { toastId: string }>({
    mutationFn: ({ profileData, targetUserId }) => {
      const userIdToUpdate = targetUserId || user?.id;
      if (!userIdToUpdate) throw new Error("User not authenticated or target user ID not provided.");
      return updateProfile(userIdToUpdate, profileData);
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

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string, { toastId: string } >({
    mutationFn: (userId: string) => deleteUser(userId),
    onMutate: () => {
      const toastId = showLoading("Eliminando usuario...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      showSuccess("Usuario eliminado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["allProfiles"] });
    },
    onError: (error, __, context) => {
      if (context?.toastId) {
        dismissToast(context.toastId);
      }
      showError(`Error al eliminar usuario: ${error.message}`);
    },
  });
};