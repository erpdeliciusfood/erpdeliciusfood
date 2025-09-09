import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils, UserCircle2, LayoutDashboard } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const { user } = useSession();
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  const userName = profile?.first_name || user?.email || "Usuario";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-3xl w-full">
        <LayoutDashboard className="mx-auto h-16 w-16 mb-6 text-primary dark:text-primary-foreground" />
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          ¡Bienvenido, {userName}!
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          Gestiona tus operaciones de restaurante de forma eficiente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/insumos">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Gestión de Insumos</CardTitle>
                <Utensils className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Administra tus ingredientes, unidades de medida y costos.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Insumos
              </Button>
            </Card>
          </Link>

          <Link to="/profile">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Mi Perfil</CardTitle>
                <UserCircle2 className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Actualiza tu información personal y gestiona tu cuenta.
                </CardDescription>
              </CardContent>
              <Button variant="outline" className="w-full mt-4 px-8 py-4 text-lg">
                Ir a Perfil
              </Button>
            </Card>
          </Link>
        </div>

        {/* Puedes añadir más secciones o estadísticas aquí en el futuro */}
        <div className="mt-8 text-gray-600 dark:text-gray-400">
          <p className="text-lg">¡Explora las funcionalidades de tu ERP!</p>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;