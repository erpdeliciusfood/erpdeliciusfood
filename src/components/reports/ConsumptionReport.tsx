import React, { useMemo } from "react";
import { useServiceReports } from "@/hooks/useServiceReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { ServiceReport } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ConsumptionReportProps {
  startDate: Date;
  endDate: Date;
}

interface InsumoConsumption {
  insumoId: string;
  insumoName: string;
  totalConsumed: number;
  baseUnit: string;
}

const ConsumptionReport: React.FC<ConsumptionReportProps> = ({ startDate, endDate }) => {
  const { data: serviceReports, isLoading, isError, error } = useServiceReports();

  const insumoConsumptionData = useMemo(() => {
    if (!serviceReports) return [];

    const consumptionMap = new Map<string, InsumoConsumption>();

    serviceReports.forEach((report: ServiceReport) => {
      const reportDate = new Date(report.report_date);
      if (isWithinInterval(reportDate, { start: startDate, end: endDate })) {
        report.service_report_platos?.forEach(srp => {
          const receta = srp.platos; // Changed plato to receta
          if (receta) {
            receta.plato_insumos?.forEach(pi => {
              const insumo = pi.insumos;
              if (insumo) {
                const consumedQuantityInBaseUnit = pi.cantidad_necesaria * srp.quantity_sold;
                const currentData = consumptionMap.get(insumo.id) || {
                  insumoId: insumo.id,
                  insumoName: insumo.nombre,
                  totalConsumed: 0,
                  baseUnit: insumo.base_unit,
                };
                currentData.totalConsumed += consumedQuantityInBaseUnit;
                consumptionMap.set(insumo.id, currentData);
              }
            });
          }
        });
      }
    });

    const result = Array.from(consumptionMap.values()).map(data => ({
      ...data,
      totalConsumed: parseFloat(data.totalConsumed.toFixed(2)),
    }));

    return result.sort((a, b) => b.totalConsumed - a.totalConsumed); // Sort by highest consumption
  }, [serviceReports, startDate, endDate]);

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
        <h1 className="text-2xl font-bold mb-4">Error al cargar datos</h1>
        <p className="text-lg">No se pudieron cargar los reportes de servicio: {error?.message}</p>
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
        {insumoConsumptionData.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[180px]">Insumo</TableHead>
                  <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[150px]">Cantidad Consumida</TableHead>
                  <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[120px]">Unidad Base</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insumoConsumptionData.map((data) => (
                  <TableRow key={data.insumoId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200 py-3 px-6 text-left min-w-[180px]">{data.insumoName}</TableCell>
                    <TableCell className="text-right text-base py-3 px-6 min-w-[150px]">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {data.totalConsumed.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-base text-gray-700 dark:text-gray-300 py-3 px-6 text-left min-w-[120px]">{data.baseUnit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <Package className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No hay datos de consumo de insumos para el período seleccionado.</p>
            <p className="text-md mt-2">Asegúrate de tener reportes de servicio registrados con recetas vendidas para este rango de fechas.</p> {/* Changed text */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsumptionReport;