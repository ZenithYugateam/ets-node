import { useState } from 'react';

export function useAttendance() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleToggle = () => {
    const now = new Date().toLocaleTimeString();
    setIsCheckedIn(!isCheckedIn);
    setLastAction(now);
  };

  return {
    isCheckedIn,
    lastAction,
    handleToggle,
  };
}