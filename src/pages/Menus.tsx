import { useState } from "react";
import { Loader2, BookText } from "lucide-react"; // Added BookText icon
import { useMenus } from "@/hooks/useMenus";
import MenuCalendar from "@/components/menus/MenuCalendar";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Menu } from "@/types";

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center">
          <BookText className="mr-4 h-10 w-10 text-primary dark:text-primary-foreground" />
          Gestión de Menús
        </h1>
      </div>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        Planifica y organiza tus menús diarios y para eventos especiales. Selecciona una fecha en el calendario para ver o añadir menús.
      </p>

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