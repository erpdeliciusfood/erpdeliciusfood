import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils, UserCircle2, LayoutDashboard, ChefHat, BookText, CalendarDays, BarChart3, Users, ShoppingBag, FileText, Package, Warehouse } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsumos } from "@/hooks/useInsumos";
import { useRecetas } from "@/hooks/useRecetas";
import { useMenus } from "@/hooks/useMenus";
import { useEventTypes } from "@/hooks/useEventTypes";
import { useServiceReports } from "@/hooks/useServiceReports";
import { useStockMovements } from "@/hooks/useStockMovements";
import LowStockAlerts from "@/components/insumos/LowStockAlerts";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import { Skeleton } from "@/components/ui/skeleton"; // NEW: Import Skeleton component

const Index = () => {
  const { user, session } = useSession();
  const { data: profile } = useProfile();
  const { data: insumoData, isLoading: isLoadingInsumos } = useInsumos();
  const { data: recetas, isLoading: isLoadingRecetas } = useRecetas();
  const { data: menus, isLoading: isLoadingMenus } = useMenus();
  const { data: eventTypes, isLoading: isLoadingEventTypes } = useEventTypes();
  const { data: serviceReports, isLoading: isLoadingServiceReports } = useServiceReports();
  const { data: stockMovements, isLoading: isLoadingStockMovements } = useStockMovements();

  const userName = profile?.first_name || user?.email || "Usuario";
  const userRole = session?.user?.user_metadata?.role;

  const totalInsumos = insumoData?.count || 0;
  const totalRecetas = recetas?.length || 0;
  const totalMenus = menus?.length || 0;
  const totalEventTypes = eventTypes?.length || 0;
  const totalServiceReports = serviceReports?.length || 0;
  const totalStockMovements = stockMovements?.length || 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900"> {/* Eliminado p-4 */}
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <PageHeaderWithLogo
          title={`¡Bienvenido, ${userName}!`}
          description="Gestiona tus operaciones de restaurante de forma eficiente."
          icon={LayoutDashboard}
          hideLogo={true}
        />

        <div className="grid grid-cols-1 gap-6 mb-8">
          <LowStockAlerts />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card for Total Insumos */}
          <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Total Insumos</CardTitle>
              <Utensils className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingInsumos ? (
                <Skeleton className="h-10 w-full" /> {/* Using Skeleton */}
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalInsumos}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Número total de tipos de insumos únicos registrados en tu inventario.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card for Total Recetas */}
          <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Total Recetas</CardTitle>
              <ChefHat className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingRecetas ? (
                <Skeleton className="h-10 w-full" /> {/* Using Skeleton */}
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalRecetas}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Cantidad de recetas únicas disponibles para tus menús.
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
                <Skeleton className="h-10 w-full" /> {/* Using Skeleton */}
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalMenus}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Número de menús diarios o de evento que has planificado.
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
                <Skeleton className="h-10 w-full" /> {/* Using Skeleton */}
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalEventTypes}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Cantidad de categorías de eventos que has definido.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card for Total Service Reports */}
          <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Reportes de Servicio</CardTitle>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingServiceReports ? (
                <Skeleton className="h-10 w-full" /> {/* Using Skeleton */}
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalServiceReports}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Número de reportes de servicio que has creado.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card for Total Stock Movements */}
          <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Movimientos de Stock</CardTitle>
              <Package className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStockMovements ? (
                <Skeleton className="h-10 w-full" /> {/* Using Skeleton */}
              ) : (
                <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{totalStockMovements}</div>
              )}
              <CardDescription className="text-lg text-left mt-2">
                Cantidad total de movimientos de stock registrados.
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

          <Link to="/recetas">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Gestión de Recetas</CardTitle>
                <ChefHat className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Crea y administra tus recetas con los insumos disponibles.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Recetas
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

          <Link to="/service-reports">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Reportes de Servicio</CardTitle>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Registra y consulta los detalles de cada servicio de comida.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Reportes de Servicio
              </Button>
            </Card>
          </Link>

          <Link to="/purchase-planning">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Planificación de Compras</CardTitle>
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Analiza las necesidades de insumos según tus menús y stock.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-pink-600 hover:bg-pink-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Compras
              </Button>
            </Card>
          </Link>

          <Link to="/stock-movements">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Movimientos de Stock</CardTitle>
                <Package className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Registra entradas y salidas manuales de inventario.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Movimientos de Stock
              </Button>
            </Card>
          </Link>

          <Link to="/warehouse">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Gestión de Almacén</CardTitle>
                <Warehouse className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Prepara y deduce insumos para los menús diarios.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Almacén
              </Button>
            </Card>
          </Link>

          <Link to="/reports">
            <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Reportes y Análisis</CardTitle>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-left">
                  Visualiza el estado de tu inventario.
                </CardDescription>
              </CardContent>
              <Button className="w-full mt-4 px-8 py-4 text-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 ease-in-out">
                Ir a Reportes
              </Button>
            </Card>
          </Link>

          {userRole === 'admin' && (
            <Link to="/user-management">
              <Card className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer h-full flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-2xl font-bold">Gestión de Usuarios</CardTitle>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-left">
                    Administra los roles de los usuarios de tu aplicación.
                  </CardDescription>
              </CardContent>
                <Button className="w-full mt-4 px-8 py-4 text-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 ease-in-out">
                    Ir a Usuarios
                </Button>
              </Card>
            </Link>
          )}
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