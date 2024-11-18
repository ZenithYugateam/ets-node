import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Pause, Play } from 'lucide-react';
import { format } from 'date-fns';

const TimeCard = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [breakReason, setBreakReason] = useState('');
  const userId = '673ba544bbb7e127b3004d98'; // Replace with actual user ID

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isCheckedIn && checkInTime && !isOnBreak) {
      interval = setInterval(() => {
        const now = new Date();
        setDuration(now.getTime() - checkInTime.getTime());
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime, isOnBreak]);

  const handleCheckIn = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/timelog/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (response.ok) {
        setCheckInTime(new Date(data.timeLog.checkIn));
        setIsCheckedIn(true);
      } else {
        console.error('Error:', data.message);
      }
    } catch (err) {
      console.error('Error during check-in:', err);
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/timelog/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsCheckedIn(false);
        setDuration(0);
        setCheckInTime(null);
        console.log('Checked out successfully:', data.timeLog);
      } else {
        console.error('Error:', data.message);
      }
    } catch (err) {
      console.error('Error during check-out:', err);
    }
  };

  const handleStartBreak = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/timelog/start-break', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, reason: breakReason }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsOnBreak(true);
        setBreakReason('');
        console.log('Break started:', data.timeLog);
      } else {
        console.error('Error:', data.message);
      }
    } catch (err) {
      console.error('Error starting break:', err);
    }
  };

  const handleEndBreak = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/timelog/end-break', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsOnBreak(false);
        console.log('Break ended:', data.timeLog);
      } else {
        console.error('Error:', data.message);
      }
    } catch (err) {
      console.error('Error ending break:', err);
    }
  };

  const handleTimeAction = () => {
    if (isCheckedIn) {
      handleCheckOut();
    } else {
      handleCheckIn();
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Time Tracking</h2>
        </div>
        <span className="text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM d')}</span>
      </div>

      <div className="flex flex-col space-y-4">
        <div>
          <p className="text-sm text-gray-600">Current Status</p>
          <p className={`text-lg font-semibold ${isCheckedIn ? 'text-green-600' : 'text-red-600'}`}>
            {isCheckedIn ? (isOnBreak ? 'On Break' : 'Working') : 'Checked Out'}
          </p>
          {isCheckedIn && checkInTime && !isOnBreak && (
            <p className="text-sm text-gray-500 mt-1">Working for {formatDuration(duration)}</p>
          )}
        </div>

        {isCheckedIn && !isOnBreak && (
          <div className="flex space-x-2">
            <input
              type="text"
              value={breakReason}
              onChange={(e) => setBreakReason(e.target.value)}
              placeholder="Reason for break"
              className="border px-2 py-1 rounded w-full"
            />
            <button
              onClick={handleStartBreak}
              className="flex items-center px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100"
            >
              <Pause className="h-5 w-5 mr-2" />
              Start Break
            </button>
          </div>
        )}

        {isOnBreak && (
          <button
            onClick={handleEndBreak}
            className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
          >
            <Play className="h-5 w-5 mr-2" />
            End Break
          </button>
        )}

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
