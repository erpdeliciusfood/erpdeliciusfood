"use client";

import React from "react";
import { useInsumos } from "@/hooks/useInsumos";
import { Insumo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LowStockAlerts: React.FC = () => {
  // Fetch all insumos to correctly calculate low stock without pagination interference
  const { data: insumoData, isLoading, isError, error } = useInsumos(undefined, undefined, 1, 9999); // Fetch all items

  const lowStockInsumos = insumoData?.data.filter(
    (insumo: Insumo) => insumo.stock_quantity <= (insumo.min_stock_level ?? 0) && (insumo.min_stock_level ?? 0) > 0 // Only show if min_stock_level is set and stock is below it
  ).sort((a: Insumo, b: Insumo) => a.stock_quantity - b.stock_quantity);

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            Alertas de Bajo Stock
          </CardTitle>
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-600 dark:text-gray-400">Cargando insumos...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            Alertas de Bajo Stock
          </CardTitle>
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <p className="text-lg text-red-600 dark:text-red-400">Error al cargar insumos: {error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!lowStockInsumos || lowStockInsumos.length === 0) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
            Alertas de Bajo Stock
          </CardTitle>
          <UtensilsCrossed className="h-8 w-8 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-600 dark:text-gray-400">¡Excelente! No hay insumos con bajo stock.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
          Alertas de Bajo Stock
        </CardTitle>
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="text-left text-base font-semibold text-gray-900 dark:text-gray-100 py-3 px-6 min-w-[200px]">Insumo</TableHead>
              <TableHead className="text-right text-base font-semibold text-gray-900 dark:text-gray-100 py-3 px-6 min-w-[150px]">Stock Actual</TableHead>
              <TableHead className="text-right text-base font-semibold text-gray-900 dark:text-gray-100 py-3 px-6 min-w-[150px]">Stock Mínimo</TableHead>
              <TableHead className="text-left text-base font-semibold text-gray-900 dark:text-gray-100 py-3 px-6 min-w-[120px]">Unidad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockInsumos.map((insumo: Insumo) => (
              <TableRow key={insumo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 min-w-[200px]">{insumo.nombre}</TableCell>
                <TableCell className="text-right text-base py-3 px-6 min-w-[150px]">
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {insumo.stock_quantity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-base text-gray-700 dark:text-gray-300 py-3 px-6 min-w-[150px]">
                  {insumo.min_stock_level}
                </TableCell>
                <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[120px]">{insumo.purchase_unit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;