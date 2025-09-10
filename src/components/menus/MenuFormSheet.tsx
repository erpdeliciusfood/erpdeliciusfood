import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import MenuForm from "./MenuForm";
import { Menu } from "@/types";

interface MenuFormSheetProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingMenu: Menu | null;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
}

const MenuFormSheet: React.FC<MenuFormSheetProps> = ({
  isFormOpen,
  setIsFormOpen,
  editingMenu,
  selectedDate,
  setSelectedDate,
}) => {
  return (
    <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
      <SheetContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-3xl p-6 max-h-screen overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {editingMenu ? "Editar Menú" : "Crear Nuevo Menú"}
          </SheetTitle>
        </SheetHeader>
        <MenuForm
          initialData={editingMenu}
          onSuccess={() => {
            setIsFormOpen(false);
            // No se limpia selectedDate aquí para mantener la selección en el calendario
          }}
          onCancel={() => {
            setIsFormOpen(false);
            // No se limpia selectedDate aquí para mantener la selección en el calendario
          }}
          preselectedDate={selectedDate} // Pass selectedDate to MenuForm
        />
      </SheetContent>
    </Sheet>
  );
};

export default MenuFormSheet;