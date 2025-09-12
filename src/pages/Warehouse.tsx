import React, { useState } from "react";
import { Loader2, Warehouse, CalendarDays, ChevronDown, PlusCircle } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useMenus } from "@/hooks/useMenus";
import DailyPrepOverview from "@/components/warehouse/DailyPrepOverview";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import StockDashboard from "@/components/warehouse/StockDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // NEW: Import Dialog components
import UrgentPurchaseRequestForm from "@/components/urgent-purchase-requests/UrgentPurchaseRequestForm"; // NEW: Import UrgentPurchaseRequestForm

const WarehousePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isUrgentRequestFormOpen, setIsUrgentRequestFormOpen] = useState(false); // NEW: State for urgent request form

  const formattedSelectedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const { data: menusForSelectedDate, isLoading: isLoadingMenus, isError: isErrorMenus, error: errorMenus } = useMenus(formattedSelectedDate, formattedSelectedDate);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleUrgentRequestFormClose = () => { // NEW: Handler to close the form
    setIsUrgentRequestFormOpen(false);
  };

  if (isLoadingMenus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando menús para el almacén...</p>
      </div>
    );
  }

  if (isErrorMenus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl">No se pudieron cargar los menús: {errorMenus?.message}</p>
      </div>
    );
  }

  const hasMenus = menusForSelectedDate && menusForSelectedDate.length > 0;

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Gestión de Almacén (Preparación Diaria)"
        description="Selecciona una fecha para ver los menús planificados y gestionar la salida de insumos para la preparación diaria."
        icon={Warehouse}
        hideLogo={true}
      />

      <div className="mb-8">
        <StockDashboard />
      </div>

      <div className="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
        {/* NEW: Urgent Purchase Request Button */}
        <Dialog open={isUrgentRequestFormOpen} onOpenChange={setIsUrgentRequestFormOpen}>
          <DialogTrigger asChild>
            <Button
              className="px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Crear Solicitud Urgente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Crear Nueva Solicitud Urgente
              </DialogTitle>
            </DialogHeader>
            <UrgentPurchaseRequestForm
              onSuccess={handleUrgentRequestFormClose}
              onCancel={handleUrgentRequestFormClose}
            />
          </DialogContent>
        </Dialog>

        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal h-12 text-base",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-2 h-5 w-5" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: es })
                ) : (
                  <span>Selecciona una fecha</span>
                )}
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-grow">
        {selectedDate && hasMenus ? (
          <DailyPrepOverview selectedDate={selectedDate} menus={menusForSelectedDate} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <Warehouse className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">
              {selectedDate ? `No hay menús planificados para el ${format(selectedDate, "PPP", { locale: es })}.` : "Selecciona una fecha para empezar."}
            </p>
            {selectedDate && (
              <p className="text-md">Asegúrate de haber creado menús diarios para esta fecha.</p>
            )}
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default WarehousePage;