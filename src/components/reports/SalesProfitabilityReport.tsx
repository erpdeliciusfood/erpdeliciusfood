import React, { useMemo } from "react";
import { useServiceReports } from "@/hooks/useServiceReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
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

interface SalesProfitabilityReportProps {
  startDate: Date;
  endDate: Date;
}

interface DailyProfitData {
  date: string;
  revenue: number;
  cogs: number;
  profit: number;
}

const SalesProfitabilityReport: React.FC<SalesProfitabilityReportProps> = ({ startDate, endDate }) => {
  const { data: serviceReports, isLoading, isError, error } = useServiceReports();

  const { totalRevenue, totalCogs, totalProfit, chartData } = useMemo(() => {
    if (!serviceReports) {
      return {
        totalRevenue: 0,
        totalCogs: 0,
        totalProfit: 0,
        chartData: [],
      };
    }

    let overallRevenue = 0;
    let overallCogs = 0;
    const dailyDataMap = new Map<string, { revenue: number; cogs: number }>();

    // Initialize daily data for the interval
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const formattedDay = format(d, "yyyy-MM-dd");
      dailyDataMap.set(formattedDay, { revenue: 0, cogs: 0 });
    }

    serviceReports.forEach((report: ServiceReport) => {
      const reportDate = parseISO(report.report_date);
      if (isWithinInterval(reportDate, { start: startDate, end: endDate })) {
        const formattedReportDate = format(reportDate, "yyyy-MM-dd");
        const currentDayData = dailyDataMap.get(formattedReportDate) || { revenue: 0, cogs: 0 };

        // Calculate revenue from meals sold and additional services
        let mealsCogs = 0;
        report.service_report_platos?.forEach(pv => {
          const plato = pv.platos;
          if (plato) {
            // Removed plato.precio_venta from revenue calculation
            mealsCogs += plato.costo_produccion * pv.quantity_sold;
          }
        });

        // Revenue now only includes additional services revenue
        currentDayData.revenue += report.additional_services_revenue;
        currentDayData.cogs += mealsCogs;
        
        overallRevenue += report.additional_services_revenue;
        overallCogs += mealsCogs;

        dailyDataMap.set(formattedReportDate, currentDayData);
      }
    });

    const processedChartData: DailyProfitData[] = Array.from(dailyDataMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date: format(parseISO(date), "dd MMM", { locale: es }),
        revenue: parseFloat(data.revenue.toFixed(2)),
        cogs: parseFloat(data.cogs.toFixed(2)),
        profit: parseFloat((data.revenue - data.cogs).toFixed(2)),
      }));

    return {
      totalRevenue: parseFloat(overallRevenue.toFixed(2)),
      totalCogs: parseFloat(overallCogs.toFixed(2)),
      totalProfit: parseFloat((overallRevenue - overallCogs).toFixed(2)),
      chartData: processedChartData,
    };
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
          Reporte de Rentabilidad de Ventas ({displayStartDate} - {displayEndDate})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
            <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Ingresos Totales</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">S/ {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm">
            <TrendingDown className="h-8 w-8 text-red-600 mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Costo de Ventas (COGS)</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-400">S/ {totalCogs.toFixed(2)}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm">
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Ganancia Neta</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">S/ {totalProfit.toFixed(2)}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-8 flex items-center">
          <BarChart className="h-6 w-6 mr-2" />
          Rentabilidad Diaria
        </h3>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                  formatter={(value: number, name: string) => [`S/ ${value.toFixed(2)}`, name === 'revenue' ? 'Ingresos' : name === 'cogs' ? 'Costo de Ventas' : 'Ganancia']}
                  labelFormatter={(label: string) => `Fecha: ${label}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Ingresos" />
                <Bar dataKey="cogs" fill="hsl(var(--destructive))" name="Costo de Ventas" />
                <Bar dataKey="profit" fill="hsl(var(--green-600))" name="Ganancia" /> {/* Assuming a green color for profit */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <BarChart className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">No hay datos de ventas para el período seleccionado para generar el gráfico.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesProfitabilityReport;