// src/utils/calculateTimeRemaining.ts

export type UrgencyLevel = "low" | "high" | "critical";

export interface TimeRemaining {
  time: string;
  urgencyLevel: UrgencyLevel;
}

export const calculateTimeRemaining = (
  targetTime: number,
  type: "deadline" | "estimated"
): TimeRemaining => {
  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { time: "Expired", urgencyLevel: "critical" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Define urgency levels based on remaining time and type
  let urgencyLevel: UrgencyLevel = "low";

  if (type === "deadline" || type === "estimated") {
    if (diff <= 24 * 60 * 60 * 1000) { // ≤ 24 hours
      urgencyLevel = "high";
    }
    if (diff <= 1 * 60 * 60 * 1000) { // ≤ 1 hour
      urgencyLevel = "critical";
    }
  }

  const time = `${hours}h ${minutes}m ${seconds}s`;

  return { time, urgencyLevel };
};
