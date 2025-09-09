import React, { useMemo } from "react";
import { useServiceReports } from "@/hooks/useServiceReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ServiceReport } from "@/types";

interface SalesProfitabilityReportProps {
  startDate: Date;
  endDate: Date;
}

interface AggregatedSales {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  platoSales: {
    [platoId: string]: {
      nombre: string;
      totalQuantitySold: number;
      totalPlatoRevenue: number;
      totalPlatoCogs: number;
      platoGrossProfit: number;
    };
  };
}

const SalesProfitabilityReport: React.FC<SalesProfitabilityReportProps> = ({ startDate, endDate }) => {
  const { data: serviceReports, isLoading, isError, error } = useServiceReports();

  const aggregatedSales = useMemo(() => {
    if (!serviceReports) {
      return {
        totalRevenue: 0,
        totalCogs: 0,
        grossProfit: 0,
        platoSales: {},
      };
    }

    let totalRevenue = 0;
    let totalCogs = 0;
    const platoSales: AggregatedSales['platoSales'] = {};

    serviceReports.forEach((report: ServiceReport) => {
      const reportDate = parseISO(report.report_date);
      if (isWithinInterval(reportDate, { start: startDate, end: endDate })) {
        // Add additional services revenue
        totalRevenue += report.additional_services_revenue;

        report.platos_vendidos_data?.forEach(pv => {
          const plato = pv.platos;
          if (plato) {
            const revenue = plato.precio_venta * pv.quantity_sold;
            const cogs = plato.costo_produccion * pv.quantity_sold;

            totalRevenue += revenue;
            totalCogs += cogs;

            if (!platoSales[plato.id]) {
              platoSales[plato.id] = {
                nombre: plato.nombre,
                totalQuantitySold: 0,
                totalPlatoRevenue: 0,
                totalPlatoCogs: 0,
                platoGrossProfit: 0,
              };
            }
            platoSales[plato.id].totalQuantitySold += pv.quantity_sold;
            platoSales[plato.id].totalPlatoRevenue += revenue;
            platoSales[plato.id].totalPlatoCogs += cogs;
            platoSales[plato.id].platoGrossProfit += (revenue - cogs);
          }
        });
      }
    });

    const grossProfit = totalRevenue - totalCogs;

    return {
      totalRevenue,
      totalCogs,
      grossProfit,
      platoSales,
    };
  }, [serviceReports, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando reporte de ventas...</p>
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

  const sortedPlatoSales = Object.values(aggregatedSales.platoSales).sort((a, b) => b.totalPlatoRevenue - a.totalPlatoRevenue);

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reporte de Ventas y Rentabilidad ({displayStartDate} - {displayEndDate})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm">
            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Ingresos Totales</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">S/ {aggregatedSales.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm">
            <TrendingDown className="h-8 w-8 text-red-600 mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Costo de Ventas (COGS)</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-400">S/ {aggregatedSales.totalCogs.toFixed(2)}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
            <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Ganancia Bruta</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">S/ {aggregatedSales.grossProfit.toFixed(2)}</p>
          </div>
        </div>

        {sortedPlatoSales.length > 0 ? (
          <>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-8">Detalle de Ventas por Plato</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Plato</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Cantidad Vendida</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Ingresos (S/)</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Costo (S/)</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Ganancia Bruta (S/)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPlatoSales.map((plato) => (
                    <TableRow key={plato.nombre} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{plato.nombre}</TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">{plato.totalQuantitySold}</TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">S/ {plato.totalPlatoRevenue.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">S/ {plato.totalPlatoCogs.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-base text-gray-800 dark:text-gray-200">S/ {plato.platoGrossProfit.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <DollarSign className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No se encontraron ventas para el período seleccionado.</p>
            <p className="text-md mt-2">Asegúrate de haber registrado reportes de servicio con platos vendidos.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesProfitabilityReport;