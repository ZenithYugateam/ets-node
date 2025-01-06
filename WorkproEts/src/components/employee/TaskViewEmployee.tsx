
import { Button as MuiButton } from "@mui/material";
import Box from "@mui/material/Box";
import { AlertTriangle, Eye, ChevronDown, Search } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid, GridColDef, GridSelectionModel } from "@mui/x-data-grid";
import axios from "axios";
import { format } from "date-fns";
import React, { useEffect, useState, useContext } from "react";
import { Separator } from "../../../src/ui/Separator";
import { cn } from "../../lib/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { ScrollArea } from "../../ui/scroll-area";
import UpdateStatusModal from "./UpdateStatusModal";
import EditIcon from "@mui/icons-material/Edit";
import { TaskDrawer } from "../taskStepperFlow/TaskDrawer";
import {
  calculateTimeRemaining,
  UrgencyLevel,
} from "../../utils/calculateTimeRemaining";
import { NotificationContext } from "../context/NotificationContext";
import { Clear } from "@mui/icons-material";

// Types
type Priority = "Low" | "Medium" | "High";
type Status = "Completed" | "In Progress" | "Pending";

interface Task {
  _id: string;
  projectName: string;
  taskName: string;
  employees:string[];
  // employeeName: string;
  priority: Priority;
  deadline: string | null;
  description: string;
  managerName: string;
  status: Status;
  remarks: string[];
  droneRequired: string;
  selectedEmployees: string[];
  currentStep: string;
  estimatedHours: number;

  // Timer logic fields
  estimatedDeadline?: number;
  timeRemaining: string;
  urgencyLevel: UrgencyLevel;
  estimatedTimeRemaining: string;
  estimatedUrgencyLevel: UrgencyLevel;
  displayTimeRemaining: string;
  displayUrgencyLevel: UrgencyLevel;
  notified12?: boolean;
  notified6?: boolean;
  notified3?: boolean;

  // Accept/Complete fields
  accepted?: boolean;
  acceptedAt?: string;
  completedAt?: string;
  timeUsed?: number; // in hours
  timeLeft?: number; // leftover hours
}

// For small detail items
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

// Badge styling
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

// Notification hashing
const getNotificationHash = (taskId: string, threshold: number): number => {
  return `${taskId}_${threshold}`.hashCode();
};

