import React, { useMemo } from "react";
import { useServiceReports } from "@/hooks/useServiceReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, BarChart as BarChartIcon } from "lucide-react"; // 'TrendingUp' removed
import { format, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ServiceReport } from "@/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SalesProfitabilityReportProps {
  startDate: Date;
  endDate: Date;
}

interface PlatoProfitability {
  platoId: string;
  platoName: string;
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  profitMargin: number;
  quantitySold: number;
}

const SalesProfitabilityReport: React.FC<SalesProfitabilityReportProps> = ({ startDate, endDate }) => {
  const { data: serviceReports, isLoading, isError, error } = useServiceReports();

  const platoProfitabilityData = useMemo(() => {
    if (!serviceReports) return [];

    const profitabilityMap = new Map<string, PlatoProfitability>();

    serviceReports.forEach((report: ServiceReport) => {
      const reportDate = parseISO(report.report_date);
      if (isWithinInterval(reportDate, { start: startDate, end: endDate })) {
        report.service_report_platos?.forEach(srp => {
          const plato = srp.platos;
          if (plato) {
            const currentData = profitabilityMap.get(plato.id) || {
              platoId: plato.id,
              platoName: plato.nombre,
              totalRevenue: 0,
              totalCogs: 0,
              grossProfit: 0,
              profitMargin: 0,
              quantitySold: 0,
            };

            const revenue = plato.precio_venta * srp.quantity_sold;
            const cogs = plato.costo_produccion * srp.quantity_sold;

            currentData.totalRevenue += revenue;
            currentData.totalCogs += cogs;
            currentData.grossProfit += (revenue - cogs);
            currentData.quantitySold += srp.quantity_sold;

            profitabilityMap.set(plato.id, currentData);
          }
        });
      }
    });

    const result = Array.from(profitabilityMap.values()).map(data => {
      const profitMargin = data.totalRevenue > 0 ? (data.grossProfit / data.totalRevenue) * 100 : 0;
      return {
        ...data,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        totalRevenue: parseFloat(data.totalRevenue.toFixed(2)),
        totalCogs: parseFloat(data.totalCogs.toFixed(2)),
        grossProfit: parseFloat(data.grossProfit.toFixed(2)),
      };
    });

    return result.sort((a, b) => b.grossProfit - a.grossProfit); // Sort by highest gross profit
  }, [serviceReports, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando reporte de rentabilidad...</p>
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
          Rentabilidad de Ventas por Plato ({displayStartDate} - {displayEndDate})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {platoProfitabilityData.length > 0 ? (
          <>
            <div className="overflow-x-auto mb-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-lg font-semibold text-gray-700 dark:text-gray-200">Plato</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Unidades Vendidas</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Ingresos (S/)</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Costo de Ventas (S/)</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Ganancia Bruta (S/)</TableHead>
                    <TableHead className="text-right text-lg font-semibold text-gray-700 dark:text-gray-200">Margen (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platoProfitabilityData.map((data) => (
                    <TableRow key={data.platoId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell className="font-medium text-base text-gray-800 dark:text-gray-200">{data.platoName}</TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">{data.quantitySold}</TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">S/ {data.totalRevenue.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-base text-gray-700 dark:text-gray-300">S/ {data.totalCogs.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-base">
                        <Badge variant={data.grossProfit > 0 ? "default" : "destructive"} className="text-lg px-3 py-1">
                          S/ {data.grossProfit.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-base">
                        <Badge variant={data.profitMargin > 0 ? "default" : "destructive"} className="text-lg px-3 py-1">
                          {data.profitMargin.toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-8 flex items-center">
              <BarChartIcon className="h-6 w-6 mr-2" />
              Platos más Rentables (Ganancia Bruta)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={platoProfitabilityData.slice(0, 10)} // Show top 10
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="platoName" angle={-45} textAnchor="end" height={80} interval={0} className="text-sm text-gray-700 dark:text-gray-300" />
                  <YAxis className="text-sm text-gray-700 dark:text-gray-300" />
                  <Tooltip
                    formatter={(value: number) => `S/ ${value.toFixed(2)}`}
                    labelFormatter={(label: string) => `Plato: ${label}`}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="grossProfit" fill="hsl(var(--primary))" name="Ganancia Bruta" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <DollarSign className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No hay datos de ventas de platos para el período seleccionado.</p>
            <p className="text-md mt-2">Asegúrate de tener reportes de servicio registrados con platos vendidos para este rango de fechas.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesProfitabilityReport;