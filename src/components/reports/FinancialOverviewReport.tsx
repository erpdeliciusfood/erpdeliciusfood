import React, { useMemo } from "react";
import { useServiceReports } from "@/hooks/useServiceReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingDown, LineChart as LineChartIcon } from "lucide-react";
import { format, isWithinInterval, parseISO, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { ServiceReport } from "@/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface FinancialOverviewReportProps {
  startDate: Date;
  endDate: Date;
}

interface DailyCostData {
  date: string;
  cogs: number;
}

const FinancialOverviewReport: React.FC<FinancialOverviewReportProps> = ({ startDate, endDate }) => {
  const { data: serviceReports, isLoading, isError, error } = useServiceReports();

  const { totalCogs, chartData } = useMemo(() => {
    if (!serviceReports) {
      return {
        totalCogs: 0,
        chartData: [],
      };
    }

    let overallCogs = 0;
    const dailyDataMap = new Map<string, { cogs: number }>();

    // Initialize daily data for the interval
    eachDayOfInterval({ start: startDate, end: endDate }).forEach(day => {
      const formattedDay = format(day, "yyyy-MM-dd");
      dailyDataMap.set(formattedDay, { cogs: 0 });
    });

    serviceReports.forEach((report: ServiceReport) => {
      const reportDate = parseISO(report.report_date);
      if (isWithinInterval(reportDate, { start: startDate, end: endDate })) {
        const formattedReportDate = format(reportDate, "yyyy-MM-dd");
        const currentDayData = dailyDataMap.get(formattedReportDate) || { cogs: 0 };

        report.service_report_platos?.forEach(pv => {
          const plato = pv.platos;
          if (plato) {
            const cogs = plato.costo_produccion * pv.quantity_sold;
            currentDayData.cogs += cogs;
            overallCogs += cogs;
          }
        });
        dailyDataMap.set(formattedReportDate, currentDayData);
      }
    });

    const processedChartData: DailyCostData[] = Array.from(dailyDataMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date: format(parseISO(date), "dd MMM", { locale: es }),
        cogs: parseFloat(data.cogs.toFixed(2)),
      }));

    return {
      totalCogs: overallCogs,
      chartData: processedChartData,
    };
  }, [serviceReports, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando resumen de costos...</p>
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
          Resumen de Costos ({displayStartDate} - {displayEndDate})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6"> {/* Adjusted grid for single metric */}
          <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm">
            <TrendingDown className="h-8 w-8 text-red-600 mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Costo de Ventas (COGS) Total</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-400">S/ {totalCogs.toFixed(2)}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-8 flex items-center">
          <LineChartIcon className="h-6 w-6 mr-2" />
          Tendencia Diaria de Costos
        </h3>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" className="text-sm text-gray-700 dark:text-gray-300" />
                <YAxis className="text-sm text-gray-700 dark:text-gray-300" />
                <Tooltip
                  formatter={(value: number) => `S/ ${value.toFixed(2)}`}
                  labelFormatter={(label: string) => `Fecha: ${label}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Line type="monotone" dataKey="cogs" stroke="hsl(var(--destructive))" activeDot={{ r: 8 }} name="Costo de Ventas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <LineChartIcon className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No hay datos de costos para el período seleccionado para generar el gráfico.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialOverviewReport;