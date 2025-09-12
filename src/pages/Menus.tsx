import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, BookText, AlertTriangle } from "lucide-react"; // Added AlertTriangle icon
import { useMenus } from "@/hooks/useMenus";
import MenuCalendar from "@/components/menus/MenuCalendar";
import WeeklyMenuOverview from "@/components/menus/WeeklyMenuOverview";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Menu } from "@/types";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import { Link } from "react-router-dom"; // Import Link for navigation

const Menus = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { isLoading, isError, error } = useMenus();

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando menús...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los menús: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Gestión de Menús"
        description="Planifica y organiza tus menús diarios y para eventos especiales. Selecciona una fecha en el calendario para ver o añadir menús."
        icon={BookText}
      />

      <div className="flex justify-end items-center mb-6 gap-4">
        <Link to="/menus/quebrado-calendar">
          <Button
            className="px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl"
          >
            <AlertTriangle className="mr-3 h-6 w-6" />
            QUEBRADO
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <WeeklyMenuOverview onAddMenu={handleAddMenu} />
      </div>

      <div className="flex-grow">
        <MenuCalendar
          onAddMenu={handleAddMenu}
          onEditMenu={handleEditMenu}
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
          editingMenu={editingMenu}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Menus;