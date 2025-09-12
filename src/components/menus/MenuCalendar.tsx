import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, isSameDay, parse } from "date-fns"; // MODIFICADO: Importar 'parse'
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, PlusCircle, UtensilsCrossed, Loader2 } from "lucide-react"; // Importar Loader2 para el estado de carga
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMenus } from "@/hooks/useMenus";
import { Menu } from "@/types";
import { DayModifiers } from "react-day-picker";
import DailyMenuList from "./DailyMenuList";
import MenuFormSheet from "./MenuFormSheet";
import { showError } from "@/utils/toast";
import CalendarDayCellContent from "./CalendarDayCellContent"; // MODIFICADO: Importar CalendarDayCellContent

interface MenuCalendarProps {
  onAddMenu: (date: Date) => void;
  onEditMenu: (menu: Menu) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingMenu: Menu | null;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
}

const MenuCalendar: React.FC<MenuCalendarProps> = ({
  onAddMenu,
  onEditMenu,
  isFormOpen,
  setIsFormOpen,
  editingMenu,
  selectedDate,
  setSelectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailyMenus, setDailyMenus] = useState<Menu[]>([]);
  // Removed isDailyMenuDialogOpen state as it's no longer needed

  const formattedMonthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const formattedMonthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { data: menusInMonth, isLoading, isError, error } = useMenus(formattedMonthStart, formattedMonthEnd);

  useEffect(() => {
    if (selectedDate && menusInMonth) {
      const menusForSelectedDay = menusInMonth.filter(menu =>
        menu.menu_date && isSameDay(parseISO(menu.menu_date), selectedDate)
      );
      setDailyMenus(menusForSelectedDay);
    } else {
      setDailyMenus([]);
    }
  }, [selectedDate, menusInMonth]);

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date);
    // No need to open a dialog, the list will appear if selectedDate is set
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    setSelectedDate(undefined); // Clear selected date when month changes
  };

  // NEW: Function to handle adding a menu, checking for existing daily menus
  const handleAddMenuForSelectedDate = (date: Date) => {
    if (!menusInMonth) {
      showError("Cargando menús, por favor espera.");
      return;
    }

    // Format the selected date to a YYYY-MM-DD string for consistent comparison
    const formattedSelectedDate = format(date, "yyyy-MM-dd");

    const existingDailyMenuForDate = menusInMonth.find(menu =>
      menu.menu_date && menu.menu_date === formattedSelectedDate && !menu.event_type_id // Compare strings directly
    );

    if (existingDailyMenuForDate) {
      showError(`Ya existe un menú diario para el ${format(date, "PPP", { locale: es })}. Por favor, edita el menú existente.`);
      onEditMenu(existingDailyMenuForDate); // Open form to edit the existing daily menu
    } else {
      onAddMenu(date); // Proceed to add new menu
    }
  };

  const modifiers: DayModifiers = {
    menus: menusInMonth?.map(menu => menu.menu_date ? parseISO(menu.menu_date) : undefined).filter(Boolean) as Date[],
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
        <p className="text-xl text-gray-600 dark:text-gray-400">Cargando calendario de menús...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        <h1 className="text-2xl font-bold mb-4">Error al cargar menús</h1>
        <p className="text-lg">No se pudieron cargar los menús para el calendario: {error?.message}</p>
      </div>
    );
  }

  const hasMenusInMonth = menusInMonth && menusInMonth.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      <Card className="flex-grow shadow-lg dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <CalendarIcon className="mr-2 h-6 w-6" />
            Calendario de Menús
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                const menusForDay = menusInMonth?.filter(menu =>
                  menu.menu_date && isSameDay(parse(menu.menu_date, 'yyyy-MM-dd', new Date()), date) // MODIFICADO: Usar parse
                ) || [];
                const isSelectedDay = selectedDate && isSameDay(date, selectedDate);
                return (
                  <div className="relative h-full w-full">
                    <div className="absolute top-1 left-1 text-xs font-semibold z-10">
                      {format(date, "d")}
                    </div>
                    <CalendarDayCellContent menusForDay={menusForDay} isSelected={isSelectedDay} />
                  </div>
                );
              },
            }}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <span className="h-4 w-4 rounded-full bg-blue-200 dark:bg-blue-800 mr-2 border border-blue-300 dark:border-blue-700"></span>
              Días con Menús
            </div>
            <div className="flex items-center">
              <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground mr-2 border border-primary dark:border-primary-foreground"></span>
              Hoy
            </div>
            <div className="flex items-center">
              <span className="h-4 w-4 rounded-full bg-green-500 dark:bg-green-700 mr-2 border border-green-600 dark:border-green-800"></span>
              Día Seleccionado
            </div>
          </div>
          {!hasMenusInMonth && (
            <div className="text-center py-6 mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <UtensilsCrossed className="mx-auto h-12 w-12 mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                No hay menús registrados para este mes.
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
              onClick={() => handleAddMenuForSelectedDate(selectedDate || new Date())} // Use the new handler
              className="px-4 py-2 text-base bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Menú
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

export default MenuCalendar;