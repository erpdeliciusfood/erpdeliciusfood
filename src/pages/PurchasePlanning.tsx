import { useState } from "react";
import { ShoppingBag, CalendarDays, ChevronDown, PlusCircle } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PurchaseAnalysis from "@/components/purchase-planning/PurchaseAnalysis";
import { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PurchaseRecordForm from "@/components/purchase-planning/PurchaseRecordForm";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UrgentPurchaseAlert from "@/components/purchase-planning/UrgentPurchaseAlert";

const PurchasePlanning = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [isRegisterPurchaseFormOpen, setIsRegisterPurchaseFormOpen] = useState(false);
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<'all' | 'menu_demand' | 'min_stock_level' | 'both' | 'zero_stock_alert'>('all');

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    setPeriodType(period);
    const today = new Date();
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    switch (period) {
      case 'daily':
        fromDate = today;
        toDate = today;
        break;
      case 'weekly':
        fromDate = startOfWeek(today, { locale: es });
        toDate = endOfWeek(today, { locale: es });
        break;
      case 'monthly':
        fromDate = startOfMonth(today);
        toDate = endOfMonth(today);
        break;
      case 'custom':
      default:
        fromDate = dateRange.from || startOfMonth(today);
        toDate = dateRange.to || endOfMonth(today);
        break;
    }
    setDateRange({ from: fromDate, to: toDate });
  };

  const handleRegisterPurchaseFormClose = () => {
    setIsRegisterPurchaseFormOpen(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <PageHeaderWithLogo
        title="Planificación de Compras"
        description="Analiza las necesidades de insumos según tus menús y stock."
        icon={ShoppingBag}
      />

      {/* NEW: Action and Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        {/* Left side: Primary Action Button */}
        <Dialog open={isRegisterPurchaseFormOpen} onOpenChange={setIsRegisterPurchaseFormOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsRegisterPurchaseFormOpen(true)}
              className="px-6 py-3 text-lg md:px-8 md:py-4 md:text-xl bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 ease-in-out shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              Registrar Nueva Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Registrar Nueva Compra
              </DialogTitle>
            </DialogHeader>
            <PurchaseRecordForm
              onSuccess={handleRegisterPurchaseFormClose}
              onCancel={handleRegisterPurchaseFormClose}
            />
          </DialogContent>
        </Dialog>

        {/* Right side: Filters */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-[180px] h-12 text-base">
                {periodType === 'daily' && 'Hoy'}
                {periodType === 'weekly' && 'Esta Semana'}
                {periodType === 'monthly' && 'Este Mes'}
                {periodType === 'custom' && 'Rango Personalizado'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePeriodChange('daily')}>Hoy</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange('weekly')}>Esta Semana</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange('monthly')}>Este Mes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange('custom')}>Rango Personalizado</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {periodType === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[300px] justify-start text-left font-normal h-12 text-base",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                        {format(dateRange.to, "LLL dd, y", { locale: es })}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y", { locale: es })
                    )
                  ) : (
                    <span>Selecciona un rango de fechas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          )}

          <Select onValueChange={(value: 'all' | 'menu_demand' | 'min_stock_level' | 'both' | 'zero_stock_alert') => setSelectedReasonFilter(value)} value={selectedReasonFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-12 text-base">
              <SelectValue placeholder="Filtrar por motivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Motivos</SelectItem>
              <SelectItem value="menu_demand">Demanda de Menú</SelectItem>
              <SelectItem value="min_stock_level">Stock Mínimo</SelectItem>
              <SelectItem value="both">Ambos</SelectItem>
              <SelectItem value="zero_stock_alert">Stock Cero</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <UrgentPurchaseAlert />
      </div>

      <div className="flex-grow">
        {dateRange.from && dateRange.to ? (
          <PurchaseAnalysis startDate={dateRange.from} endDate={dateRange.to} selectedReasonFilter={selectedReasonFilter} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <ShoppingBag className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl">Selecciona un rango de fechas para planificar tus compras.</p>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default PurchasePlanning;