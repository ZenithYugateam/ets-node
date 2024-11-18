import React from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';

const TimeCard = () => {
  const [isCheckedIn, setIsCheckedIn] = React.useState(false);
  const [checkInTime, setCheckInTime] = React.useState<Date | null>(null);

  const handleTimeAction = () => {
    if (!isCheckedIn) {
      setCheckInTime(new Date());
    }
    setIsCheckedIn(!isCheckedIn);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Time Tracking</h2>
        </div>
        <span className="text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM d')}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Current Status</p>
          <p className={`text-lg font-semibold ${isCheckedIn ? 'text-green-600' : 'text-red-600'}`}>
            {isCheckedIn ? 'Checked In' : 'Checked Out'}
          </p>
          {checkInTime && isCheckedIn && (
            <p className="text-sm text-gray-500 mt-1">
              Since {format(checkInTime, 'h:mm a')}
            </p>
          )}
        </div>
        <button
          onClick={handleTimeAction}
          className={`flex items-center px-4 py-2 rounded-lg ${
            isCheckedIn
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          {isCheckedIn ? (
            <>
              <LogOut className="h-5 w-5 mr-2" />
              Check Out
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              Check In
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TimeCard;