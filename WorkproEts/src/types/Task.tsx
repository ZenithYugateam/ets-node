// src/types/Task.ts

export type Priority = "Low" | "Medium" | "High";
export type Status = "Completed" | "In Progress" | "Pending" | "Cancelled" | "Accepted";

export interface Assignee {
  userId: string;
  name: string;
  avatar: string;
}

export interface Task {
  _id: string;
  title: string;
  assignee: Assignee;
  priority: Priority;
  deadline: string; // ISO date string
  status: Status;
  progress: number;
  department: string;
  description: string;
  estimatedHours: number;
  createdAt: string; // ISO date string
  // Additional fields for Time Remaining
  timeRemaining: string; // Based on deadline or estimatedHours
  urgencyLevel: "low" | "high" | "critical";
  displayTimeRemaining: string; // Consolidated field for display
  displayUrgencyLevel: string; // Consolidated field for display
}
