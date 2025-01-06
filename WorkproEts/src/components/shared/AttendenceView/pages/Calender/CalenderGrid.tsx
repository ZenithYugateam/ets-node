import DayCell from './DayCell';

interface CalendarGridProps {
  days: Date[];
  currentDate: Date;
  onDateClick: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CalendarGrid({ days, currentDate, onDateClick }: CalendarGridProps) {
  return (
    <div className="select-none">
      {/* Weekday headers - Hide on small screens */}
      <div className="hidden sm:grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((day) => (
          <div
            key={`desktop-${day}`}
            className="text-center text-sm font-medium text-gray-600 p-2 border-b border-gray-200"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Mobile weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:hidden">
        {WEEKDAYS_SHORT.map((day) => (
          <div
            key={`mobile-${day}`}
            className="text-center text-xs font-medium text-gray-600 p-1 border-b border-gray-200"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mt-1">
        {days.map((day) => (
          <DayCell
            key={day.toString()}
            day={day}
            currentDate={currentDate}
            onClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
}