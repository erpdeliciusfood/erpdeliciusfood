import React from 'react';
import { Menu } from '@/types';
import { Utensils } from 'lucide-react';

interface CalendarDayCellContentProps {
  menusForDay: Menu[];
  isSelected?: boolean; // Nueva prop
}

const CalendarDayCellContent: React.FC<CalendarDayCellContentProps> = ({ menusForDay, isSelected }) => {
  const baseClasses = "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold";
  const menuClasses = isSelected ? "bg-green-600 text-white" : "bg-blue-500 text-white";
  const noMenuClasses = isSelected ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300";

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {menusForDay.length > 0 ? (
        <div className={`${baseClasses} ${menuClasses}`}>
          {menusForDay.length}
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