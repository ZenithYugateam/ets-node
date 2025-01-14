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
import { ReportView } from "./ReportView"; // Ensure correct path for ReportView

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
  acceptedAt?: string; // make sure this is available when accepted
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

/**
 * Formats a number of hours into a string like "1H:32M:09S".
 * You can further adjust this function for a cuter look.
 */
function formatTime(hours: number): string {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}H:${String(m).padStart(2, "0")}M:${String(s).padStart(2, "0")}S `;
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
    <Badge
      variant="secondary"
      className={cn("px-3 py-1 font-medium", statusStyles[status], className)}
    >
      {status}
    </Badge>
  );
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("px-3 py-1 font-medium", priorityStyles[priority], className)}
    >
      {priority}
    </Badge>
  );
}

function computeCompletedTaskMetrics(task: Task): Task {
  if (task.status === "Completed" && task.completedAt) {
    const completedTime = new Date(task.completedAt).getTime();
    let acceptedTime: number;
    let timeUsedHours: number;
    let timeLeftHours: number;

    if (task.estimatedHours > 0) {
      // Use acceptedAt if available; otherwise, fallback.
      acceptedTime = task.acceptedAt
        ? new Date(task.acceptedAt).getTime()
        : completedTime - task.estimatedHours * 3600000;
      timeUsedHours = (completedTime - acceptedTime) / 3600000;
      timeLeftHours = task.estimatedHours - timeUsedHours;
    } else {
      // No estimated hours provided (or 0), compute time left from deadline.
      const deadlineDate = new Date(task.deadline);
      // Set deadline to end of the day
      const deadlineTime = deadlineDate.setHours(23, 59, 59, 999);
      timeUsedHours = (completedTime - (task.acceptedAt ? new Date(task.acceptedAt).getTime() : completedTime)) / 3600000;
      timeLeftHours = (deadlineTime - completedTime) / 3600000;
    }
    return { ...task, timeUsed: timeUsedHours, timeLeft: timeLeftHours };
  }
  return task;
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

  // Compute metrics for completed tasks (with fallback logic as described)
  const taskWithMetrics = task.status === "Completed" ? computeCompletedTaskMetrics(task) : task;

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </DialogHeader>
          <Separator className="my-4" />
          <ScrollArea className="px-6 pb-6 max-h-[calc(80vh-8rem)]">
            <div className="grid gap-6">
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
                <TaskDetailItem label="Estimated Hours" value={`${taskWithMetrics.estimatedHours.toFixed(2)} hrs`} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Priority</span>
                  <div className="pt-1">
                    <TaskPriorityBadge priority={taskWithMetrics.priority} />
                  </div>
                </div>
              </div>

              {/* Render Completed Details */}
              {taskWithMetrics.status === "Completed" && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <TaskDetailItem
                      label="Completed At"
                      value={
                        taskWithMetrics.completedAt
                          ? format(new Date(taskWithMetrics.completedAt), "MM/dd/yyyy hh:mm a")
                          : "N/A"
                      }
                    />
                    <TaskDetailItem
                      label="Time Used"
                      value={
                        taskWithMetrics.timeUsed !== undefined && taskWithMetrics.timeUsed > 0
                          ? formatTime(taskWithMetrics.timeUsed)
                          : "N/A"
                      }
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <TaskDetailItem
                      label="Time Left"
                      value={
                        taskWithMetrics.timeLeft !== undefined
                          ? taskWithMetrics.timeLeft >= 0
                            ? `${formatTime(taskWithMetrics.timeLeft)} remaining`
                            : `${formatTime(Math.abs(taskWithMetrics.timeLeft))} over the estimate!`
                          : "N/A"
                      }
                      valueColor={
                        taskWithMetrics.timeLeft !== undefined
                          ? taskWithMetrics.timeLeft >= 0
                            ? "text-green-600"
                            : "text-red-500"
                          : undefined
                      }
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <p className="text-sm leading-relaxed text-foreground">{taskWithMetrics.description}</p>
              </div>
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
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No notes yet</p>
                  ) : (
                    notes.map((note, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded-md">
                        <p>{note}</p>
                      </div>
                    ))
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
