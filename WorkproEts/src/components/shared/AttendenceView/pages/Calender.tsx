import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const handleDateClick = (date: Date) => {
    navigate(`${format(date, 'yyyy-MM-dd')}`);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-6 w-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded hover:bg-gray-100"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded hover:bg-gray-100"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 p-2"
          >
            {day}
          </div>
        ))}
        
        {days.map((day) => (
          <div
            key={day.toString()}
            className={`
              relative p-2 h-24 border hover:bg-gray-50 cursor-pointer
              ${!isSameMonth(day, currentDate) ? 'bg-gray-50' : ''}
              ${isToday(day) ? 'bg-blue-50' : ''}
            `}
            onClick={() => handleDateClick(day)}
          >
            <span
              className={`
                text-sm ${isToday(day) ? 'font-bold text-blue-600' : ''}
                ${!isSameMonth(day, currentDate) ? 'text-gray-400' : ''}
              `}
            >
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}