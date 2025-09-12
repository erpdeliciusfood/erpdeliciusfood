import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, PlusCircle, UtensilsCrossed } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMenus } from "@/hooks/useMenus";
import { Menu } from "@/types";
import { DayModifiers, DayProps } from "react-day-picker";
import DailyMenuList from "./DailyMenuList";
import MenuFormSheet from "./MenuFormSheet";
import { showError } from "@/utils/toast";
import CalendarDayCellContent from "./CalendarDayCellContent"; // Default DayComponent

// NEW: Define props interface for the custom DayComponent
interface DayComponentProps {
  date: Date;
  menusForDay: Menu[];
  [key: string]: any; // Allow arbitrary props to be passed
}

interface MenuCalendarProps {
  onAddMenu: (date: Date) => void;
  onEditMenu: (menu: Menu) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingMenu: Menu | null;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  DayComponent?: React.ComponentType<DayComponentProps>; // NEW: Optional custom DayComponent
  dayComponentProps?: Record<string, any>; // NEW: Props to pass to the custom DayComponent
}

const MenuCalendar: React.FC<MenuCalendarProps> = ({
  onAddMenu,
  onEditMenu,
  isFormOpen,
  setIsFormOpen,
  editingMenu,
  selectedDate,
  setSelectedDate,
  DayComponent = CalendarDayCellContent, // Default to existing content
  dayComponentProps = {}, // Default to empty object
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailyMenus, setDailyMenus] = useState<Menu[]>([]);

  const formattedMonthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const formattedMonthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { data: menusInMonth, isLoading, isError, error } = useMenus(formattedMonthStart, formattedMonthEnd);

  useEffect(() => {
    if (selectedDate && menusInMonth) {
      const menusForSelectedDay = menusInMonth.filter(menu =>
        menu.menu_date && isSameDay(new Date(menu.menu_date), selectedDate)
      );
      setDailyMenus(menusForSelectedDay);
    } else {
      setDailyMenus([]);
    }
  }, [selectedDate, menusInMonth]);

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    setSelectedDate(undefined);
  };

  const handleAddMenuForSelectedDate = (date: Date) => {
    if (!menusInMonth) {
      showError("Cargando menús, por favor espera.");
      return;
    }

    const formattedSelectedDate = format(date, "yyyy-MM-dd");

    const existingDailyMenuForDate = menusInMonth.find(menu =>
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
    menus: menusInMonth?.map(menu => menu.menu_date ? new Date(menu.menu_date) : undefined).filter(Boolean) as Date[],
    today: new Date(),
    selected: selectedDate ? [selectedDate] : [],
  };

  const modifiersClassNames = {
    menus: "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 rounded-full",
    today: "bg-primary text-primary-foreground rounded-full",
    selected: "bg-green-500 text-white dark:bg-green-700 dark:text-white rounded-full",
  };

  // Custom Day component to render content inside cells
  const CustomDay = (props: DayProps) => {
    const dayDate = props.date;
    const menusForThisDay = menusInMonth?.filter(menu =>
      menu.menu_date && isSameDay(new Date(menu.menu_date), dayDate)
    ) || [];

    return (
      <div className="relative h-full w-full">
        <div className={props.wrapperProps.className}>
          {props.wrapperProps.children}
        </div>
        {/* Render the passed DayComponent with its specific props */}
        <DayComponent date={dayDate} menusForDay={menusForThisDay} {...dayComponentProps} />
      </div>
    );
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
            components={{ Day: CustomDay }}
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
              onClick={() => handleAddMenuForSelectedDate(selectedDate || new Date())}
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