import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, AlertTriangle, Truck, Warehouse, UtensilsCrossed } from "lucide-react";
import { useInsumos } from "@/hooks/useInsumos";
import { Insumo } from "@/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const StockDashboard: React.FC = () => {
  // Fetch all insumos to get a complete overview without pagination limits
  const { data: insumoData, isLoading, isError, error } = useInsumos(undefined, undefined, 1, 9999);

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Resumen de Stock
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-primary-foreground" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando resumen de stock...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Resumen de Stock
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6 text-red-600 dark:text-red-400">
          <h1 className="text-xl font-bold mb-4">Error al cargar el resumen de stock</h1>
          <p className="text-lg">No se pudieron cargar los insumos: {error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  const insumos: Insumo[] = insumoData?.data || [];

  const totalInsumos = insumos.length;
  const lowStockInsumos = insumos.filter(
    (insumo) => insumo.stock_quantity <= (insumo.min_stock_level ?? 0) && (insumo.min_stock_level ?? 0) > 0
  ).length;
  const pendingReceptionInsumos = insumos.filter(
    (insumo) => insumo.pending_reception_quantity > 0
  ).length;
  const pendingDeliveryInsumos = insumos.filter(
    (insumo) => insumo.pending_delivery_quantity > 0
  ).length;

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Resumen de Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <Package className="h-8 w-8 text-primary dark:text-primary-foreground mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Insumos</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalInsumos}</p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow-sm">
            <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Stock Bajo</p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">{lowStockInsumos}</p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow-sm">
            <Warehouse className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Pendiente Recepción</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{pendingReceptionInsumos}</p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
            <Truck className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Pendiente Entrega</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{pendingDeliveryInsumos}</p>
          </div>
        </div>
        {totalInsumos === 0 && (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400 mt-6">
            <UtensilsCrossed className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No hay insumos registrados en tu inventario.</p>
            <Link to="/insumos">
              <Button className="mt-4 px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out">
                Añadir Insumos
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockDashboard;