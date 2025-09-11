"use client";

import React, { useState, useMemo } from "react";
import { Loader2, ClipboardList, CalendarDays, ChevronDown, UtensilsCrossed } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import { useMenusList } from "@/hooks/menus/useMenusList";
import { DailyMenuBreakdown, Menu } from "@/types";
import MenuBreakdownList from "@/components/menu-breakdown/MenuBreakdownList";

const MenuBreakdown: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');

  const formattedStartDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const formattedEndDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const { data: menus, isLoading, isError, error } = useMenusList(formattedStartDate, formattedEndDate);

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

  const aggregatedMenuBreakdown = useMemo(() => {
    if (!menus || menus.length === 0) return [];

    const breakdownMap = new Map<string, DailyMenuBreakdown>();

    menus.forEach((menu: Menu) => {
      const dateKey = menu.date;

      if (!dateKey) return;

      if (!breakdownMap.has(dateKey)) {
        breakdownMap.set(dateKey, {
          date: dateKey,
          mealServicesBreakdown: [],
        });
      }
      const dailyBreakdown = breakdownMap.get(dateKey)!;

      menu.menu_platos.forEach(menuPlato => {
        if (!menuPlato.meal_service) return;

        let mealServiceEntry = dailyBreakdown.mealServicesBreakdown.find(
          (ms) => ms.serviceId === menuPlato.meal_service!.id
        );

        if (!mealServiceEntry) {
          mealServiceEntry = {
            serviceId: menuPlato.meal_service.id,
            serviceName: menuPlato.meal_service.name,
            // serviceOrderIndex: menuPlato.meal_service.order_index, // Removed
            categories: [],
          };
          dailyBreakdown.mealServicesBreakdown.push(mealServiceEntry);
        }

        let dishCategoryEntry = mealServiceEntry.categories.find(
          (dc) => dc.categoryName === menuPlato.dish_category
        );

        if (!dishCategoryEntry) {
          dishCategoryEntry = {
            categoryName: menuPlato.dish_category,
            dishes: [],
          };
          mealServiceEntry.categories.push(dishCategoryEntry);
        }

        dishCategoryEntry.dishes.push({
          platoId: menuPlato.receta.id, // Changed recetaId to platoId
          recetaNombre: menuPlato.receta.nombre,
          quantityNeeded: menuPlato.quantity_needed,
        });
      });
    });

    const sortedBreakdown: DailyMenuBreakdown[] = Array.from(breakdownMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    sortedBreakdown.forEach(daily => {
      // Sort by serviceName alphabetically since order_index is removed
      daily.mealServicesBreakdown.sort((a, b) => a.serviceName.localeCompare(b.serviceName));
      daily.mealServicesBreakdown.forEach(service => {
        service.categories.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
        service.categories.forEach(category => {
          category.dishes.sort((a, b) => a.recetaNombre.localeCompare(b.recetaNombre));
        });
      });
    });

    return sortedBreakdown;
  }, [menus]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary dark:text-primary-foreground" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Cargando quebrado de menús...</p>
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
        title="Quebrado de Menús"
        description="Visualiza la planificación detallada de tus menús por período."
        icon={ClipboardList}
      />

      <div className="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
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
      </div>

      <div className="flex-grow">
        {aggregatedMenuBreakdown.length > 0 ? (
          <MenuBreakdownList breakdown={aggregatedMenuBreakdown} />
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <UtensilsCrossed className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-xl mb-4">No hay menús planificados para el período seleccionado.</p>
            <p className="text-md">Ajusta el rango de fechas o planifica nuevos menús.</p>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default MenuBreakdown;