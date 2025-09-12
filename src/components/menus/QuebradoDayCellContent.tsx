import React from "react";
import { Menu, MealService } from "@/types";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuebradoDayCellContentProps {
  menusForDay: Menu[]; // Menus planned for this specific day
  availableMealServices: MealService[]; // All available meal services from DB
}

// Define the specific services and sub-categories to check
const REQUIRED_SERVICES_CONFIG = [
  { name: "Desayuno", key: "desayuno" },
  { name: "Almuerzo", key: "almuerzo" },
  { name: "Cena", key: "cena" },
  { name: "Merienda", key: "merienda" },
];

const ALMUERZO_SUB_CATEGORIES_CONFIG = [
  { name: "Regular", dishCategory: "Plato de Fondo - Carnes" }, // Assuming a common category for 'Regular'
  { name: "Dieta Blanda", dishCategory: "Dieta Blanda" },
  { name: "Dieta Saludable", dishCategory: "Dieta Saludable" },
];

const QuebradoDayCellContent: React.FC<QuebradoDayCellContentProps> = ({ menusForDay, availableMealServices }) => {
  if (!menusForDay || menusForDay.length === 0) {
    return null; // No menus for this day, so no "quebrado" status to display
  }

  // Track presence of each required service and sub-category
  const servicePresence: { [key: string]: boolean } = {}; // Keyed by service.key (e.g., 'desayuno')
  const almuerzoSubCategoryPresence: { [key: string]: boolean } = {}; // Keyed by sub-category name (e.g., 'Regular')

  REQUIRED_SERVICES_CONFIG.forEach(service => {
    servicePresence[service.key] = false;
  });
  ALMUERZO_SUB_CATEGORIES_CONFIG.forEach(subCat => {
    almuerzoSubCategoryPresence[subCat.name] = false;
  });

  menusForDay.forEach(menu => {
    menu.menu_platos?.forEach(mp => {
      const serviceName = mp.meal_services?.name;
      const dishCategory = mp.dish_category;

      if (serviceName) {
        const normalizedServiceName = serviceName.toLowerCase();

        // Check for main meal services
        const serviceConfig = REQUIRED_SERVICES_CONFIG.find(s => s.key === normalizedServiceName);
        if (serviceConfig) {
          servicePresence[serviceConfig.key] = true;
        }

        // Check for Almuerzo sub-categories
        if (normalizedServiceName === "almuerzo" && dishCategory) {
          const subCatConfig = ALMUERZO_SUB_CATEGORIES_CONFIG.find(sc => sc.dishCategory === dishCategory);
          if (subCatConfig) {
            almuerzoSubCategoryPresence[subCatConfig.name] = true;
          } else {
            // If any other dish category exists under Almuerzo, consider "Regular" present
            almuerzoSubCategoryPresence["Regular"] = true;
          }
        }
      }
    });
  });

  return (
    <div className="absolute inset-0 p-1 overflow-hidden text-xs pointer-events-none flex flex-col justify-end items-start space-y-0.5">
      <TooltipProvider>
        {REQUIRED_SERVICES_CONFIG.map(service => {
          const isPresent = servicePresence[service.key];
          const badgeColorClass = isPresent ? "bg-green-500 text-white" : "bg-red-500 text-white";
          const Icon = isPresent ? CheckCircle2 : XCircle;

          if (service.key === "almuerzo") {
            return (
              <div key={service.key} className="flex flex-wrap gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className={`h-auto px-1 py-0.5 text-[0.6rem] font-medium capitalize ${servicePresence["almuerzo"] ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                    >
                      <Icon className="h-2 w-2 mr-0.5" /> Almuerzo
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                    <p className="font-semibold mb-0.5">Almuerzo:</p>
                    {ALMUERZO_SUB_CATEGORIES_CONFIG.map(subCat => (
                      <div key={subCat.name} className="flex items-center text-gray-700 dark:text-gray-300">
                        {almuerzoSubCategoryPresence[subCat.name] ? <CheckCircle2 className="h-2 w-2 mr-1 text-green-500" /> : <XCircle className="h-2 w-2 mr-1 text-red-500" />}
                        {subCat.name}
                      </div>
                    ))}
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          }

          return (
            <Tooltip key={service.key}>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className={`h-auto px-1 py-0.5 text-[0.6rem] font-medium capitalize ${badgeColorClass}`}
                >
                  <Icon className="h-2 w-2 mr-0.5" /> {service.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="text-xs p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                {isPresent ? `Menú de ${service.name} configurado.` : `Falta menú de ${service.name}.`}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
};

export default QuebradoDayCellContent;