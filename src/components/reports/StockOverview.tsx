import React from "react";
import { Insumo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, PackageX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface StockOverviewProps {
  insumos: Insumo[];
  lowStockThreshold?: number;
}

const StockOverview: React.FC<StockOverviewProps> = ({ insumos, lowStockThreshold = 10 }) => {
  const lowStockInsumos = insumos.filter(
    (insumo) => insumo.stock_quantity <= lowStockThreshold
  ).sort((a, b) => a.stock_quantity - b.stock_quantity);

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Insumos con Bajo Stock
        </CardTitle>
        <AlertCircle className="h-8 w-8 text-red-500" />
      </CardHeader>
      <CardContent>
        {lowStockInsumos.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Insumo</TableHead>
                  <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Stock Actual</TableHead>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Unidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockInsumos.map((insumo) => (
                  <TableRow key={insumo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left min-w-[180px]">{insumo.nombre}</TableCell>
                    <TableCell className="text-right text-base py-3 px-6 min-w-[150px]">
                      <Badge variant="destructive" className="text-lg px-3 py-1">
                        {insumo.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[120px]">{insumo.base_unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

export default StockOverview;