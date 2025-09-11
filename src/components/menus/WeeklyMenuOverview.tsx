import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, PlusCircle, CheckCircle2, Loader2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useMenus } from "@/hooks/useMenus";
import { Menu } from "@/types";

interface WeeklyMenuOverviewProps {
  onAddMenu: (date: Date) => void;
}

const WeeklyMenuOverview: React.FC<WeeklyMenuOverviewProps> = ({ onAddMenu }) => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { locale: es });
  const endOfCurrentWeek = endOfWeek(today, { locale: es });

  const formattedStartOfWeek = format(startOfCurrentWeek, "yyyy-MM-dd");
  const formattedEndOfWeek = format(endOfCurrentWeek, "yyyy-MM-dd");

  const { data: menusInWeek, isLoading, isError, error } = useMenus(formattedStartOfWeek, formattedEndOfWeek);

  const daysOfWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <CalendarDays className="mr-2 h-6 w-6" />
            Resumen Semanal de Menús
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-primary-foreground" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando resumen semanal...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full shadow-lg dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <CalendarDays className="mr-2 h-6 w-6" />
            Resumen Semanal de Menús
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10 text-red-600 dark:text-red-400">
          <h1 className="text-xl font-bold mb-4">Error al cargar menús</h1>
          <p className="text-lg">No se pudieron cargar los menús para el resumen semanal: {error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <CalendarDays className="mr-2 h-6 w-6" />
          Resumen Semanal de Menús ({format(startOfCurrentWeek, "dd MMM", { locale: es })} - {format(endOfCurrentWeek, "dd MMM", { locale: es })})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4"> {/* Adjusted grid columns for responsiveness */}
          {daysOfWeek.map((day) => {
            const hasMenu = menusInWeek?.some((menu: Menu) => menu.menu_date && isSameDay(parseISO(menu.menu_date), day));
            const isToday = isSameDay(day, today);
            return (
              <div
                key={format(day, "yyyy-MM-dd")}
                className={`flex flex-col items-center justify-between p-3 sm:p-4 rounded-lg border ${isToday ? "border-primary dark:border-primary-foreground bg-primary/10 dark:bg-primary-foreground/10" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"} h-32 sm:h-36`} 
              >
                <p className={`text-base sm:text-lg font-semibold ${isToday ? "text-primary dark:text-primary-foreground" : "text-gray-800 dark:text-gray-200"}`}> 
                  {format(day, "EEE", { locale: es })}
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${isToday ? "text-primary dark:text-primary-foreground" : "text-gray-900 dark:text-gray-100"}`}> 
                  {format(day, "dd")}
                </p>
                {hasMenu ? (
                  <div className="flex items-center text-green-600 dark:text-green-400 mt-2">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1" /> 
                    <span className="text-sm sm:text-base">Menú</span> 
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddMenu(day)}
                    className="mt-2 text-sm sm:text-base h-8 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-700 dark:hover:bg-blue-800" 
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Añadir
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyMenuOverview;