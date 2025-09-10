import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useAuthActions = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      
      // Clear all React Query cache after sign out
      queryClient.clear();
      
      showSuccess("Sesión cerrada exitosamente.");
      navigate("/login"); // Redirect to login page after sign out
    } catch (error: any) {
      showError(`Error al cerrar sesión: ${error.message}`);
    }
  };

  return { signOut };
};