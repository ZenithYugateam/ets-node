import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Pause, Play } from 'lucide-react';
import { format } from 'date-fns';

const TimeCard = ({ userId }: { userId: string }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [totalPausedDuration, setTotalPausedDuration] = useState<number>(0);
  const [breakReason, setBreakReason] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isCheckedIn && checkInTime && !isOnBreak) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsedTime = now.getTime() - checkInTime.getTime();
        const workingTime = elapsedTime - totalPausedDuration; // Subtract paused time
        setDuration(workingTime);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime, isOnBreak, totalPausedDuration]);

  const handleCheckIn = async () => {
    const now = new Date();

    try {
      const response = await fetch('http://localhost:5001/api/timelog/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setCheckInTime(now);
        setIsCheckedIn(true);
        setDuration(0);
        setTotalPausedDuration(0); // Reset pause duration on check-in
        setBreakStartTime(null);
      }
    } catch (err) {
      console.error('Error during check-in:', err);
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/timelog/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setIsCheckedIn(false);
        setIsOnBreak(false);
        setDuration(0);
        setCheckInTime(null);
        setBreakStartTime(null);
        setTotalPausedDuration(0);
      }
    } catch (err) {
      console.error('Error during check-out:', err);
    }
  };

  const handleStartBreak = async () => {
    if (isOnBreak) return;

    const now = new Date();

    try {
      const response = await fetch('http://localhost:5001/api/timelog/start-break', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, reason: breakReason }),
      });

      if (response.ok) {
        setBreakStartTime(now); // Record break start time
        setIsOnBreak(true);
      }
    } catch (err) {
      console.error('Error during start break:', err);
    }
  };

  const handleEndBreak = async () => {
    if (!isOnBreak || !breakStartTime) return;

    const now = new Date();

    try {
      const response = await fetch('http://localhost:5001/api/timelog/end-break', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const pausedDuration = now.getTime() - breakStartTime.getTime(); // Calculate paused duration
        setTotalPausedDuration((prev) => prev + pausedDuration); // Add paused duration to total
        setBreakStartTime(null);
        setIsOnBreak(false);
      }
    } catch (err) {
      console.error('Error during end break:', err);
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
          {isCheckedIn && checkInTime && (
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
