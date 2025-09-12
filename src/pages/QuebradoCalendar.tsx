import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import MenuCalendar from "@/components/menus/MenuCalendar";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Menu } from "@/types";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import QuebradoDayCellContent from "@/components/menus/QuebradoDayCellContent"; // NEW: Import QuebradoDayCellContent
import { useMealServices } from "@/hooks/useMealServices"; // NEW: Import useMealServices

const QuebradoCalendar = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // NEW: Fetch all available meal services
  const { data: availableMealServices, isLoading: isLoadingMealServices, isError: isErrorMealServices, error: errorMealServices } = useMealServices();

  const handleAddMenu = (date: Date) => {
    setEditingMenu(null);
    setSelectedDate(date);
    setIsFormOpen(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setSelectedDate(menu.menu_date ? new Date(menu.menu_date) : undefined);
    setIsFormOpen(true);
  };

  if (isLoadingMealServices) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando servicios de comida...</p>
      </div>
    );
  }

  if (isErrorMealServices) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className className="text-xl">No se pudieron cargar los servicios de comida: {errorMealServices?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Calendario de Configuración de Menús"
        description="Revisa la configuración diaria de tus servicios de comida (Desayuno, Almuerzo, Cena, Merienda)."
        icon={AlertTriangle}
      />

      <div className="flex-grow">
        <MenuCalendar
          onAddMenu={handleAddMenu}
          onEditMenu={handleEditMenu}
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
          editingMenu={editingMenu}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          DayComponent={QuebradoDayCellContent} {/* NEW: Pass custom DayComponent */}
          dayComponentProps={{ availableMealServices: availableMealServices || [] }} {/* NEW: Pass props to DayComponent */}
        />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default QuebradoCalendar;