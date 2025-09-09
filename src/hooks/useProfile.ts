import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/integrations/supabase/profiles";
import { useSession } from "@/contexts/SessionContext";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

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

export const useProfile = () => {
  const { user } = useSession();
  return useQuery<Profile | null, Error>({
    queryKey: ["profile", user?.id],
    queryFn: () => (user?.id ? getProfile(user.id) : Promise.resolve(null)),
    enabled: !!user?.id,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation<Profile, Error, ProfileFormValues, { toastId: string }>({
    mutationFn: (profileData) => {
      if (!user?.id) throw new Error("User not authenticated.");
      return updateProfile(user.id, profileData);
    },
    onMutate: () => {
      const toastId: string = showLoading("Actualizando perfil...");
      return { toastId };
    },
    onSuccess: (_, __, context) => {
      dismissToast(context.toastId);
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      showSuccess("Perfil actualizado exitosamente.");
    },
    onError: (error, __, context) => {
      dismissToast(context.toastId);
      showError(`Error al actualizar perfil: ${error.message}`);
    },
  });
};