// Convert hours => "HH:MM:SS"
function formatHours(hours: number) {
  const positiveHours = Math.abs(hours);
  const totalSeconds = Math.floor(positiveHours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
}

const TaskViewEmployee: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(
    sessionStorage.getItem("userName")
  );
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [remarks, setRemarks] = useState<string[]>([]);
  const [newRemark, setNewRemark] = useState<string>("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedTaskForStatus, setSelectedTaskForStatus] =
    useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const { addNotification } = useContext(NotificationContext);

  const handleAcceptTask = async (task: Task) => {
    try {
      const now = new Date();
      await axios.put(`https://ets-node-1.onrender.com/api/tasks/accept/${task._id}`, {
        accepted: true,
        acceptedAt: now,
      });

      setTasks((prev) =>
        prev.map((t) => {
          if (t._id === task._id) {
            return { ...t, accepted: true, acceptedAt: now.toISOString() };
          }
          return t;
        })
      );

      // Re-fetch from server so the UI is 100% consistent
      if (userName) {
        fetchTasks(userName);
      }

      addNotification(`You accepted task "${task.taskName}"!`, "success");
    } catch (error) {
      console.error("Error accepting task:", error);
      addNotification("Failed to accept task. Please try again.", "error");
    }
  };

  //
  // 2) Update Status => "Completed"
  //
  const handleStatusChange = (task: Task) => {
    // If user tries to complete without acceptance, warn
    if (!task.accepted) {
      addNotification(
        "You must accept the task before updating its status.",
        "warning"
      );
      return;
    }
    setSelectedTaskForStatus(task);
    setStatusModalOpen(true);
  };

  //
  // 3) Fetch tasks => main data load
  //
  const fetchTasks = async (employeeName: string) => {
    setLoading(true);
    try {
      const userDepartments = JSON.parse(sessionStorage.getItem("department") || "[]");
      const response = await axios.post<Task[]>(
        "https://ets-node-1.onrender.com/api/tasks/employee",
        {
          employeeName,
          departments: userDepartments,
        }
      );
      let allTasks = response.data;

      // Sort descending by _id
      allTasks.sort((a, b) => b._id.localeCompare(a._id));

      // Process each task for time-remaining logic
      const tasksWithTime = allTasks.map((task) => {
        let updatedTask = { ...task };

        // Console log for debugging
        console.log(`Processing Task ID: ${task._id}`);
        console.log(`Estimated Hours: ${task.estimatedHours}`);

        // Ensure estimatedHours is set
        if (!updatedTask.estimatedHours || updatedTask.estimatedHours <= 0) {
          if (updatedTask.deadline && updatedTask.acceptedAt) {
            const acceptedTime = new Date(updatedTask.acceptedAt).getTime();
            const deadlineTime = new Date(updatedTask.deadline).getTime();
            const totalHours = (deadlineTime - acceptedTime) / 3600000; 

            if (totalHours > 0) {
              updatedTask.estimatedHours = totalHours;
              console.log(
                `Task ID: ${task._id} - Derived estimatedHours from deadline: ${updatedTask.estimatedHours}`
              );
            } else {
              updatedTask.estimatedHours = 1; // Fallback to 1 hour if deadline is past
              console.warn(
                `Task ID: ${task._id} has a past deadline. Defaulting estimatedHours to 1.`
              );
            }
          } else {
            updatedTask.estimatedHours = 1; // Default to 1 hour if no estimatedHours or deadline
            console.warn(
              `Task ID: ${task._id} has missing estimatedHours and no deadline. Defaulting estimatedHours to 1.`
            );
          }
        }

        // If not accepted => skip timer
        if (!task.accepted) {
          updatedTask.timeRemaining = "Awaiting Acceptance";
          updatedTask.urgencyLevel = "low";
          updatedTask.estimatedTimeRemaining = "N/A";
          updatedTask.estimatedUrgencyLevel = "low";
          updatedTask.displayTimeRemaining = "N/A";
          updatedTask.displayUrgencyLevel = "low";
          return updatedTask;
        }

        // If completed => calculate time used and time left
        if (
          task.status === "Completed" &&
          task.acceptedAt &&
          task.completedAt
        ) {
          const acceptedTime = new Date(task.acceptedAt).getTime();
          const completedTime = new Date(task.completedAt).getTime();
          const timeUsedHours = (completedTime - acceptedTime) / 3600000; // Convert ms to hours

          updatedTask.timeUsed = timeUsedHours;

          if (updatedTask.estimatedHours > 0) {
            updatedTask.timeLeft = updatedTask.estimatedHours - timeUsedHours;
          } else if (task.deadline) {
            const deadlineDate = new Date(task.deadline);
            const deadlineTime = deadlineDate.setHours(23, 59, 59, 999);
            const timeLeftHours = (deadlineTime - completedTime) / 3600000;
            updatedTask.timeLeft = timeLeftHours;
          } else {
            updatedTask.timeLeft = 0;
          }

          // Set display fields for completed tasks
          updatedTask.displayTimeRemaining = "Completed";
          updatedTask.displayUrgencyLevel = "low"; // No urgency after completion

          // Logging for debugging
          console.log(`Task ID: ${task._id}`);
          console.log(`Time Used (hours): ${updatedTask.timeUsed}`);
          console.log(`Time Left (hours): ${updatedTask.timeLeft}`);

          return updatedTask;
        }

        // If accepted but not completed => normal countdown logic
        // 1) Deadline
        if (task.deadline) {
          const deadlineDate = new Date(task.deadline);
          const now = new Date();
          const deadlineTimestamp = deadlineDate.setHours(23, 59, 59, 999);
          const isPastDeadline = deadlineTimestamp < now.getTime();

          if (isPastDeadline) {
            updatedTask.timeRemaining = "Expired";
            updatedTask.urgencyLevel = "critical";
          } else {
            const { time, urgencyLevel } =
              calculateTimeRemaining(deadlineTimestamp);
            updatedTask.timeRemaining = time;
            updatedTask.urgencyLevel = urgencyLevel;
          }
        } else {
          updatedTask.timeRemaining = "N/A";
          updatedTask.urgencyLevel = "low";
        }

        // 2) Estimated
        if (
          updatedTask.estimatedHours &&
          updatedTask.timeRemaining !== "Expired"
        ) {
          const estKey = `estimatedDeadline_${task._id}`;
          let estDeadline = parseInt(localStorage.getItem(estKey) || "0");

          if (!estDeadline) {
            estDeadline =
              Date.now() + updatedTask.estimatedHours * 60 * 60 * 1000;
            localStorage.setItem(estKey, estDeadline.toString());
          }

          const { time, urgencyLevel } = calculateTimeRemaining(estDeadline);
          updatedTask.estimatedTimeRemaining = time;
          updatedTask.estimatedUrgencyLevel = urgencyLevel;
        } else {
          updatedTask.estimatedTimeRemaining = "N/A";
          updatedTask.estimatedUrgencyLevel = "low";
        }

        // 3) Decide which to display
        if (
          updatedTask.estimatedHours &&
          updatedTask.timeRemaining !== "Expired"
        ) {
          updatedTask.displayTimeRemaining = updatedTask.estimatedTimeRemaining;
          updatedTask.displayUrgencyLevel = updatedTask.estimatedUrgencyLevel;
        } else if (task.deadline) {
          updatedTask.displayTimeRemaining = updatedTask.timeRemaining;
          updatedTask.displayUrgencyLevel = updatedTask.urgencyLevel;
        } else {
          updatedTask.displayTimeRemaining = "N/A";
          updatedTask.displayUrgencyLevel = "low";
        }

        return updatedTask;
      });

      setTasks(tasksWithTime);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      addNotification(
        "Failed to fetch tasks. Please try again later.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // On mount
  useEffect(() => {
    if (userName) {
      fetchTasks(userName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  //
  // 4) 1-second interval => real-time countdown
  //
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) =>
        prev
          .map((task) => {
            if (!task.accepted) {
              return {
                ...task,
                timeRemaining: "Awaiting Acceptance",
                displayTimeRemaining: "N/A",
                urgencyLevel: "low",
                displayUrgencyLevel: "low",
              };
            }

            // If Completed => do not update timeUsed or timeLeft
            if (task.status === "Completed") {
              return task; // Keep as is
            }

            // If accepted but not completed => normal countdown
            let updated = { ...task };

            // (1) Deadline
            if (task.deadline) {
              const deadlineDate = new Date(task.deadline);
              const now = new Date();
              const deadlineTimestamp = deadlineDate.setHours(23, 59, 59, 999);
              const isPastDeadline = deadlineTimestamp < now.getTime();

              if (isPastDeadline) {
                updated.timeRemaining = "Expired";
                updated.urgencyLevel = "critical";
              } else {
                const { time, urgencyLevel } =
                  calculateTimeRemaining(deadlineTimestamp);
                updated.timeRemaining = time;
                updated.urgencyLevel = urgencyLevel;
              }
            } else {
              updated.timeRemaining = "N/A";
              updated.urgencyLevel = "low";
            }

            // (2) Estimated
            if (task.estimatedHours && updated.timeRemaining !== "Expired") {
              const estKey = `estimatedDeadline_${task._id}`;
              let estDeadline = parseInt(localStorage.getItem(estKey) || "0");

              if (estDeadline) {
                const { time, urgencyLevel } =
                  calculateTimeRemaining(estDeadline);
                updated.estimatedTimeRemaining = time;
                updated.estimatedUrgencyLevel = urgencyLevel;
              } else {
                updated.estimatedTimeRemaining = "Expired";
                updated.estimatedUrgencyLevel = "critical";
              }
            } else {
              updated.estimatedTimeRemaining = "N/A";
              updated.estimatedUrgencyLevel = "low";
            }

            // (3) Consolidate display
            if (task.estimatedHours && updated.timeRemaining !== "Expired") {
              updated.displayTimeRemaining = updated.estimatedTimeRemaining;
              updated.displayUrgencyLevel = updated.estimatedUrgencyLevel;
            } else if (task.deadline) {
              updated.displayTimeRemaining = updated.timeRemaining;
              updated.displayUrgencyLevel = updated.urgencyLevel;
            } else {
              updated.displayTimeRemaining = "N/A";
              updated.displayUrgencyLevel = "low";
            }

            return updated;
          })
          .sort((a, b) => b._id.localeCompare(a._id))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [addNotification]);

  // Notification logic
  const isNotificationDeleted = (hash: number): boolean => false;
  const markNotificationAsNotified = (taskId: string, threshold: number) => {
    localStorage.setItem(
      `notification_${getNotificationHash(taskId, threshold)}`,
      "true"
    );
  };
  const hasNotificationBeenNotified = (
    taskId: string,
    threshold: number
  ): boolean => {
    return (
      localStorage.getItem(
        `notification_${getNotificationHash(taskId, threshold)}`
      ) === "true"
    );
  };
  const addUniqueNotification = (
    message: string,
    type: "success" | "error" | "info" | "warning",
    taskId: string,
    threshold: number
  ) => {
    if (!hasNotificationBeenNotified(taskId, threshold)) {
      addNotification(message, type);
      markNotificationAsNotified(taskId, threshold);
    }
  };

  const fetchRemarks = async (taskId: string) => {
    try {
      const response = await axios.get(
        `https://ets-node-1.onrender.com/api/remarks/${taskId}`
      );
      setRemarks(response.data.remarks);
    } catch (error) {
      console.error("Error fetching remarks:", error);
      addNotification(
        "Failed to fetch remarks. Please try again later.",
        "error"
      );
    }
  };

  const handleRowSelection = (newSelection: GridSelectionModel) => {
    setSelectedRows(newSelection as string[]);
  };

  const handleOpenDialog = (task: Task) => {
    setSelectedTask(task);
    fetchRemarks(task._id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddNotes = async () => {
    if (newRemark.trim()) {
      try {
        if (selectedTask) {
          await axios.put(`https://ets-node-1.onrender.com/api/Employee/notes`, {
            id: selectedTask._id,
            note: newRemark,
          });

          setRemarks((prev) => [...prev, newRemark]);
          setNewRemark("");
          addNotification("Note added successfully!", "success");
        }
      } catch (error) {
        console.error("Error adding note:", error);
        addNotification("Failed to add note. Please try again.", "error");
      } finally {
        handleCloseDialog();
        if (userName) {
          fetchTasks(userName);
        }
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "acceptTask",
      headerName: "Accept?",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const task = params.row as Task;
        const isAccepted = !!task.accepted;
        const isCompleted = task.status === "Completed";

        // Show "Accept" if not accepted and not completed
        if (!isAccepted && !isCompleted) {
          return (
            <MuiButton
              variant="contained"
              color="success"
              onClick={() => handleAcceptTask(task)}
            >
              Accept
            </MuiButton>
          );
        }

        if (isAccepted && !isCompleted) {
          return <span style={{ color: "green" }}>Accepted</span>;
        }
        if (isCompleted) {
          return <span style={{ color: "blue" }}>Completed</span>;
        }

        // default
        return "";
      },
    },
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 2,
      minWidth: 150,
      renderCell: (params) => (
        <div
          onClick={() => handleOpenDialog(params.row)}
          style={{ cursor: "pointer", color: "#1e90ff" }}
        >
          {params.value}
        </div>
      ),
    },
    { field: "taskName", headerName: "Task Name", flex: 2, minWidth: 150 },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <TaskPriorityBadge priority={params.value as Priority} />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1.5,
      minWidth: 130,
      renderCell: (params) => (
        <TaskStatusBadge status={params.value as Status} />
      ),
    },
    {
      field: "remarks",
      headerName: "Remarks",
      flex: 2.5,
      minWidth: 200,
      renderCell: (params) =>
        params.value && params.value.length > 0
          ? params.value.join(", ")
          : "No Remarks",
    },
    {
      field: "estimatedHours",
      headerName: "Estimated Hours",
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) =>
        params.value ? `${params.value.toFixed(2)} hrs` : "Not Required",
    },
    {
      field: "deadline",
      headerName: "Deadline",
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <div className="text-sm text-gray-500 mt-4">
          {params.value ? format(new Date(params.value), "MM/dd/yyyy") : "N/A"}
        </div>
      ),
    },
    {
      field: "timeRemaining",
      headerName: "Time Remaining",
      flex: 2,
      minWidth: 200,
      renderCell: (params) => {
        const { displayTimeRemaining, displayUrgencyLevel, status } =
          params.row as Task;

        // If completed => "Completed"
        if (status === "Completed") {
          return <span style={{ color: "#4A5568" }}>Completed</span>;
        }

        let colorClass = "text-green-500";
        if (displayUrgencyLevel === "high") {
          colorClass = "text-yellow-500";
        } else if (displayUrgencyLevel === "critical") {
          colorClass = "text-red-500 animate-pulse";
        }

        return (
          <div className={`text-sm font-medium ${colorClass} mt-4 ml-2`}>
            {displayTimeRemaining}
            {displayUrgencyLevel === "critical" && (
              <AlertTriangle className="inline h-4 w-4 ml-1 animate-bounce" />
            )}
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <MuiButton
          variant="outlined"
          color="primary"
          onClick={() => handleOpenDialog(params.row)}
          sx={{
            borderColor: "skyblue",
            "&:hover": {
              borderColor: "skyblue",
            },
            "&.MuiButton-outlined": {
              borderColor: "skyblue",
            },
          }}
        >
          Add Note →
        </MuiButton>
      ),
    },
    {
      field: "updateStatus",
      headerName: "Update Status",
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <MuiButton
          variant="outlined"
          color="secondary"
          onClick={() => handleStatusChange(params.row)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 1,
            ml: 4,
          }}
        >
          <EditIcon />
        </MuiButton>
      ),
    },
    {
      field: "view",
      headerName: "View",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const isClickable =
          params.row.droneRequired === "Yes" ||
          params.row.dgpsRequired === "Yes"
            ? "yes"
            : null;
        return (
          <MuiButton
            variant="outlined"
            color="secondary"
            onClick={() => {
              if (isClickable) {
                setSelectedTask(params.row);
                setIsDrawerOpen(true);
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              mt: 1,
            }}
            disabled={!isClickable}
          >
            <Eye className="h-5 w-5" />
            <span>View</span>
          </MuiButton>
        );
      },
    },
  ];

  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const TaskCard = ({ task }: { task: Task }) => {
    const isExpanded = expandedTask === task._id;

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setExpandedTask(isExpanded ? null : task._id)}
        >
          <div>
            <h3 className="font-semibold text-lg">{task.taskName}</h3>
            <p className="text-sm text-gray-600">{task.projectName}</p>
          </div>
          <ChevronDown
            className={`transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Always visible content */}
        <div className="mt-2 flex flex-wrap gap-2">
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </div>

        {/* Expandable content */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-medium">
                  {task.deadline
                    ? format(new Date(task.deadline), "MM/dd/yyyy")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p
                  className={cn(
                    "font-medium",
                    task.displayUrgencyLevel === "critical"
                      ? "text-red-500"
                      : task.displayUrgencyLevel === "high"
                      ? "text-yellow-500"
                      : "text-green-500"
                  )}
                >
                  {task.displayTimeRemaining}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-sm">{task.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {!task.accepted && task.status !== "Completed" && (
                <MuiButton
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcceptTask(task);
                  }}
                >
                  Accept
                </MuiButton>
              )}

              <MuiButton
                variant="outlined"
                color="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDialog(task);
                }}
              >
                Add Note
              </MuiButton>

              <MuiButton
                variant="outlined"
                color="secondary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task);
                }}
              >
                Update Status
              </MuiButton>

              <MuiButton
                variant="outlined"
                color="info"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTask(task);
                  setIsDrawerOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </MuiButton>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      const lowerCaseTerm = searchTerm.toLowerCase();
      const filtered = tasks.filter((task) =>
        Object.values(task).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(lowerCaseTerm)
        )
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [searchTerm, tasks]);

  return (
    <div className="p-4">
      <div className="relative mb-4 flex items-center justify-between">
        {/* Search Icon */}
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-500" />
        </span>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className=" pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Clear className="text-gray-500 hover:text-gray-700" />
          </button>
        )}
      </div>
      {loading ? (
        <Box className="flex justify-center items-center h-[300px]">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <div style={{ minWidth: "1700px" }}>
              <DataGrid
                rows={filteredTasks}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                getRowId={(row) => row._id}
                checkboxSelection
                onSelectionModelChange={handleRowSelection}
                selectionModel={selectedRows}
                autoHeight
                sx={{
                  "& .MuiDataGrid-root": {
                    overflowX: "auto",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f0f4f8",
                    color: "#333",
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-cell": {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        </>
      )}

      {/* Task Details Dialog */}
      {/* Task Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-start justify-between">
              {/* Title and Status Side by Side */}
              <div className="flex items-center space-x-4">
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                  Task Details
                </DialogTitle>
                {/* Status Display */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Status:
                  </span>
                  <TaskStatusBadge status={selectedTask?.status || "Pending"} />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => {
                  handleCloseDialog();
                  setNewRemark("");
                  setRemarks([]);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </DialogHeader>
          <Separator className="my-4" />
          <ScrollArea className="px-6 pb-6 max-h-[calc(80vh-8rem)]">
            <div className="grid gap-6">
              {/* Console log for debugging */}
              {selectedTask &&
                console.log(
                  `Dialog - Selected Task ID: ${selectedTask._id}, Estimated Hours: ${selectedTask.estimatedHours}`
                )}

              {/* Task Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <TaskDetailItem
                  label="Project Name"
                  value={selectedTask?.projectName || "N/A"}
                />
                <TaskDetailItem
                  label="Task Name"
                  value={selectedTask?.taskName || "N/A"}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
              <TaskDetailItem
  label="Employees"
  value={
    selectedTask?.employees?.length > 0 
      ? selectedTask.employees.join(", ") 
      : "N/A"
  }
/>

                <TaskDetailItem
                  label="Deadline"
                  value={
                    selectedTask?.deadline
                      ? format(new Date(selectedTask.deadline), "MM/dd/yyyy")
                      : "N/A"
                  }
                />
                <TaskDetailItem
                  label="Estimated Hours"
                  value={
                    selectedTask?.estimatedHours > 0
                      ? `${selectedTask.estimatedHours.toFixed(3)} hrs`
                      : "Not Required"
                  }
                />
                <TaskDetailItem
                  label="Time Remaining"
                  value={selectedTask?.displayTimeRemaining || "Not Applicable"}
                  valueColor={
                    selectedTask?.displayUrgencyLevel === "critical"
                      ? "text-red-500"
                      : selectedTask?.displayUrgencyLevel === "high"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }
                />
              </div>

              {/* Priority */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Priority
                  </span>
                  <div className="pt-1">
                    <TaskPriorityBadge
                      priority={selectedTask?.priority || "Low"}
                    />
                  </div>
                </div>
              </div>

              {/* Completed At */}
              {selectedTask?.status === "Completed" && (
                <>
                  <TaskDetailItem
                    label="Completed At"
                    value={
                      selectedTask.completedAt
                        ? format(
                            new Date(selectedTask.completedAt),
                            "MM/dd/yyyy HH:mm a"
                          )
                        : "Not Recorded"
                    }
                  />
                </>
              )}

              {/* Description */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Description
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {selectedTask?.description || "No description available"}
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Notes
                </span>
                <div className="space-y-2">
                  {selectedTask?.notes && selectedTask.notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No notes yet
                    </p>
                  ) : (
                    selectedTask?.notes?.map((note, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded-md">
                        <p>{note}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Notes */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Add Notes *
                </span>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={4}
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  placeholder="Type your notes here..."
                />
              </div>

              {/* Send Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleAddNotes}
                  className="relative px-6 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 hover:scale-105 transition-all duration-200"
                >
                  <span className="inline-flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 12h16.5m0 0-6.75-6.75M20.25 12l-6.75 6.75"
                      />
                    </svg>
                    <span>Send</span>
                  </span>
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* UpdateStatusModal => for changing task status */}
      <UpdateStatusModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        taskId={selectedTaskForStatus?._id || ""}
        currentStatus={selectedTaskForStatus?.status || "Pending"}
        fetchTasks={() => {
          if (userName) {
            fetchTasks(userName);
          }
        }}
      />

      {/* Optional Task Drawer */}
      {selectedTask && (
        <TaskDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default TaskViewEmployee;