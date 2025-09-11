"use client";

import React, { useState, useMemo } from "react";
import { Loader2, ClipboardList, CalendarDays, ChevronDown, UtensilsCrossed, Utensils, Soup, Cake, Coffee, Milk, Salad, Fish, Beef, Wheat, Apple } from "lucide-react"; // Removed Wine, PlusCircle
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns"; // Removed isSameDay
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";
import PageHeaderWithLogo from "@/components/layout/PageHeaderWithLogo";
import { useMenus } from "@/hooks/useMenus";
import { DailyMenuBreakdown, MealServiceBreakdown, DishCategoryBreakdown, DishDetail, Menu } from "@/types"; // Import new types
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// Define the order of meal services for consistent display
const MEAL_SERVICES_ORDER = ["desayuno", "almuerzo", "cena", "merienda", "otro"];

// Define icons for dish categories (can be expanded)
const DISH_CATEGORY_ICONS: { [key: string]: React.ElementType } = {
  "Desayuno / Merienda": Coffee,
  "Entrada": Salad,
  "Sopa / Crema": Soup,
  "Ensalada Fría": Salad,
  "Ensalada Caliente": Salad,
  "Plato de Fondo - Carnes": Beef,
  "Plato de Fondo - Aves": Utensils, // Generic for poultry
  "Plato de Fondo - Pescados y Mariscos": Fish,
  "Plato de Fondo - Pastas y Arroces": Wheat,
  "Plato de Fondo - Vegetariano / Vegano": Apple, // Generic for vegetarian
  "Acompañamiento / Guarnición": Utensils,
  "Postre": Cake,
  "Bebida": Milk,
  "Dieta Blanda": Utensils,
  "Otra Opción": Utensils,
  "Sin Categoría": UtensilsCrossed,
};

const MenuBreakdown: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');

  const formattedStartDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const formattedEndDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

  const { data: menus, isLoading, isError, error } = useMenus(formattedStartDate, formattedEndDate);

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

  const aggregatedBreakdown: DailyMenuBreakdown[] = useMemo(() => {
    if (!menus || !dateRange.from || !dateRange.to) return [];

    const dailyBreakdownMap = new Map<string, DailyMenuBreakdown>();
    const daysInPeriod = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

    // Initialize map with all days in the period
    daysInPeriod.forEach(day => {
      const formattedDay = format(day, "yyyy-MM-dd");
      dailyBreakdownMap.set(formattedDay, {
        date: formattedDay,
        menusForDay: [],
        mealServicesBreakdown: [],
      });
    });

    menus.forEach(menu => {
      // Only consider menus with a specific date for daily breakdown
      if (menu.menu_date) {
        const menuDate = parseISO(menu.menu_date);
        const formattedMenuDate = format(menuDate, "yyyy-MM-dd");

        if (dailyBreakdownMap.has(formattedMenuDate)) {
          const currentDailyBreakdown = dailyBreakdownMap.get(formattedMenuDate)!;
          currentDailyBreakdown.menusForDay.push(menu);

          const mealServiceMap = new Map<string, MealServiceBreakdown>();

          menu.menu_platos?.forEach(menuPlato => {
            const serviceName = menuPlato.meal_services?.name || "Otro";
            const serviceId = menuPlato.meal_service_id;
            const dishCategory = menuPlato.dish_category || "Sin Categoría";
            const platoNombre = menuPlato.platos?.nombre || "Plato Desconocido";
            const quantityNeeded = menuPlato.quantity_needed;

            if (!mealServiceMap.has(serviceId)) {
              mealServiceMap.set(serviceId, {
                serviceId,
                serviceName,
                categories: [],
              });
            }
            const currentMealService = mealServiceMap.get(serviceId)!;

            let categoryBreakdown = currentMealService.categories.find(
              cat => cat.categoryName === dishCategory
            );

            if (!categoryBreakdown) {
              categoryBreakdown = {
                categoryName: dishCategory,
                dishes: [],
              };
              currentMealService.categories.push(categoryBreakdown);
            }

            categoryBreakdown.dishes.push({
              platoId: menuPlato.plato_id,
              platoNombre,
              quantityNeeded,
            });
          });

          // Sort meal services and categories
          const sortedMealServices = Array.from(mealServiceMap.values()).sort((a, b) => {
            const indexA = MEAL_SERVICES_ORDER.indexOf(a.serviceName.toLowerCase());
            const indexB = MEAL_SERVICES_ORDER.indexOf(b.serviceName.toLowerCase());
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });

          sortedMealServices.forEach(ms => {
            ms.categories.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
            ms.categories.forEach(cat => {
              cat.dishes.sort((a, b) => a.platoNombre.localeCompare(b.platoNombre));
            });
          });

          currentDailyBreakdown.mealServicesBreakdown = sortedMealServices;
          dailyBreakdownMap.set(formattedMenuDate, currentDailyBreakdown);
        }
      }
    });

    return Array.from(dailyBreakdownMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [menus, dateRange.from, dateRange.to]);

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

  const displayStartDate = dateRange.from ? format(dateRange.from, "PPP", { locale: es }) : "N/A";
  const displayEndDate = dateRange.to ? format(dateRange.to, "PPP", { locale: es }) : "N/A";

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
        {dateRange.from && dateRange.to && aggregatedBreakdown.length > 0 ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Desglose de Menús para el período: {displayStartDate} - {displayEndDate}
            </h2>
            {aggregatedBreakdown.map((dailyData) => (
              <Card key={dailyData.date} className="shadow-lg dark:bg-gray-800">
                <CardHeader className="bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <CalendarDays className="mr-2 h-6 w-6" />
                    {format(parseISO(dailyData.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                    {dailyData.menusForDay.length > 0 && (
                      <Badge variant="secondary" className="ml-3 text-base px-3 py-1">
                        {dailyData.menusForDay.length} Menú(s)
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {dailyData.mealServicesBreakdown.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                      {dailyData.mealServicesBreakdown.map((serviceBreakdown) => (
                        <AccordionItem key={serviceBreakdown.serviceId} value={serviceBreakdown.serviceId}>
                          <AccordionTrigger className="text-lg font-semibold text-gray-800 dark:text-gray-200 hover:no-underline">
                            {serviceBreakdown.serviceName}
                          </AccordionTrigger>
                          <AccordionContent className="pl-4">
                            {serviceBreakdown.categories.length > 0 ? (
                              <div className="space-y-3">
                                {serviceBreakdown.categories.map((categoryBreakdown) => {
                                  const IconComponent = DISH_CATEGORY_ICONS[categoryBreakdown.categoryName] || Utensils;
                                  return (
                                    <div key={categoryBreakdown.categoryName} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                                      <h4 className="text-md font-bold text-gray-700 dark:text-gray-300 flex items-center">
                                        <IconComponent className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        {categoryBreakdown.categoryName}
                                      </h4>
                                      <ul className="list-disc pl-6 mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                                        {categoryBreakdown.dishes.map((dish, idx) => (
                                          <li key={idx} className="text-base">
                                            {dish.platoNombre} (Cantidad: {dish.quantityNeeded})
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-600 dark:text-gray-400">No hay platos definidos para este servicio.</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-center py-4 text-gray-600 dark:text-gray-400">No hay servicios de comida planificados para este día.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <ClipboardList className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
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