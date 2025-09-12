import React, { useState, useEffect, useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, PlusCircle, List, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMenus } from "@/hooks/useMenus";
import { Menu } from "@/types";
import { DayModifiers } from "react-day-picker";
import DailyMenuList from "./DailyMenuList";
import MenuFormSheet from "./MenuFormSheet";
import { showError } from "@/utils/toast";
import CalendarDayCellContent from "./CalendarDayCellContent";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface MenuDynamicCalendarViewProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingMenu: Menu | null;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  onAddMenu: (date: Date) => void;
  onEditMenu: (menu: Menu) => void;
}

const MenuDynamicCalendarView: React.FC<MenuDynamicCalendarViewProps> = ({
  isFormOpen,
  setIsFormOpen,
  editingMenu,
  selectedDate,
  setSelectedDate,
  onAddMenu,
  onEditMenu,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week'); // Por defecto, vista semanal
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Para la navegación en la vista mensual

  // Determina el rango de fechas para la consulta de menús según el modo de vista
  const dateRange = useMemo(() => {
    const today = new Date();
    if (viewMode === 'week') {
      return {
        from: startOfWeek(today, { locale: es }),
        to: endOfWeek(today, { locale: es }),
      };
    } else { // 'month'
      return {
        from: startOfMonth(currentMonth),
        to: endOfMonth(currentMonth),
      };
    }
  }, [viewMode, currentMonth]);

  const formattedStartDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const formattedEndDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const { data: menusInView, isLoading, isError, error } = useMenus(formattedStartDate, formattedEndDate);

  const [dailyMenus, setDailyMenus] = useState<Menu[]>([]);

  useEffect(() => {
    if (selectedDate && menusInView) {
      const menusForSelectedDay = menusInView.filter(menu =>
        menu.menu_date && isSameDay(parseISO(menu.menu_date), selectedDate)
      );
      setDailyMenus(menusForSelectedDay);
    } else {
      setDailyMenus([]);
    }
  }, [selectedDate, menusInView]);

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    setSelectedDate(undefined); // Limpiar la fecha seleccionada al cambiar de mes
  };

  const handleAddMenuForSelectedDate = (date: Date) => {
    if (!menusInView) {
      showError("Cargando menús, por favor espera.");
      return;
    }

    const formattedSelectedDate = format(date, "yyyy-MM-dd");
    const existingDailyMenuForDate = menusInView.find(menu =>
      menu.menu_date && menu.menu_date === formattedSelectedDate && !menu.event_type_id
    );

    if (existingDailyMenuForDate) {
      showError(`Ya existe un menú diario para el ${format(date, "PPP", { locale: es })}. Por favor, edita el menú existente.`);
      onEditMenu(existingDailyMenuForDate);
    } else {
      onAddMenu(date);
    }
  };

  const modifiers: DayModifiers = {
    menus: menusInView?.map(menu => menu.menu_date ? parseISO(menu.menu_date) : undefined).filter(Boolean) as Date[],
    today: new Date(),
    selected: selectedDate ? [selectedDate] : [],
  };

  const modifiersClassNames = {
    menus: "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 rounded-full",
    today: "bg-primary text-primary-foreground rounded-full",
    selected: "bg-green-500 text-white dark:bg-green-700 dark:text-white rounded-full",
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <UtensilsCrossed className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600 animate-pulse" />
        <p className="text-xl text-gray-600 dark:text-gray-400">Cargando menús...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        <h1 className="text-2xl font-bold mb-4">Error al cargar menús</h1>
        <p className="text-lg">No se pudieron cargar los menús: {error?.message}</p>
      </div>
    );
  }

  const daysToDisplay = eachDayOfInterval({ start: dateRange.from!, end: dateRange.to! });

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      <Card className="flex-grow shadow-lg dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <CalendarIcon className="mr-2 h-6 w-6" />
            {viewMode === 'week' ? 'Menús de la Semana' : 'Calendario de Menús'}
          </CardTitle>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value: 'week' | 'month') => {
            if (value) setViewMode(value);
            setSelectedDate(undefined); // Limpiar la fecha seleccionada al cambiar de vista
          }} className="w-full md:w-auto justify-end">
            <ToggleGroupItem value="week" aria-label="Vista Semanal" className="h-10 px-3 text-base">
              Semana
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Vista Mensual" className="h-10 px-3 text-base">
              Mes Completo
            </ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>
        <CardContent>
          {viewMode === 'week' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {daysToDisplay.map((day) => {
                const hasMenu = menusInView?.some((menu: Menu) => menu.menu_date && isSameDay(parseISO(menu.menu_date), day));
                const isToday = isSameDay(day, new Date());
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDayClick(day)}
                        className="mt-2 text-sm sm:text-base h-8 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                      >
                        <List className="h-4 w-4 mr-1" />
                        Ver Menús
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddMenuForSelectedDate(day)}
                        className="mt-2 text-sm sm:text-base h-8 px-3 py-1 bg-green-500 hover:bg-green-600 text-white dark:bg-green-700 dark:hover:bg-green-800"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Añadir
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              month={currentMonth}
              onMonthChange={handleMonthChange}
              locale={es}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border shadow"
              components={{
                Day: ({ date }) => {
                  const menusForDay = menusInView?.filter(menu =>
                    menu.menu_date && isSameDay(parseISO(menu.menu_date), date)
                  ) || [];
                  return (
                    <div className="relative h-full w-full">
                      <div className="absolute top-1 left-1 text-xs font-semibold z-10">
                        {format(date, "d")}
                      </div>
                      <CalendarDayCellContent menusForDay={menusForDay} />
                    </div>
                  );
                },
              }}
            />
          )}
          {(!menusInView || menusInView.length === 0) && (
            <div className="text-center py-6 mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <UtensilsCrossed className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                No hay menús registrados para {viewMode === 'week' ? 'esta semana' : 'este mes'}.
              </p>
              <p className="text-md text-gray-600 dark:text-gray-400 mt-2">
                Selecciona una fecha para ver o añadir menús.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDate && (
        <Card className="flex-grow lg:w-1/2 shadow-lg dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Menús para el {format(selectedDate, "PPP", { locale: es })}
            </CardTitle>
            <Button
              onClick={() => handleAddMenuForSelectedDate(selectedDate || new Date())}
              className="px-4 py-2 text-base bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Añadir Menú</span>
            </Button>
          </CardHeader>
          <CardContent>
            <DailyMenuList menus={dailyMenus} onEdit={onEditMenu} />
          </CardContent>
        </Card>
      )}

      <MenuFormSheet
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        editingMenu={editingMenu}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default MenuDynamicCalendarView;