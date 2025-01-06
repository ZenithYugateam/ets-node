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
  // employeeName: string[];
  priority: Priority;
  deadline: string;
  status: Status;
  description: string;
  remarks: string[];
  notes: string[];
  estimatedHours: number;
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

export function TaskDetailItem({
  label,
  value,
  valueColor,
  className,
}: TaskDetailItemProps) {
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

export function TaskPriorityBadge({
  priority,
  className,
}: TaskPriorityBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "px-3 py-1 font-medium",
        priorityStyles[priority],
        className
      )}
    >
      {priority}
    </Badge>
  );
}

export function TaskViewModal({
  task,
  open,
  onClose,
  taskId,
}: TaskViewModalProps) {
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
        .post(`https://ets-node-1.onrender.com/api/employeeNotes`, {
          id: taskId,
        })
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
        setRemarks((prevRemarks) => [...prevRemarks, message]);
      } catch (error) {
        console.error("Error updating remarks:", error);
      } finally {
        onClose();
        setMessage("");
      }
    }
  };

  if (!task) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-start justify-between">
              {/* Title and Status Side by Side */}
              <div className="flex items-center space-x-4">
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                  Task Details
                </DialogTitle>
                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Status:
                  </span>
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onClose}
              ></Button>
            </div>
          </DialogHeader>
          <Separator className="my-4" />
          <ScrollArea className="px-6 pb-6 max-h-[calc(80vh-8rem)]">
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <TaskDetailItem label="Project Name" value={task.projectName} />
                <TaskDetailItem label="Task Name" value={task.taskName} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
              <TaskDetailItem
  label="Employee Name"
  value={
    task.employees && task.employees.length > 0
      ? task.employees.join(", ") // Display names as a comma-separated list
      : "No employees assigned"
  }
/>


                <TaskDetailItem
                  label="Deadline"
                  value={format(new Date(task.deadline), "PPP")}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TaskDetailItem
                  label="Estimated Hours"
                  value={`${task.estimatedHours} hrs`}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Priority
                  </span>
                  <div className="pt-1">
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Description
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {task.description}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Remarks
                </span>
                <div className="space-y-2">
                  {remarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No remarks yet
                    </p>
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
                <span className="text-sm font-medium text-muted-foreground">
                  Notes
                </span>
                <div className="space-y-2">
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No notes yet
                    </p>
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
                <span className="text-sm font-medium text-muted-foreground">
                  Add Remark *
                </span>
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
