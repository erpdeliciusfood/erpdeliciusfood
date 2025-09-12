import { useState } from "react";
import { Loader2, BookText } from "lucide-react";
import MenuDynamicCalendarView from "@/components/menus/MenuDynamicCalendarView"; // NEW: Import the new component
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Menu } from "@/types";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";

const Menus = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // La lógica de carga inicial de la página se puede simplificar,
  // ya que MenuDynamicCalendarView gestionará su propia carga de datos y estados.
  // Si necesitas un indicador de carga global para la página antes de que el componente hijo se inicialice,
  // podrías mantener un `useMenus` aquí, pero para esta mejora, lo omitiremos para simplificar.

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

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Gestión de Menús"
        description="Planifica y organiza tus menús diarios y para eventos especiales. Alterna entre la vista semanal y mensual."
        icon={BookText}
      />

      {/* El nuevo componente dinámico reemplaza tanto WeeklyMenuOverview como MenuCalendar */}
      <div className="flex-grow">
        <MenuDynamicCalendarView
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