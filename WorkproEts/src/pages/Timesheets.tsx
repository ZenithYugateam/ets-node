import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import TimesheetEntry from '../components/timesheet/TimesheetEntry';
import WeeklyOverview from '../components/timesheet/WeeklyOverview';
import TimesheetApprovals from '../components/timesheet/TimesheetApprovals';

const Timesheets = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Clock className="h-5 w-5 mr-2" />
            Submit Timesheet
          </button>
        </div>
      </div>

      <WeeklyOverview selectedDate={selectedDate} />
      <TimesheetEntry selectedDate={selectedDate} />
      <TimesheetApprovals />
    </div>
  );
};

export default Timesheets;
