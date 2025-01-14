import axios from "axios";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";
import { Separator } from "../../../ui/Separator";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { ScrollArea } from "../../../ui/scroll-area";
import { ReportView } from "./ReportView"; // Ensure the path is correct

// Types
type Priority = "High" | "Medium" | "Low";
type Status = "Completed" | "In Progress" | "Pending";

interface Task {
  employees: string[];
  projectName: string;
  taskName: string;
  priority: Priority;
  deadline: string;
  status: Status;
  description: string;
  remarks: string[];
  notes: string[];
  estimatedHours: number;
  completedAt?: string;
  acceptedAt?: string; // ensure this is available when accepted
  timeUsed?: number;   // in hours
  timeLeft?: number;   // leftover hours
}

interface TaskViewModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  taskId: string;
}

interface TaskDetailItemProps {
  label: string;
  value: string;
  valueColor?: string;
  className?: string;
}

interface TaskStatusBadgeProps {
  status: Status;
  className?: string;
}

interface TaskPriorityBadgeProps {
  priority: Priority;
  className?: string;
}

// Styling for status badges
const statusStyles = {
  Completed: "bg-green-100 text-green-700 hover:bg-green-100",
  "In Progress": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Pending: "bg-blue-100 text-blue-700 hover:bg-blue-100",
} as const;

const priorityStyles = {
  High: "bg-red-100 text-red-700 hover:bg-red-100",
  Medium: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Low: "bg-green-100 text-green-700 hover:bg-green-100",
} as const;


function calculateTimeRemaining(deadlineTimestamp: number): { time: string; urgencyLevel: string } {
  const now = Date.now();
  const diff = deadlineTimestamp - now;
  if (diff <= 0) return { time: "Expired", urgencyLevel: "critical" };
  const hours = Math.floor(diff / (3600 * 1000));
  const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);
  const formattedTime = `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  let urgency = "low";
  if (diff < 3600000) { // Less than 1 hour remaining
    urgency = "critical";
  } else if (diff < 7200000) { // Less than 2 hours remaining
    urgency = "high";
  }
  return { time: formattedTime, urgencyLevel: urgency };
}


function formatTime(hours: number): string {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h:${String(m).padStart(2, "0")}m:${String(s).padStart(2, "0")}s `;
}

export function TaskDetailItem({ label, value, valueColor, className }: TaskDetailItemProps) {
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className={cn("text-base font-semibold", valueColor)}>{value}</dd>
    </div>
  );
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  return (
    <Badge variant="secondary" className={cn("px-3 py-1 font-medium", statusStyles[status], className)}>
      {status}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  return (
    <Badge variant="secondary" className={cn("px-3 py-1 font-medium", priorityStyles[priority], className)}>
      {priority}
    </Badge>
  );
}

/**
 * Computes time metrics for a completed task.
 * - If acceptedAt and completedAt are available, calculates timeUsed and timeLeft.
 * - If acceptedAt is missing, assumes the task was accepted exactly estimatedHours before completion.
 * - Additionally, if timeLeft is negative and the deadline is in the future, it recalculates timeLeft based on the deadline (end-of-day).
 */
function computeCompletedTaskMetrics(task: Task): Task {
  if (task.status === "Completed" && task.completedAt) {
    const completedTime = new Date(task.completedAt).getTime();
    const acceptedTime = task.acceptedAt
      ? new Date(task.acceptedAt).getTime()
      : completedTime - task.estimatedHours * 3600000;
    const timeUsedHours = (completedTime - acceptedTime) / 3600000;
    let timeLeftHours = task.estimatedHours - timeUsedHours;
    if (task.deadline && timeLeftHours < 0) {
      const deadlineDate = new Date(task.deadline);
      const deadlineTime = deadlineDate.setHours(23, 59, 59, 999);
      timeLeftHours = (deadlineTime - completedTime) / 3600000;
    }
    return { ...task, timeUsed: timeUsedHours, timeLeft: timeLeftHours };
  }
  return task;
}

/**
 * For tasks that are pending or in progress, compute the time remaining from the deadline.
 * Assumes the deadline is considered at the end of the day.
 */
function computePendingTimeRemaining(task: Task): { time: string; urgencyLevel: string } {
  if (task.deadline) {
    const deadlineDate = new Date(task.deadline);
    deadlineDate.setHours(23, 59, 59, 999);
    const result = calculateTimeRemaining(deadlineDate.getTime());
    return result;
  }
  return { time: "N/A", urgencyLevel: "low" };
}

