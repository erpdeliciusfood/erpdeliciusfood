import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import MenuCalendar from "@/components/menus/MenuCalendar";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Menu } from "@/types";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";

const QuebradoCalendar = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Por ahora, este calendario mostrará todos los menús.
  // Necesitaremos definir qué significa "QUEBRADO" para filtrar o resaltar menús específicos.

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

  // El componente MenuCalendar ya maneja su propio estado de carga y error.

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Calendario de Menús Quebrados"
        description="Visualiza los menús con estado 'QUEBRADO' o que requieren atención especial."
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
        />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default QuebradoCalendar;