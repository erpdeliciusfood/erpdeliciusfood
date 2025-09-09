import React, { useMemo } from "react";
import { useConsumptionRecords } from "@/integrations/supabase/consumptionRecords"; // Corrected import path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ConsumptionRecord } from "@/types"; // Import ConsumptionRecord type

interface ConsumptionReportProps {
  startDate: Date;
  endDate: Date;
}

interface AggregatedConsumption {
  insumo_id: string;
  nombre: string;
  unidad_medida: string;
  total_consumed_quantity: number;
  total_cost: number;
}

const ConsumptionReport: React.FC<ConsumptionReportProps> = ({ startDate, endDate }) => {
  const formattedStartDate = format(startDate, "yyyy-MM-dd");
  const formattedEndDate = format(endDate, "yyyy-MM-dd");

  const { data: consumptionRecords, isLoading, isError, error } = useConsumptionRecords(formattedStartDate, formattedEndDate);

  const aggregatedConsumption = useMemo(() => {
    if (!consumptionRecords) return [];

    const aggregationMap = new Map<string, AggregatedConsumption>();

    consumptionRecords.forEach((record: ConsumptionRecord) => { // Explicitly typed 'record'
      const insumo = record.insumos;
      if (insumo) {
        if (!aggregationMap.has(insumo.id)) {
          aggregationMap.set(insumo.id, {
            insumo_id: insumo.id,
            nombre: insumo.nombre,
            unidad_medida: insumo.unidad_medida,
            total_consumed_quantity: 0,
            total_cost: 0,
          });
        }
        const current = aggregationMap.get(insumo.id)!;
        current.total_consumed_quantity += record.quantity_consumed;
        current.total_cost += record.quantity_consumed * insumo.costo_unitario;
      }
    });

    return Array.from(aggregationMap.values()).sort((a, b) => b.total_cost - a.total_cost);
  }, [consumptionRecords]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando reporte de consumo...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        <h1 className="2xl font-bold mb-4">Error al cargar datos</h1>
        <p className="text-lg">No se pudieron cargar los registros de consumo: {error?.message}</p>
      </div>
    );
  }

  const displayStartDate = format(startDate, "PPP", { locale: es });
  const displayEndDate = format(endDate, "PPP", { locale: es });

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reporte de Consumo de Insumos ({displayStartDate} - {displayEndDate})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {aggregatedConsumption.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Insumo</TableHead>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Unidad</TableHead>
                  <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Cantidad Consumida</TableHead>
                  <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Costo Total (S/)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregatedConsumption.map((item) => (
                  <TableRow key={item.insumo_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{item.nombre}</TableCell>
                    <TableCell className="text-base text-gray-700 dark:text-gray-300">{item.unidad_medida}</TableCell>
                    <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">{item.total_consumed_quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-base text-gray-800 dark:text-gray-200">S/ {item.total_cost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <UtensilsCrossed className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No se encontraron registros de consumo para el período seleccionado.</p>
            <p className="text-md mt-2">Asegúrate de haber registrado reportes de servicio con platos vendidos.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsumptionReport;