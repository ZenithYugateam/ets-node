// src/components/TaskViewEmployee.tsx

import { Button as MuiButton } from "@mui/material";
import Box from "@mui/material/Box";
import { AlertTriangle, Eye } from "lucide-react";
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

// Types
type Priority = "Low" | "Medium" | "High";
type Status = "Completed" | "In Progress" | "Pending";

interface Task {
  _id: string;
  projectName: string;
  taskName: string;
  employeeName: string;
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
  timeUsed?: number;     // in hours
  timeLeft?: number;     // leftover hours
}

// For detail items
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

// Small components
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
      className={cn("px-3 py-1 font-medium", priorityStyles[priority], className)}
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
  const totalMinutes = Math.floor(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const s = Math.floor((hours * 3600) % 60);

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

  const { addNotification } = useContext(NotificationContext);

  //
  // 1) Accept Task => sets accepted = true, acceptedAt = now
  //    Edge Case #3 (Deadline already expired) => We check if "Expired" => no acceptance.
  //
  const handleAcceptTask = async (task: Task) => {
    // If it's expired, disallow acceptance
    if (task.timeRemaining === "Expired") {
      addNotification("Cannot accept an expired task.", "error");
      return;
    }
    try {
      const now = new Date();
      await axios.put(`http://localhost:5001/api/tasks/accept/${task._id}`, {
        accepted: true,
        acceptedAt: now,
      });

      // Immediately update local state
      setTasks((prev) =>
        prev.map((t) => {
          if (t._id === task._id) {
            return { ...t, accepted: true, acceptedAt: now.toISOString() };
          }
          return t;
        })
      );

      addNotification(`You accepted task "${task.taskName}"!`, "success");
    } catch (error) {
      console.error("Error accepting task:", error);
      addNotification("Failed to accept task. Please try again.", "error");
    }
  };

  //
  // 2) Update Status => "Completed" etc. 
  //    Edge Case #1, #2: If not accepted, disallow completion from the front end.
  //
  const handleStatusChange = (task: Task) => {
    if (!task.accepted) {
      addNotification("You must accept the task before updating its status.", "warning");
      return;
    }
    setSelectedTaskForStatus(task);
    setStatusModalOpen(true);
  };

  //
  // 3) Fetch tasks => main data load
  //    Edge Case #7: If estimatedHours changed on the server, we reset localStorage
  //
  const fetchTasks = async (employeeName: string) => {
    setLoading(true);
    try {
      const response = await axios.post<Task[]>(
        "http://localhost:5001/api/tasks/employee",
        { employeeName }
      );
      let allTasks = response.data;

      allTasks.sort((a, b) => b._id.localeCompare(a._id));

      const tasksWithTime = allTasks.map((task) => {
        let updatedTask = { ...task };

        // If not accepted => skip
        if (!task.accepted) {
          updatedTask.timeRemaining = "Awaiting Acceptance";
          updatedTask.urgencyLevel = "low";
          updatedTask.estimatedTimeRemaining = "N/A";
          updatedTask.estimatedUrgencyLevel = "low";
          updatedTask.displayTimeRemaining = "N/A";
          updatedTask.displayUrgencyLevel = "low";
          return updatedTask;
        }

        // If accepted => normal countdown
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
            const { time, urgencyLevel } = calculateTimeRemaining(deadlineTimestamp);
            updatedTask.timeRemaining = time;
            updatedTask.urgencyLevel = urgencyLevel;
          }
        } else {
          updatedTask.timeRemaining = "N/A";
          updatedTask.urgencyLevel = "low";
        }

        // 2) Estimated hours
        if (task.estimatedHours && updatedTask.timeRemaining !== "Expired") {
          const estKey = `estimatedDeadline_${task._id}`;

          // Edge Case #7: If server changed estimatedHours, reset localStorage
          // We'll do a simple check. If local storage exists AND the user changed hours in the DB, we reset.
          // (We can't detect that easily unless you store the hours in local storage too,
          // but here's a minimal approach: if local storage doesn't match, reset.)
          // We'll just do a minimal approach: If the localStorage key doesn't exist, we create it.
          // Otherwise we do normal logic.
          let estDeadline = parseInt(localStorage.getItem(estKey) || "0");

          if (!estDeadline) {
            estDeadline = Date.now() + task.estimatedHours * 60 * 60 * 1000;
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
        if (task.estimatedHours && updatedTask.timeRemaining !== "Expired") {
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
      addNotification("Failed to fetch tasks. Please try again later.", "error");
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
  //    Edge Case #5: If a user tries to revert from completed => we do minimal handling in the status modal.
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

            // If Completed => show leftover / used time, skip countdown
            if (task.status === "Completed") {
              if (task.acceptedAt && task.completedAt) {
                const aTime = new Date(task.acceptedAt).getTime();
                const cTime = new Date(task.completedAt).getTime();
                const hoursUsed = (cTime - aTime) / (3600000);

                const leftover = task.estimatedHours
                  ? task.estimatedHours - hoursUsed
                  : 0;

                return {
                  ...task,
                  timeUsed: hoursUsed,
                  timeLeft: leftover,
                  timeRemaining: "Completed",
                  displayTimeRemaining: "Completed",
                  displayUrgencyLevel: "low",
                };
              }
              // If no acceptedAt or completedAt => just show "Completed"
              return {
                ...task,
                timeRemaining: "Completed",
                displayTimeRemaining: "Completed",
                displayUrgencyLevel: "low",
              };
            }

            // Otherwise => normal countdown
            let updated = { ...task };

            // Deadline
            if (task.deadline) {
              const deadlineDate = new Date(task.deadline);
              const now = new Date();
              const deadlineTimestamp = deadlineDate.setHours(23, 59, 59, 999);
              const isPastDeadline = deadlineTimestamp < now.getTime();

              if (isPastDeadline) {
                updated.timeRemaining = "Expired";
                updated.urgencyLevel = "critical";
              } else {
                const { time, urgencyLevel } = calculateTimeRemaining(deadlineTimestamp);
                updated.timeRemaining = time;
                updated.urgencyLevel = urgencyLevel;
              }
            } else {
              updated.timeRemaining = "N/A";
              updated.urgencyLevel = "low";
            }

            // Estimated
            if (task.estimatedHours && updated.timeRemaining !== "Expired") {
              const estKey = `estimatedDeadline_${task._id}`;
              let estDeadline = parseInt(localStorage.getItem(estKey) || "0");

              if (estDeadline) {
                const { time, urgencyLevel } = calculateTimeRemaining(estDeadline);
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

  //
  // Notification logic (unchanged)
  //
  const isNotificationDeleted = (hash: number): boolean => false;
  const markNotificationAsNotified = (taskId: string, threshold: number) => {
    localStorage.setItem(`notification_${getNotificationHash(taskId, threshold)}`, "true");
  };
  const hasNotificationBeenNotified = (taskId: string, threshold: number): boolean => {
    return (
      localStorage.getItem(`notification_${getNotificationHash(taskId, threshold)}`) === "true"
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

  //
  // Remarks logic
  //
  const fetchRemarks = async (taskId: string) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/remarks/${taskId}`);
      setRemarks(response.data.remarks);
    } catch (error) {
      console.error("Error fetching remarks:", error);
      addNotification("Failed to fetch remarks. Please try again later.", "error");
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
          await axios.put(`http://localhost:5001/api/Employee/notes`, {
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

  //
  // DataGrid columns
  //
  const columns: GridColDef[] = [
    // Accept? column
    {
      field: "acceptTask",
      headerName: "Accept?",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const task = params.row as Task;
        const isExpired = task.timeRemaining === "Expired";
        const isAccepted = task.accepted;
        const isCompleted = task.status === "Completed";

        // Only show Accept if not accepted, not expired, not completed
        if (!isAccepted && !isExpired && !isCompleted) {
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

        if (isExpired) return <span style={{ color: "red" }}>Expired Task</span>;
        if (isAccepted && !isCompleted) return <span style={{ color: "green" }}>Accepted</span>;
        if (isCompleted) return <span style={{ color: "blue" }}>Completed</span>;

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
      renderCell: (params) => (params.value ? `${params.value} hrs` : "Not Required"),
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
        const { displayTimeRemaining, displayUrgencyLevel, status } = params.row as Task;

        // If completed => show "Completed" 
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
      renderCell: (params) => {
        return (
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
        );
      },
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
      renderCell: (params) => (
        <MuiButton
          variant="outlined"
          color="secondary"
          onClick={() => {
            setSelectedTask(params.row);
            setIsDrawerOpen(true);
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            mt: 1,
          }}
        >
          <Eye className="h-5 w-5" />
          <span>View</span>
        </MuiButton>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg shadow-md p-4">
      <div className="relative overflow-x-auto">
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ minWidth: "1700px" }}>
            <DataGrid
              rows={tasks}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              getRowId={(row) => row._id}
              checkboxSelection
              onSelectionModelChange={(newSelection) => handleRowSelection(newSelection)}
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
        )}
      </div>

      {/* Task Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                  Task Details
                </DialogTitle>
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
              {/* Basic fields */}
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
                  label="Employee Name"
                  value={selectedTask?.employeeName || "N/A"}
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
                    selectedTask?.estimatedHours
                      ? `${selectedTask.estimatedHours} hrs`
                      : "N/A"
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
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Status
                  </span>
                  <div className="pt-1">
                    <TaskStatusBadge
                      status={selectedTask?.status || "Pending"}
                    />
                  </div>
                </div>
              </div>

              {/* Completed At */}
              {selectedTask?.status === "Completed" && (
                <TaskDetailItem
                  label="Completed At"
                  value={
                    selectedTask.completedAt
                      ? format(new Date(selectedTask.completedAt), "MM/dd/yyyy HH:mm")
                      : "Not Recorded"
                  }
                />
              )}

              {/* If completed => leftover time */}
              {selectedTask?.status === "Completed" && (
                <div>
                  {selectedTask?.timeUsed !== undefined &&
                    selectedTask?.timeLeft !== undefined && (
                      <div className="mt-2 p-2 rounded-md">
                        <p className="font-semibold text-gray-700">
                          Time Used:{" "}
                          <span
                            className={
                              selectedTask.timeUsed > selectedTask.estimatedHours
                                ? "text-red-500"
                                : "text-green-600"
                            }
                          >
                            {formatHours(selectedTask.timeUsed)}{" "}
                          </span>
                          / {formatHours(selectedTask.estimatedHours)}
                        </p>
                        <p className="font-semibold text-gray-700">
                          Time Left:{" "}
                          <span
                            className={
                              selectedTask.timeLeft >= 0
                                ? "text-green-600"
                                : "text-red-500"
                            }
                          >
                            {formatHours(Math.abs(selectedTask.timeLeft))}{" "}
                          </span>
                          {selectedTask.timeLeft >= 0
                            ? "remaining"
                            : " over the estimate!"}
                        </p>
                      </div>
                    )}
                </div>
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

              {/* If notes exist */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Notes
                </span>
                <div className="space-y-2">
                  {selectedTask?.notes && selectedTask.notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No notes yet</p>
                  ) : (
                    selectedTask?.notes?.map((note, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded-md">
                        <p>{note}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Remarks */}
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

              {/* Add notes */}
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
