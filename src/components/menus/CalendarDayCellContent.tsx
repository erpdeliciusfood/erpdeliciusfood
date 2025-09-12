import React from "react";
import { Menu, MenuPlato } from "@/types";
import { Badge } from "@/components/ui/badge";
import { XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components

interface CalendarDayCellContentProps {
  menusForDay: Menu[];
}

const MEAL_SERVICES_ORDER = ["desayuno", "almuerzo", "cena", "merienda"];
const LUNCH_CATEGORIES_ORDER = ["Plato de Fondo", "Dieta Blanda", "Dieta Saludable"];

const CalendarDayCellContent: React.FC<CalendarDayCellContentProps> = ({ menusForDay }) => {
  const hasMenus = menusForDay && menusForDay.length > 0;

  const groupedByMealService: { [key: string]: { [category: string]: MenuPlato[] } | MenuPlato[] } = {};

  if (hasMenus) {
    menusForDay.forEach(menu => {
      menu.menu_platos?.forEach(mp => {
        const serviceName = mp.meal_services?.name || "Otros";
        const lowerCaseServiceName = serviceName.toLowerCase();

        if (lowerCaseServiceName === "almuerzo") {
          if (!groupedByMealService[serviceName] || !Array.isArray(groupedByMealService[serviceName])) {
            groupedByMealService[serviceName] = {};
          }
          const category = mp.dish_category || "Plato de Fondo";
          if (!(groupedByMealService[serviceName] as { [category: string]: MenuPlato[] })[category]) {
            (groupedByMealService[serviceName] as { [category: string]: MenuPlato[] })[category] = [];
          }
          (groupedByMealService[serviceName] as { [category: string]: MenuPlato[] })[category].push(mp);
        } else {
          if (!groupedByMealService[serviceName] || typeof groupedByMealService[serviceName] !== 'object' || !Array.isArray(groupedByMealService[serviceName])) {
            groupedByMealService[serviceName] = [];
          }
          (groupedByMealService[serviceName] as MenuPlato[]).push(mp);
        }
      });
    });
  }

  // Calculate isDayComplete before rendering
  let isDayComplete = true;
  for (const expectedServiceName of MEAL_SERVICES_ORDER) {
    const lowerCaseExpectedServiceName = expectedServiceName.toLowerCase();
    const serviceData = groupedByMealService[expectedServiceName];

    if (!serviceData) {
      isDayComplete = false;
      break; // No need to check further if a service is missing
    }

    if (lowerCaseExpectedServiceName === "almuerzo") {
      for (const expectedLunchCategory of LUNCH_CATEGORIES_ORDER) {
        const lunchCategoryData = (serviceData as { [category: string]: MenuPlato[] })[expectedLunchCategory];
        if (!lunchCategoryData || lunchCategoryData.length === 0) {
          isDayComplete = false;
          break; // No need to check further if a lunch category is missing
        }
      }
    } else {
      if (Array.isArray(serviceData) && serviceData.length === 0) {
        isDayComplete = false;
        break; // No need to check further if a non-lunch service is empty
      }
    }
    if (!isDayComplete) break; // Break outer loop if already incomplete
  }

  return (
    <div className="absolute inset-0 p-1 overflow-hidden text-xs pointer-events-none">
      {/* Completeness Indicator with Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`absolute top-1 right-1 h-2 w-2 rounded-full ${isDayComplete ? 'bg-green-500' : 'bg-red-500'}`} />
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            {isDayComplete ? "Menú del día completo" : "Menú del día incompleto"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {MEAL_SERVICES_ORDER.map(expectedServiceName => {
        const lowerCaseExpectedServiceName = expectedServiceName.toLowerCase();
        const serviceData = groupedByMealService[expectedServiceName];

        return (
          <div key={expectedServiceName} className="mb-0.5 last:mb-0">
            <Badge
              variant="secondary"
              className={`h-auto px-1 py-0.5 text-[0.6rem] font-medium capitalize ${serviceData ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
            >
              {expectedServiceName}
            </Badge>
            {lowerCaseExpectedServiceName === "almuerzo" ? (
              // Handle lunch categories
              LUNCH_CATEGORIES_ORDER.map(expectedLunchCategory => {
                const lunchCategoryData = serviceData && !Array.isArray(serviceData) ? (serviceData as { [category: string]: MenuPlato[] })[expectedLunchCategory] : undefined;
                const hasLunchCategoryDishes = lunchCategoryData && lunchCategoryData.length > 0;

                return (
                  <div key={expectedLunchCategory} className="ml-2 mt-0.5">
                    <span className={`text-[0.6rem] font-semibold ${hasLunchCategoryDishes ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
                      {expectedLunchCategory}:
                    </span>
                    <ul className="list-none p-0 m-0 space-y-0.5 mt-0.5">
                      {hasLunchCategoryDishes ? (
                        lunchCategoryData.slice(0, 1).map((mp, index) => (
                          <li key={index} className="text-[0.6rem] text-gray-700 dark:text-gray-300 leading-tight truncate">
                            • {mp.platos?.nombre || "Plato Desconocido"}
                          </li>
                        ))
                      ) : (
                        <li className="text-[0.6rem] text-gray-500 dark:text-gray-500 leading-tight italic flex items-center">
                          <XCircle className="h-2.5 w-2.5 mr-1 text-red-500" /> (Falta)
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
                {serviceData && Array.isArray(serviceData) && serviceData.length > 0 ? (
                  (serviceData as MenuPlato[]).slice(0, 2).map((mp, index) => (
                    <li key={index} className="text-[0.6rem] text-gray-700 dark:text-gray-300 leading-tight truncate">
                      • {mp.platos?.nombre || "Plato Desconocido"}
                    </li>
                  ))
                ) : (
                  <li className="text-[0.6rem] text-gray-500 dark:text-gray-500 leading-tight italic flex items-center">
                    <XCircle className="h-2.5 w-2.5 mr-1 text-red-500" /> (Falta diseño)
                  </li>
                )}
                {serviceData && Array.isArray(serviceData) && (serviceData as MenuPlato[]).length > 2 && (
                  <li className="text-[0.6rem] text-gray-500 dark:text-gray-400 leading-tight">
                    ...
                  </li>
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarDayCellContent;