import React from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

interface WeeklyOverviewProps {
  selectedDate: Date;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ selectedDate }) => {
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const dailyHours = [8, 7.5, 8, 8, 6.5, 0, 0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Weekly Overview</h2>
        <div className="grid grid-cols-7 gap-4">
          {days.map((day, index) => (
            <div
              key={day.toString()}
              className={`p-4 rounded-lg ${
                format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  ? 'bg-indigo-50 border-2 border-indigo-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <p className="text-sm font-medium text-gray-600">
                {format(day, 'EEE')}
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {format(day, 'd')}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {dailyHours[index]} hrs
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Week Total: {dailyHours.reduce((a, b) => a + b, 0)} hrs
          </p>
          <p className="text-sm text-gray-600">
            Week of {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyOverview;