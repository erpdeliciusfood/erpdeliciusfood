import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils, UserCircle2, LayoutDashboard, ChefHat, ShoppingCart, BookText, CalendarDays } from "lucide-react"; // Removed Package
import { useSession } from "@/contexts/SessionContext";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsumos } from "@/hooks/useInsumos";
import { usePlatos } from "@/hooks/usePlatos";
import { useOrders } from "@/hooks/useOrders";
import { useMenus } from "@/hooks/useMenus";
import { useEventTypes } from "@/hooks/useEventTypes";

const Index = () => {
  const { user } = useSession();
  const { data: profile } = useProfile();
  const { data: insumos, isLoading: isLoadingInsumos } = useInsumos();
  const { data: platos, isLoading: isLoadingPlatos } = usePlatos();
  const { data: orders, isLoading: isLoadingOrders } = useOrders();
  const { data: menus, isLoading: isLoadingMenus } = useMenus();
  const { data: eventTypes, isLoading: isLoadingEventTypes } = useEventTypes();

  const userName = profile?.first_name || user?.email || "Usuario";

  const totalInsumos = insumos?.length || 0;
  const totalPlatos = platos?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalMenus = menus?.length || 0;
  const totalEventTypes = eventTypes?.length || 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <LayoutDashboard className="mx-auto h-16 w-16 mb-6 text-primary dark:text-primary-foreground" />
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          ¡Bienvenido, {userName}!
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          Gestiona tus operaciones de restaurante de forma eficiente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card for Total Insumos */}
          <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Total Insumos</CardTitle>
              <Utensils className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingInsumos ? (
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalInsumos}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Insumos registrados en tu inventario.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card for Total Platos */}
          <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Total Platos</CardTitle>
              <ChefHat className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingPlatos ? (
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalPlatos}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Platos disponibles en tu menú.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card for Total Orders */}
          <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Total Pedidos</CardTitle>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalOrders}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Pedidos registrados hasta ahora.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card for Total Menus */}
          <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Total Menús</CardTitle>
              <BookText className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingMenus ? (
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalMenus}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Menús planificados y registrados.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card for Total Event Types */}
          <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Tipos de Evento</CardTitle>
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingEventTypes ? (
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalEventTypes}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Tipos de eventos personalizados.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          <Link to="/platos">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Gestión de Platos</CardTitle>
                <ChefHat className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Crea y administra tus recetas con los insumos disponibles.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Platos
              </Button>
            </Card>
          </Link>

          <Link to="/orders">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Gestión de Pedidos</CardTitle>
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Administra los pedidos de tus clientes, su estado y los platos.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Pedidos
              </Button>
            </Card>
          </Link>

          <Link to="/event-types">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Gestión de Tipos de Evento</CardTitle>
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Define y organiza los diferentes tipos de eventos.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Tipos de Evento
              </Button>
            </Card>
          </Link>

          <Link to="/menus">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Gestión de Menús</CardTitle>
                <BookText className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Planifica tus menús diarios y para eventos especiales.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Menús
              </Button>
            </Card>
          </Link>
        </div>

        {/* Existing Profile Card */}
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

        <div className="mt-8 text-gray-600 dark:text-gray-400">
          <p className="text-lg">¡Explora las funcionalidades de tu ERP!</p>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;