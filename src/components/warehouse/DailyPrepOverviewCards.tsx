import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Utensils } from "lucide-react";

interface DailyPrepOverviewCardsProps {
  totalMenus: number;
  totalUniqueInsumos: number;
  insufficientStockCount: number;
}

const DailyPrepOverviewCards: React.FC<DailyPrepOverviewCardsProps> = ({
  totalMenus,
  totalUniqueInsumos,
  insufficientStockCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300">Menús del Día</CardTitle>
          <Utensils className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalMenus}</div>
          <p className="text-sm text-muted-foreground mt-1">Menús planificados para hoy</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300">Insumos Únicos Necesarios</CardTitle>
          <Package className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalUniqueInsumos}</div>
          <p className="text-sm text-muted-foreground mt-1">Tipos de insumos requeridos</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300">Insumos con Stock Insuficiente</CardTitle>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${insufficientStockCount > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
            {insufficientStockCount}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Requieren atención</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyPrepOverviewCards;