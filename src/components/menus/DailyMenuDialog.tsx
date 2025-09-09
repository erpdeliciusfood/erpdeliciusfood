import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DailyMenuList from "./DailyMenuList";
import { Menu } from "@/types";

interface DailyMenuDialogProps {
  selectedDate: Date | undefined;
  dailyMenus: Menu[];
  isDailyMenuDialogOpen: boolean;
  setIsDailyMenuDialogOpen: (open: boolean) => void;
  onAddMenu: (date: Date) => void;
  onEditMenu: (menu: Menu) => void;
}

const DailyMenuDialog: React.FC<DailyMenuDialogProps> = ({
  selectedDate,
  dailyMenus,
  isDailyMenuDialogOpen,
  setIsDailyMenuDialogOpen,
  onAddMenu,
  onEditMenu,
}) => {
  return (
    <Dialog open={isDailyMenuDialogOpen} onOpenChange={setIsDailyMenuDialogOpen}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Menús para el {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "día seleccionado"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button
            onClick={() => {
              if (selectedDate) {
                onAddMenu(selectedDate);
                setIsDailyMenuDialogOpen(false); // Close daily menu list dialog
              }
            }}
            className="w-full px-6 py-3 text-lg bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-primary transition-colors duration-200 ease-in-out"
            disabled={!selectedDate}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Añadir Menú para este día
          </Button>
          <DailyMenuList menus={dailyMenus} onEdit={(menu) => {
            onEditMenu(menu);
            setIsDailyMenuDialogOpen(false); // Close daily menu list dialog
          }} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyMenuDialog;