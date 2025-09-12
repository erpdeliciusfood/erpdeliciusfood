import React from 'react';
import { Menu, MEAL_SERVICE_ORDER, MenuPlato } from '@/types'; // Import MEAL_SERVICE_ORDER and MenuPlato
import { Utensils } from 'lucide-react';

interface CalendarDayCellContentProps {
  menusForDay: Menu[];
  isSelected?: boolean;
}

const CalendarDayCellContent: React.FC<CalendarDayCellContentProps> = ({ menusForDay, isSelected }) => {
  const baseClasses = "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold";
  const noMenuClasses = isSelected ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300";

  // Determine which meal services have menus for the day
  const servicesWithMenus = new Set<string>();
  menusForDay.forEach((menu: Menu) => { // Explicitly type 'menu'
    menu.menu_platos?.forEach((mp: MenuPlato) => { // Explicitly type 'mp'
      if (mp.meal_services?.name) {
        servicesWithMenus.add(mp.meal_services.name);
      }
    });
  });

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {menusForDay.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-0.5 p-1">
          {MEAL_SERVICE_ORDER.map(serviceName => {
            const hasService = servicesWithMenus.has(serviceName);
            let serviceColorClass = '';
            // Assign different colors for better visual distinction
            switch (serviceName) {
              case 'Desayuno': serviceColorClass = 'bg-yellow-500'; break;
              case 'Almuerzo Regular': serviceColorClass = 'bg-green-500'; break;
              case 'Almuerzo Dieta Saludable': serviceColorClass = 'bg-teal-500'; break;
              case 'Almuerzo Dieta Blanda': serviceColorClass = 'bg-orange-500'; break;
              case 'Cena': serviceColorClass = 'bg-purple-500'; break;
              case 'Merienda': serviceColorClass = 'bg-pink-500'; break;
              default: serviceColorClass = 'bg-gray-500'; break;
            }

            return (
              <div
                key={serviceName}
                className={`w-2 h-2 rounded-full ${hasService ? serviceColorClass : 'bg-gray-300 dark:bg-gray-600'}`}
                title={serviceName}
              />
            );
          })}
        </div>
      ) : (
        <div className={`${baseClasses} ${noMenuClasses}`}>
          <Utensils size={14} />
        </div>
      )}
    </div>
  );
};

export default CalendarDayCellContent;