export function TaskViewModal({ task, open, onClose, taskId }: TaskViewModalProps) {
  const [message, setMessage] = useState<string>("");
  const [remarks, setRemarks] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    if (open && taskId) {
      axios
        .get(`https://ets-node-1.onrender.com/api/remarks/${taskId}`)
        .then((response) => {
          setRemarks(response.data.remarks);
        })
        .catch((error) => {
          console.error("Error fetching remarks:", error);
        });
      axios
        .post(`https://ets-node-1.onrender.com/api/employeeNotes`, { id: taskId })
        .then((response) => {
          setNotes(response.data.notes);
        })
        .catch((error) => {
          console.error("Error fetching notes:", error);
        });
    }
  }, [open, taskId]);

  const handleSend = async () => {
    if (message.trim()) {
      try {
        await axios.put(`https://ets-node-1.onrender.com/api/update-remarks/${taskId}`, {
          remarks: message,
        });
        setRemarks((prev) => [...prev, message]);
      } catch (error) {
        console.error("Error updating remarks:", error);
      } finally {
        onClose();
        setMessage("");
      }
    }
  };

  if (!task) return null;

  // For completed tasks, compute metrics.
  const taskWithMetrics = task.status === "Completed" ? computeCompletedTaskMetrics(task) : task;

  // For pending/in progress tasks, calculate time remaining from deadline.
  const pendingTime = task.status !== "Completed" ? computePendingTimeRemaining(task) : { time: taskWithMetrics.displayTimeRemaining, urgencyLevel: taskWithMetrics.displayUrgencyLevel };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                  Task Details
                </DialogTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <TaskStatusBadge status={taskWithMetrics.status} />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </DialogHeader>
          <Separator className="my-4" />
          <ScrollArea className="px-6 pb-6 max-h-[calc(80vh-8rem)]">
            <div className="grid gap-6">
              {/* Task Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <TaskDetailItem label="Project Name" value={taskWithMetrics.projectName} />
                <TaskDetailItem label="Task Name" value={taskWithMetrics.taskName} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TaskDetailItem
                  label="Employee Name"
                  value={
                    taskWithMetrics.employees && taskWithMetrics.employees.length > 0
                      ? taskWithMetrics.employees.join(", ")
                      : "No employees assigned"
                  }
                />
                <TaskDetailItem label="Deadline" value={format(new Date(taskWithMetrics.deadline), "PPP")} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Assigned Manager Field */}
                <TaskDetailItem label="Assigned Manager" value={taskWithMetrics.managerName || "N/A"} />
                <TaskDetailItem label="Estimated Hours" value={`${taskWithMetrics.estimatedHours.toFixed(2)} hrs`} />
              </div>
              <TaskDetailItem
                label="Time Remaining"
                value={
                  taskWithMetrics.status !== "Completed"
                    ? pendingTime.time
                    : taskWithMetrics.displayTimeRemaining || "Completed"
                }
                valueColor={
                  taskWithMetrics.status !== "Completed"
                    ? pendingTime.urgencyLevel === "critical"
                      ? "text-red-500"
                      : pendingTime.urgencyLevel === "high"
                      ? "text-yellow-500"
                      : "text-green-500"
                    : taskWithMetrics.displayUrgencyLevel === "critical"
                    ? "text-red-500"
                    : taskWithMetrics.displayUrgencyLevel === "high"
                    ? "text-yellow-500"
                    : "text-green-500"
                }
              />

              {/* Completed Task Metrics */}
              {taskWithMetrics.status === "Completed" && (
                <>
                  <TaskDetailItem
                    label="Completed At"
                    value={
                      taskWithMetrics.completedAt
                        ? format(new Date(taskWithMetrics.completedAt), "MM/dd/yyyy HH:mm a")
                        : "Not Recorded"
                    }
                  />
                  <div className="mt-2 p-2 rounded-md">
                    <p className="font-semibold text-gray-700">
                      Time Used:{" "}
                      <span className={
                        taskWithMetrics.estimatedHours > 0 && taskWithMetrics.timeUsed
                          ? taskWithMetrics.timeUsed > taskWithMetrics.estimatedHours
                            ? "text-red-500"
                            : "text-green-600"
                          : "text-green-600"
                      }>
                        {taskWithMetrics.timeUsed !== undefined ? formatTime(taskWithMetrics.timeUsed) : "N/A"}{" "}
                      </span>
                      {taskWithMetrics.estimatedHours > 0
                        ? `/${formatTime(taskWithMetrics.estimatedHours)}`
                        : ""}{" "}
                    </p>
                    <p className="font-semibold text-gray-700">
                      Time Left:{" "}
                      <span className={
                        taskWithMetrics.timeLeft !== undefined
                          ? taskWithMetrics.timeLeft >= 0
                            ? "text-green-600"
                            : "text-red-500"
                          : "text-gray-500"
                      }>
                        {taskWithMetrics.timeLeft !== undefined ? formatTime(Math.abs(taskWithMetrics.timeLeft)) : "N/A"}{" "}
                      </span>
                      {taskWithMetrics.timeLeft !== undefined
                        ? taskWithMetrics.timeLeft >= 0
                          ? "remaining"
                          : taskWithMetrics.estimatedHours > 0
                          ? " over the estimate!"
                          : " over the deadline!"
                        : "N/A"}
                    </p>
                  </div>
                </>
              )}

              <TaskDetailItem label="Description" value={taskWithMetrics.description || "No description available"} />

              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Remarks</span>
                <div className="space-y-2">
                  {remarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No remarks yet</p>
                  ) : (
                    remarks.map((remark, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded-md">
                        <p>{remark}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Notes</span>
                <div className="space-y-2">
                  {taskWithMetrics.notes && taskWithMetrics.notes.length > 0 ? (
                    taskWithMetrics.notes.map((note, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded-md">
                        <p>{note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No notes yet</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Add Remark *</span>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your remarks here..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleSend}
                  className="relative px-6 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 hover:scale-105 transition-all duration-200"
                >
                  Send
                </Button>
              </div>

              {/* Report View Component */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Task Report</h3>
                <ReportView managerTaskId={taskId} type={""} />
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
