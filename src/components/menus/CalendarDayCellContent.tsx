import React from "react";
import { Menu, MenuPlato } from "@/types";
import { Badge } from "@/components/ui/badge";

interface CalendarDayCellContentProps {
  menusForDay: Menu[];
}

const MEAL_SERVICES_ORDER = ["desayuno", "almuerzo", "cena", "merienda"];

const CalendarDayCellContent: React.FC<CalendarDayCellContentProps> = ({ menusForDay }) => {
  const hasMenus = menusForDay && menusForDay.length > 0;

  if (!hasMenus) {
    return null; // No render anything if no menus for the day
  }

  // Group menu_platos by meal service for display
  const groupedByMealService: { [key: string]: MenuPlato[] } = {};
  menusForDay.forEach(menu => {
    menu.menu_platos?.forEach(mp => {
      const serviceName = mp.meal_services?.name || "Otros";
      if (!groupedByMealService[serviceName]) {
        groupedByMealService[serviceName] = [];
      }
      groupedByMealService[serviceName].push(mp);
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
          <ul className="list-none p-0 m-0 space-y-0.5 mt-0.5">
            {groupedByMealService[serviceName].slice(0, 2).map((mp, index) => ( // Show up to 2 dishes per service
              <li key={index} className="text-[0.6rem] text-gray-700 dark:text-gray-300 leading-tight truncate">
                • {mp.platos?.nombre || "Plato Desconocido"}
              </li>
            ))}
            {groupedByMealService[serviceName].length > 2 && (
              <li className="text-[0.6rem] text-gray-500 dark:text-gray-400 leading-tight">
                ...
              </li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default CalendarDayCellContent;