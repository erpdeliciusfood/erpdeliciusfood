import { Button } from "@/components/ui/button";
import { LogOut, UserCircle2 } from "lucide-react";
import ProfileForm from "@/components/profile/ProfileForm";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { signOut } from "@/integrations/supabase/profiles";
import { showError, showSuccess } from "@/utils/toast";
import { useSession } from "@/contexts/SessionContext";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo"; // NEW: Import PageHeaderWithLogo

const Profile = () => {
  const { user } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess("Sesión cerrada exitosamente.");
    } catch (error: any) {
      showError(`Error al cerrar sesión: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center"> {/* Eliminado p-4 md:p-8 lg:p-12 */}
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <PageHeaderWithLogo
            title="Mi Perfil"
            description="Actualiza tu información personal y gestiona tu cuenta."
            icon={UserCircle2}
          />
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="px-6 py-3 text-lg flex items-center space-x-2 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200 ease-in-out"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Información de la Cuenta</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            <span className="font-semibold">Email:</span> {user?.email}
          </p>
          {/* Puedes añadir más información del usuario aquí si es necesario */}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Editar Perfil</h2>
        <ProfileForm />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Profile;