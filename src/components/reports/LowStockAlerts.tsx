import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, PackageX } from "lucide-react";
import { useInsumos } from "@/hooks/useInsumos";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LowStockAlerts: React.FC = () => {
  // Fetch all insumos to correctly calculate low stock without pagination interference
  const { data: insumoData, isLoading, isError, error } = useInsumos(undefined, undefined, 1, 9999); // Fetch all items

  const lowStockInsumos = insumoData?.data.filter(
    (insumo) => insumo.stock_quantity <= (insumo.min_stock_level ?? 0) && (insumo.min_stock_level ?? 0) > 0 // Only show if min_stock_level is set and stock is below it
  ).sort((a, b) => a.stock_quantity - b.stock_quantity);

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Alertas de Stock Bajo
          </CardTitle>
          <AlertTriangle className="h-8 w-8 text-orange-500" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-primary-foreground" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando alertas de stock...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Alertas de Stock Bajo
          </CardTitle>
          <AlertTriangle className="h-8 w-8 text-orange-500" />
        </CardHeader>
        <CardContent className="text-center py-10 text-red-600 dark:text-red-400">
          <h1 className="text-xl font-bold mb-4">Error al cargar alertas</h1>
          <p className="text-lg">No se pudieron cargar los insumos: {error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Alertas de Stock Bajo
        </CardTitle>
        <AlertTriangle className="h-8 w-8 text-orange-500" />
      </CardHeader>
      <CardContent>
        {lowStockInsumos && lowStockInsumos.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
                  <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Stock Actual</TableHead>
                  <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Stock Mínimo</TableHead>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Unidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockInsumos.map((insumo) => (
                  <TableRow key={insumo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{insumo.nombre}</TableCell>
                    <TableCell className="text-right text-base">
                      <Badge variant="destructive" className="text-lg px-3 py-1">
                        {insumo.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                      {insumo.min_stock_level}
                    </TableCell>
                    <TableCell className="text-base text-gray-700 dark:text-gray-300">{insumo.purchase_unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6 text-center">
              <Link to="/insumos">
                <Button className="px-6 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 ease-in-out">
                  Gestionar Insumos
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <PackageX className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">¡Todos tus insumos tienen buen stock!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;