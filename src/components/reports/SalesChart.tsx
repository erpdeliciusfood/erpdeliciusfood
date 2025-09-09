import React from "react";
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
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SalesChartProps {
  orders: Order[];
}

const SalesChart: React.FC<SalesChartProps> = ({ orders }) => {
  // Aggregate sales data by date
  const salesDataMap = new Map<string, number>();

  orders.forEach((order) => {
    if (order.status === "completed") {
      const date = format(new Date(order.created_at), "yyyy-MM-dd");
      salesDataMap.set(date, (salesDataMap.get(date) || 0) + order.total_amount);
    }
  });

  const data = Array.from(salesDataMap.entries())
    .map(([date, amount]) => ({
      date,
      sales: parseFloat(amount.toFixed(2)),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="w-full h-[400px] shadow-lg dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ventas por Día</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                tickFormatter={(str) => format(new Date(str), "dd MMM", { locale: es })}
                className="text-sm text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickFormatter={(value) => `S/ ${value.toFixed(2)}`}
                className="text-sm text-gray-600 dark:text-gray-400"
              />
              <Tooltip
                formatter={(value: number) => `S/ ${value.toFixed(2)}`}
                labelFormatter={(label: string) => format(new Date(label), "PPP", { locale: es })}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                activeDot={{ r: 8 }}
                name="Ventas"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-400">
            No hay datos de ventas completadas para mostrar.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesChart;