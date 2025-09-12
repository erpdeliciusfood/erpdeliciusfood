"use client";

import React from 'react';
import { Menu } from '@/types';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarDayCellContentProps {
  menusForDay: Menu[];
  isSelected?: boolean;
}

const CalendarDayCellContent: React.FC<CalendarDayCellContentProps> = ({ menusForDay, isSelected }) => {
  const hasMenus = menusForDay.length > 0;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center rounded-full",
        "transition-colors duration-200",
        isSelected && "bg-green-500/20 dark:bg-green-700/20", // Overlay if selected
        hasMenus && "bg-blue-500/20 dark:bg-blue-700/20" // Overlay if has menus
      )}
    >
      {hasMenus && (
        <UtensilsCrossed className="h-4 w-4 text-blue-600 dark:text-blue-300" />
      )}
      {/* Small dots to indicate presence of menus or selection */}
      {hasMenus && (
        <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
      )}
      {isSelected && (
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-600 dark:bg-green-400"></span>
      )}
    </div>
  );
};

export default CalendarDayCellContent;