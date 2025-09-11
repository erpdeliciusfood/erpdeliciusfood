"use client";

import React from "react";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ChefHat, ShoppingBag, Package, AlertTriangle, ReceiptText, Users, CalendarDays, FileText, BarChart3, Warehouse, AlertCircle, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useInsumos } from "@/hooks/useInsumos";
import { useRecetas } from "@/hooks/useRecetas";
import { useMenusList } from "@/hooks/useMenus"; // Updated import
import { useServiceReports } from "@/hooks/useServiceReports";
import { usePurchaseRecords } from "@/hooks/usePurchaseRecords";
import { useUrgentPurchaseRequests } from "@/hooks/useUrgentPurchaseRequests";
import LowStockAlerts from "@/components/insumos/LowStockAlerts";
import UrgentPurchaseAlert from "@/components/purchase-planning/UrgentPurchaseAlert";

const Index: React.FC = () => {
  const { session, profile } = useSession();
  const user = session?.user;

  const userName = profile?.first_name || user?.email || "Usuario";
  const userRole = session?.user?.user_metadata?.role;

  const { data: insumoData } = useInsumos(undefined, undefined, 1, 9999);
  const { data: recetas } = useRecetas();
  const { data: menus } = useMenusList(); // Updated hook
  const { data: serviceReports } = useServiceReports();
  const { data: purchaseRecords } = usePurchaseRecords();
  const { data: urgentPurchaseRequests } = useUrgentPurchaseRequests();

  const totalInsumos = insumoData?.count || 0;
  const totalRecetas = recetas?.length || 0;
  const totalMenus = menus?.length || 0;
  const totalServiceReports = serviceReports?.length || 0;
  const totalPurchaseRecords = purchaseRecords?.length || 0;
  const totalUrgentPurchaseRequests = urgentPurchaseRequests?.length || 0;

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Bienvenido, {userName}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link to="/insumos">
          <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Insumos</CardTitle>
              <Utensils className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{totalInsumos}</div>
              <p className="text-sm text-muted-foreground">Total de insumos registrados</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/recetas">
          <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Recetas</CardTitle>
              <ChefHat className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{totalRecetas}</div>
              <p className="text-sm text-muted-foreground">Total de recetas creadas</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/menus">
          <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Menús</CardTitle>
              <CalendarDays className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{totalMenus}</div>
              <p className="text-sm text-muted-foreground">Menús planificados</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/service-reports">
          <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Reportes de Servicio</CardTitle>
              <FileText className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{totalServiceReports}</div>
              <p className="text-sm text-muted-foreground">Reportes de servicio generados</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/purchase-planning">
          <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Planificación de Compras</CardTitle>
              <ShoppingBag className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{totalPurchaseRecords}</div>
              <p className="text-sm text-muted-foreground">Registros de compra</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/urgent-purchase-requests">
          <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Solicitudes Urgentes</CardTitle>
              <AlertCircle className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{totalUrgentPurchaseRequests}</div>
              <p className="text-sm text-muted-foreground">Solicitudes de compra urgentes</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/stock-movements">
          <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Movimientos de Stock</CardTitle>
              <Package className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">...</div>
              <p className="text-sm text-muted-foreground">Registros de movimientos</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/warehouse">
          <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Almacén</CardTitle>
              <Warehouse className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">...</div>
              <p className="text-sm text-muted-foreground">Gestión de inventario</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/reports">
          <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Reportes Generales</CardTitle>
              <BarChart3 className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">...</div>
              <p className="text-sm text-muted-foreground">Análisis y estadísticas</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/menu-breakdown">
          <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Quebrado de Menús</CardTitle>
              <ClipboardList className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">...</div>
              <p className="text-sm text-muted-foreground">Planificación visual de menús</p>
            </CardContent>
          </Card>
        </Link>

        {userRole === 'admin' && (
          <Link to="/user-management">
            <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Gestión de Usuarios</CardTitle>
                <Users className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold">...</div>
                <p className="text-sm text-muted-foreground">Administrar usuarios</p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <LowStockAlerts />
        <UrgentPurchaseAlert />
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Index;