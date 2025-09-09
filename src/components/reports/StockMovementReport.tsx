import React from "react";
import { useStockMovements } from "@/hooks/useStockMovements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Package, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
// Removed StockMovementRecord import as it's inferred from useStockMovements
import { Badge } from "@/components/ui/badge";

interface StockMovementReportProps {
  startDate: Date;
  endDate: Date;
}

const StockMovementReport: React.FC<StockMovementReportProps> = ({ startDate, endDate }) => {
  const { data: stockMovements, isLoading, isError, error } = useStockMovements(startDate, endDate);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando reporte de movimientos de stock...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        <h1 className="text-2xl font-bold mb-4">Error al cargar datos</h1>
        <p className="text-lg">No se pudieron cargar los movimientos de stock: {error?.message}</p>
      </div>
    );
  }

  const displayStartDate = format(startDate, "PPP", { locale: es });
  const displayEndDate = format(endDate, "PPP", { locale: es });

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reporte de Movimientos de Stock ({displayStartDate} - {displayEndDate})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stockMovements && stockMovements.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Fecha</TableHead>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Tipo</TableHead>
                  <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Cantidad</TableHead>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Unidad</TableHead>
                  <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Stock Resultante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockMovements.map((movement) => (
                  <TableRow key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">
                      {format(new Date(movement.date), "PPP HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell className="text-base text-gray-700 dark:text-gray-300">{movement.insumo_nombre}</TableCell>
                    <TableCell className="text-base text-gray-700 dark:text-gray-300">
                      {movement.type === 'initial' && <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Package className="h-4 w-4 mr-1" /> Inicial</Badge>}
                      {movement.type === 'in' && <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><ArrowUp className="h-4 w-4 mr-1" /> Entrada</Badge>}
                      {movement.type === 'out' && <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><ArrowDown className="h-4 w-4 mr-1" /> Salida</Badge>}
                    </TableCell>
                    <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">
                      {movement.quantity.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-base text-gray-700 dark:text-gray-300">{movement.purchase_unit}</TableCell>
                    <TableCell className="text-right text-base text-gray-800 dark:text-gray-200">
                      <Badge variant={movement.current_stock_after_movement <= 0 ? "destructive" : "secondary"}>
                        {movement.current_stock_after_movement.toFixed(2)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <Package className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No se encontraron movimientos de stock para el período seleccionado.</p>
            <p className="text-md mt-2">Asegúrate de haber registrado reportes de servicio con platos vendidos.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockMovementReport;