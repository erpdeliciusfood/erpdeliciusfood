import React from 'react';
import { Menu } from '@/types';

interface CalendarDayCellContentProps {
  menusForDay: Menu[];
  isSelected?: boolean; // Optional prop for selected state
}

const CalendarDayCellContent: React.FC<CalendarDayCellContentProps> = ({ menusForDay, isSelected }) => {
  const hasMenus = menusForDay.length > 0;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {hasMenus && (
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
          isSelected 
            ? 'bg-green-600 text-white' 
            : 'bg-blue-500 text-white dark:bg-blue-700'
        }`}>
          {menusForDay.length} menú{menusForDay.length > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default CalendarDayCellContent;