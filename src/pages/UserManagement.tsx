import { Loader2, Users } from "lucide-react";
import { useAllProfiles } from "@/hooks/useProfile";
import UserList from "@/components/user-management/UserList";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/contexts/SessionContext";
import { Navigate } from "react-router-dom";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo"; // NEW: Import PageHeaderWithLogo

const UserManagement = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const { data: profiles, isLoading: isLoadingProfiles, isError, error } = useAllProfiles();

  // Redirect if not admin
  if (isSessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando sesión...</p>
      </div>
    );
  }

  if (!session || session.user?.user_metadata?.role !== 'admin') {
    return <Navigate to="/" replace />; // Redirect non-admins to home
  }

  if (isLoadingProfiles) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando usuarios...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los usuarios: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Gestión de Usuarios"
        description="Administra los roles de los usuarios de tu aplicación."
        icon={Users}
        hideLogo={true} 
      />

      <div className="flex-grow">
        {profiles && profiles.length > 0 ? (
          <UserList users={profiles} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <Users className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl">No hay usuarios registrados.</p>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default UserManagement;