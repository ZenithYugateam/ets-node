import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';

interface MonthYearPickerProps {
  currentDate: Date;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export default function MonthYearPicker({ 
  currentDate, 
  onMonthChange, 
  onYearChange 
}: MonthYearPickerProps) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return format(date, 'MMMM');
  });

  const years = Array.from({ length: 10 }, (_, i) => {
    const currentYear = new Date().getFullYear();
    return currentYear - 5 + i;
  });

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <select
          value={currentDate.getMonth()}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={currentDate.getFullYear()}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}