import { useState } from "react";
import { ShoppingBag, CalendarDays, ChevronDown } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PurchaseAnalysis from "@/components/purchase-planning/PurchaseAnalysis";
import { DateRange } from "react-day-picker"; // Import DateRange type

const PurchasePlanning = () => {
  const [dateRange, setDateRange] = useState<DateRange>({ // Use DateRange type here
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');

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
        // Keep current custom range or set a default if none
        fromDate = dateRange.from || startOfMonth(today);
        toDate = dateRange.to || endOfMonth(today);
        break;
    }
    setDateRange({ from: fromDate, to: toDate });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center">
          <ShoppingBag className="mr-4 h-10 w-10 text-primary dark:text-primary-foreground" />
          Planificación de Compras
        </h1>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
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
                    "w-[300px] justify-start text-left font-normal",
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
        </div>
      </div>

      <div className="flex-grow">
        {dateRange.from && dateRange.to ? (
          <PurchaseAnalysis startDate={dateRange.from} endDate={dateRange.to} />
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