import React from 'react';
import { Menu } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CalendarDayCellContentProps {
  menusForDay: Menu[];
  isSelected?: boolean;
}

const CalendarDayCellContent: React.FC<CalendarDayCellContentProps> = ({ menusForDay, isSelected }) => {
  if (menusForDay.length === 0) {
    return null; // No renderizar nada si no hay menús para el día
  }

  return (
    <div className={cn(
      "absolute inset-0 flex items-end justify-center pb-1", // Posicionar en la parte inferior de la celda
      "pointer-events-none" // Permitir que los clics pasen a la celda del día
    )}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="default"
              className={cn(
                "text-xs px-1 py-0.5 rounded-full",
                "bg-blue-500 text-white dark:bg-blue-700 dark:text-blue-100", // Color por defecto para menús
                isSelected && "bg-green-500 dark:bg-green-700" // Resaltar si está seleccionado
              )}
            >
              {menusForDay.length} Menú{menusForDay.length > 1 ? 's' : ''}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="text-sm p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
            {menusForDay.map(menu => (
              <p key={menu.id} className="font-medium">{menu.title}</p>
            ))}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CalendarDayCellContent;