import { format, isSameMonth, isToday, isWeekend } from 'date-fns';
import { Badge } from '../ui/Badge';

interface DayCellProps {
  day: Date;
  currentDate: Date;
  onClick: (date: Date) => void;
}

export default function DayCell({ day, currentDate, onClick }: DayCellProps) {
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isCurrentDay = isToday(day);
  const isWeekendDay = isWeekend(day);
  
  return (
    <div
      onClick={() => isCurrentMonth && onClick(day)}
      className={`
        group relative p-1 sm:p-3 min-h-[3rem] sm:min-h-[6rem] border rounded-lg 
        transition-all duration-300 ease-in-out
        ${isCurrentMonth 
          ? 'hover:shadow-lg hover:border-blue-300 hover:scale-[1.02] cursor-pointer transform' 
          : 'bg-gray-50/50 cursor-default'}
        ${isCurrentDay ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200 ring-opacity-50' : ''}
        ${isWeekendDay && isCurrentMonth ? 'bg-gray-50/70' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <span
          className={`
            inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm
            transition-all duration-200 ease-in-out
            ${isCurrentDay 
              ? 'bg-blue-500 text-white font-semibold shadow-sm' 
              : isCurrentMonth
                ? isWeekendDay
                  ? 'text-gray-600'
                  : 'text-gray-900'
                : 'text-gray-400'}
            ${isCurrentMonth && !isCurrentDay && 'group-hover:bg-blue-100'}
          `}
        >
          {format(day, 'd')}
        </span>
        
        {isCurrentMonth && (
          <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Badge variant="outline" className="text-xs">
              View
            </Badge>
          </div>
        )}
      </div>
      
      {isCurrentMonth && isCurrentDay && (
        <div className="mt-1 sm:mt-2">
          <Badge variant="primary" className="text-xs">Today</Badge>
        </div>
      )}
    </div>
  );
}