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

  // Group menu_platos by meal service and then by dish_category for lunch
  const groupedByMealService: { [key: string]: { [category: string]: MenuPlato[] } | MenuPlato[] } = {};

  if (hasMenus) {
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
  }

  return (
    <div className="absolute inset-0 p-1 overflow-hidden text-xs pointer-events-none">
      {MEAL_SERVICES_ORDER.map(expectedServiceName => {
        const lowerCaseExpectedServiceName = expectedServiceName.toLowerCase();
        const serviceData = groupedByMealService[expectedServiceName]; // This might be undefined or an object/array

        return (
          <div key={expectedServiceName} className="mb-0.5 last:mb-0">
            <Badge
              variant="secondary"
              className={`h-auto px-1 py-0.5 text-[0.6rem] font-medium capitalize ${serviceData ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
            >
              {expectedServiceName}
            </Badge>
            {serviceData ? (
              lowerCaseExpectedServiceName === "almuerzo" ? (
                // Handle lunch categories
                LUNCH_CATEGORIES_ORDER.map(expectedLunchCategory => {
                  const lunchCategoryData = (serviceData as { [category: string]: MenuPlato[] })[expectedLunchCategory];
                  return (
                    <div key={expectedLunchCategory} className="ml-2 mt-0.5">
                      <span className={`text-[0.6rem] font-semibold ${lunchCategoryData && lunchCategoryData.length > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
                        {expectedLunchCategory}:
                      </span>
                      <ul className="list-none p-0 m-0 space-y-0.5 mt-0.5">
                        {lunchCategoryData && lunchCategoryData.length > 0 ? (
                          lunchCategoryData.slice(0, 1).map((mp, index) => (
                            <li key={index} className="text-[0.6rem] text-gray-700 dark:text-gray-300 leading-tight truncate">
                              • {mp.platos?.nombre || "Plato Desconocido"}
                            </li>
                          ))
                        ) : (
                          <li className="text-[0.6rem] text-gray-500 dark:text-gray-500 leading-tight italic">
                            (Falta)
                          </li>
                        )}
                        {lunchCategoryData && lunchCategoryData.length > 1 && (
                          <li className="text-[0.6rem] text-gray-500 dark:text-gray-400 leading-tight">
                            ...
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })
              ) : (
                // Handle other services (non-lunch)
                <ul className="list-none p-0 m-0 space-y-0.5 mt-0.5">
                  {(serviceData as MenuPlato[]).slice(0, 2).map((mp, index) => (
                    <li key={index} className="text-[0.6rem] text-gray-700 dark:text-gray-300 leading-tight truncate">
                      • {mp.platos?.nombre || "Plato Desconocido"}
                    </li>
                  ))}
                  {(serviceData as MenuPlato[]).length > 2 && (
                    <li className="text-[0.6rem] text-gray-500 dark:text-gray-400 leading-tight">
                      ...
                    </li>
                  )}
                </ul>
              )
            ) : (
              <ul className="list-none p-0 m-0 space-y-0.5 mt-0.5">
                <li className="text-[0.6rem] text-gray-500 dark:text-gray-500 leading-tight italic">
                  (Falta diseño)
                </li>
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarDayCellContent;