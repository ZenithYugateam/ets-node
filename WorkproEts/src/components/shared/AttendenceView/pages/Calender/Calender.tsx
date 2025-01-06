import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import MonthYearPicker from './MonthYearPicker';
import CalendarGrid from './CalenderGrid';
import { getCalendarDays } from './utils';

export default function Calendar() {
  const navigate = useNavigate();

  // State to track the currently viewed date (month and year).
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // Generate all days to be displayed in the calendar for the current view.
  const days = getCalendarDays(currentDate);

  // Handles navigation to the details page for the selected date.
  const handleDateClick = (date: Date) => {
    navigate(`${format(date, 'yyyy-MM-dd')}`); // Navigate to the selected date's details.
  };

  // Update the calendar to show a different month.
  const handleMonthChange = (month: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
  };

  // Update the calendar to show a different year.
  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  // Move to the previous month.
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Move to the next month.
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-shadow hover:shadow-xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        {/* Calendar Icon and Month-Year Picker */}
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-blue-500" />
          </div>
          <MonthYearPicker
            currentDate={currentDate} // Pass the currently selected date.
            onMonthChange={handleMonthChange} // Callback for month changes.
            onYearChange={handleYearChange} // Callback for year changes.
          />
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-3">
          {/* Button to navigate to the previous month */}
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          {/* Button to reset to today's date */}
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 font-medium"
          >
            Today
          </button>

          {/* Button to navigate to the next month */}
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        days={days} // Array of days to display in the grid.
        currentDate={currentDate} // Current date to highlight the selected month.
        onDateClick={handleDateClick} // Callback when a date is clicked.
      />
    </div>
  );
}
