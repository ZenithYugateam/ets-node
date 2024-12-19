import React from 'react';
import { Clock } from 'lucide-react';
import { useAttendance } from '../hooks/useAttendance';

export function AttendanceSection() {
  const { isCheckedIn, lastAction, handleToggle } = useAttendance();

  return (
    <section>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">Attendance</h2>
              {lastAction && (
                <p className="text-sm text-gray-500">
                  Last action at {lastAction}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              isCheckedIn
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </button>
        </div>
      </div>
    </section>
  );
}