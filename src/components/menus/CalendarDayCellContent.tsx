import React from "react";
import { Menu, MenuPlato } from "@/types";
import { Badge } from "@/components/ui/badge";

interface CalendarDayCellContentProps {
  menusForDay: Menu[];
}

const MEAL_SERVICES_ORDER = ["desayuno", "almuerzo", "cena", "merienda"];
const LUNCH_CATEGORIES_ORDER = ["Plato de Fondo", "Dieta Blanda", "Dieta Saludable"]; // Assuming these are the dish_category values

const CalendarDayCellContent: React.FC<CalendarDayCellContentProps> = ({ menusForDay }) => {
  const hasMenus = menusForDay && menusForDay.length > 0;

  if (!hasMenus) {
    return null; // No render anything if no menus for the day
  }

  // Group menu_platos by meal service and then by dish_category for lunch
  const groupedByMealService: { [key: string]: { [category: string]: MenuPlato[] } | MenuPlato[] } = {};

  menusForDay.forEach(menu => {
    menu.menu_platos?.forEach(mp => {
      const serviceName = mp.meal_services?.name || "Otros";
      const lowerCaseServiceName = serviceName.toLowerCase();

      if (lowerCaseServiceName === "almuerzo") {
        if (!groupedByMealService[serviceName] || !Array.isArray(groupedByMealService[serviceName])) {
          groupedByMealService[serviceName] = {}; // Initialize as an object for categories
        }
        const category = mp.dish_category || "Plato de Fondo"; // Default category if not set
        if (!(groupedByMealService[serviceName] as { [category: string]: MenuPlato[] })[category]) {
          (groupedByMealService[serviceName] as { [category: string]: MenuPlato[] })[category] = [];
        }
        (groupedByMealService[serviceName] as { [category: string]: MenuPlato[] })[category].push(mp);
      } else {
        if (!groupedByMealService[serviceName] || typeof groupedByMealService[serviceName] !== 'object' || !Array.isArray(groupedByMealService[serviceName])) {
          groupedByMealService[serviceName] = []; // Initialize as an array for direct dishes
        }
        (groupedByMealService[serviceName] as MenuPlato[]).push(mp);
      }
    });
  });

  // Sort meal services by predefined order
  const sortedMealServices = Object.keys(groupedByMealService).sort((a, b) => {
    const indexA = MEAL_SERVICES_ORDER.indexOf(a.toLowerCase());
    const indexB = MEAL_SERVICES_ORDER.indexOf(b.toLowerCase());
    if (indexA === -1) return 1; // Unknown services last
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="absolute inset-0 p-1 overflow-hidden text-xs pointer-events-none">
      {sortedMealServices.map(serviceName => (
        <div key={serviceName} className="mb-0.5 last:mb-0">
          <Badge variant="secondary" className="h-auto px-1 py-0.5 text-[0.6rem] font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {serviceName}
          </Badge>
          {serviceName.toLowerCase() === "almuerzo" ? (
            // Render lunch categories
            Object.keys(groupedByMealService[serviceName] as { [category: string]: MenuPlato[] })
              .sort((a, b) => {
                const indexA = LUNCH_CATEGORIES_ORDER.indexOf(a);
                const indexB = LUNCH_CATEGORIES_ORDER.indexOf(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
              })
              .map(category => (
                <div key={category} className="ml-2 mt-0.5">
                  <span className="text-[0.6rem] font-semibold text-gray-600 dark:text-gray-400">{category}:</span>
                  <ul className="list-none p-0 m-0 space-y-0.5 mt-0.5">
                    {(groupedByMealService[serviceName] as { [category: string]: MenuPlato[] })[category].slice(0, 1).map((mp, index) => ( // Show up to 1 dish per category for brevity
                      <li key={index} className="text-[0.6rem] text-gray-700 dark:text-gray-300 leading-tight truncate">
                        • {mp.platos?.nombre || "Plato Desconocido"}
                      </li>
                    ))}
                    {(groupedByMealService[serviceName] as { [category: string]: MenuPlato[] })[category].length > 1 && (
                      <li className="text-[0.6rem] text-gray-500 dark:text-gray-400 leading-tight">
                        ...
                      </li>
                    )}
                  </ul>
                </div>
              ))
          ) : (
            // Render direct dishes for other services
            <ul className="list-none p-0 m-0 space-y-0.5 mt-0.5">
              {(groupedByMealService[serviceName] as MenuPlato[]).slice(0, 2).map((mp, index) => ( // Show up to 2 dishes per service
                <li key={index} className="text-[0.6rem] text-gray-700 dark:text-gray-300 leading-tight truncate">
                  • {mp.platos?.nombre || "Plato Desconocido"}
                </li>
              ))}
              {(groupedByMealService[serviceName] as MenuPlato[]).length > 2 && (
                <li className="text-[0.6rem] text-gray-500 dark:text-gray-400 leading-tight">
                  ...
                </li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default CalendarDayCellContent;