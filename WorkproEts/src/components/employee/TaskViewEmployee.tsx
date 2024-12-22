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
import { NotificationContext } from "../context/NotificationContext"; // Import NotificationContext

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
  estimatedDeadline?: number; // Timestamp when estimated time ends
  timeRemaining: string; // Based on deadline
  urgencyLevel: UrgencyLevel; // Based on deadline
  estimatedTimeRemaining: string; // Based on estimatedHours
  estimatedUrgencyLevel: UrgencyLevel; // Based on estimatedHours
  displayTimeRemaining: string; // New field for consolidated time remaining
  displayUrgencyLevel: UrgencyLevel; // New field for consolidated urgency level
  notified12?: boolean;
  notified6?: boolean;
  notified3?: boolean;
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

// Utility function to generate a unique hash for each notification based on task ID and threshold
const getNotificationHash = (taskId: string, threshold: number): number => {
  return `${taskId}_${threshold}`.hashCode();
};

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

  const { addNotification } = useContext(NotificationContext); // Access addNotification

  const handleStatusChange = (task: Task) => {
    setSelectedTaskForStatus(task);
    setStatusModalOpen(true);
  };

  // Function to fetch and process tasks
  const fetchTasks = async (employeeName: string) => {
    setLoading(true);
    try {
      const response = await axios.post<Task[]>(
        "http://localhost:5000/api/tasks/employee",
        { employeeName }
      );
      let allTasks = response.data;

      // Sort tasks by _id in descending order to have the latest tasks first
      allTasks.sort((a, b) => b._id.localeCompare(a._id));

      // Add timeRemaining and urgencyLevel based on deadline and estimatedHours
      const tasksWithTime = allTasks.map((task) => {
        let updatedTask = { ...task };

        // **1. Check if Deadline is in the Past**
        if (task.deadline) {
          const deadlineDate = new Date(task.deadline);
          const now = new Date();
          const deadlineTimestamp = deadlineDate.setHours(23, 59, 59, 999);
          const isPastDeadline = deadlineTimestamp < now.getTime();

          if (isPastDeadline) {
            // **If Deadline is Past, Mark as Expired**
            updatedTask.timeRemaining = "Expired";
            updatedTask.urgencyLevel = "critical";
          } else {
            // **If Deadline is Future, Calculate Remaining Time**
            const { time, urgencyLevel } =
              calculateTimeRemaining(deadlineTimestamp);
            updatedTask.timeRemaining = time;
            updatedTask.urgencyLevel = urgencyLevel;
          }
        } else {
          // **No Deadline, Set Defaults**
          updatedTask.timeRemaining = "N/A";
          updatedTask.urgencyLevel = "low";
        }

        // **2. Handle Estimated Hours Only if Deadline is Not Expired**
        if (task.estimatedHours && updatedTask.timeRemaining !== "Expired") {
          const estimatedDeadlineKey = `estimatedDeadline_${task._id}`;
          let estimatedDeadline = parseInt(
            localStorage.getItem(estimatedDeadlineKey) || "0"
          );

          if (!estimatedDeadline) {
            // **Set Estimated Deadline Only Once**
            estimatedDeadline =
              Date.now() + task.estimatedHours * 60 * 60 * 1000;
            localStorage.setItem(
              estimatedDeadlineKey,
              estimatedDeadline.toString()
            );
          }

          const { time, urgencyLevel } =
            calculateTimeRemaining(estimatedDeadline);
          updatedTask.estimatedTimeRemaining = time;
          updatedTask.estimatedUrgencyLevel = urgencyLevel;
        } else {
          updatedTask.estimatedTimeRemaining = "N/A";
          updatedTask.estimatedUrgencyLevel = "low";
        }

        // **3. Determine Display Fields Based on Conditions**
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

        // **4. Check and Trigger Notifications**
        if (
          updatedTask.displayTimeRemaining !== "Expired" &&
          updatedTask.displayTimeRemaining !== "N/A"
        ) {
          const [hoursStr, minutesStr, secondsStr] =
            updatedTask.displayTimeRemaining.split(" ");
          const hours = parseInt(hoursStr.replace("h", ""));
          const minutes = parseInt(minutesStr.replace("m", ""));
          const seconds = parseInt(secondsStr.replace("s", ""));
          const totalHours = hours + minutes / 60 + seconds / 3600;

          // **12 Hours Reminder**
          if (totalHours <= 12 && !updatedTask.notified12) {
            const hash = getNotificationHash(task._id, 12);
            if (!isNotificationDeleted(hash)) {
              addNotification(
                `Reminder: Task "${task.taskName}" is due in less than 12 hours.`,
                "info"
              );
              updatedTask.notified12 = true;
              markNotificationAsNotified(task._id, 12);
            }
          }

          // **6 Hours Reminder**
          if (totalHours <= 6 && !updatedTask.notified6) {
            const hash = getNotificationHash(task._id, 6);
            if (!isNotificationDeleted(hash)) {
              addNotification(
                `Urgent: Task "${task.taskName}" is due in less than 6 hours.`,
                "warning"
              );
              updatedTask.notified6 = true;
              markNotificationAsNotified(task._id, 6);
            }
          }

          // **3 Hours Reminder**
          if (totalHours <= 3 && !updatedTask.notified3) {
            const hash = getNotificationHash(task._id, 3);
            if (!isNotificationDeleted(hash)) {
              addNotification(
                `Critical: Task "${task.taskName}" is due in less than 3 hours.`,
                "error"
              );
              updatedTask.notified3 = true;
              markNotificationAsNotified(task._id, 3);
            }
          }
        }

        return updatedTask;
      });

      setTasks(tasksWithTime);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // Removed toast notifications
      addNotification(
        "Failed to fetch tasks. Please try again later.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userName) {
      fetchTasks(userName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  // **Real-Time Monitoring with Interval**
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(
        (prevTasks) =>
          prevTasks
            .map((task) => {
              let updatedTask = { ...task };

              // **1. Update Deadline Time Remaining**
              if (task.deadline) {
                const deadlineDate = new Date(task.deadline);
                const now = new Date();
                const deadlineTimestamp = deadlineDate.setHours(
                  23,
                  59,
                  59,
                  999
                );
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

              // **2. Update Estimated Time Remaining Only if Not Expired**
              if (
                task.estimatedHours &&
                updatedTask.timeRemaining !== "Expired"
              ) {
                const estimatedDeadlineKey = `estimatedDeadline_${task._id}`;
                let estimatedDeadline = parseInt(
                  localStorage.getItem(estimatedDeadlineKey) || "0"
                );

                if (estimatedDeadline) {
                  const { time, urgencyLevel } =
                    calculateTimeRemaining(estimatedDeadline);
                  updatedTask.estimatedTimeRemaining = time;
                  updatedTask.estimatedUrgencyLevel = urgencyLevel;
                } else {
                  // **If Estimated Deadline is Not Set, Mark as Expired**
                  updatedTask.estimatedTimeRemaining = "Expired";
                  updatedTask.estimatedUrgencyLevel = "critical";
                }
              } else {
                updatedTask.estimatedTimeRemaining = "N/A";
                updatedTask.estimatedUrgencyLevel = "low";
              }

              // **3. Determine Display Fields Based on Conditions**
              if (
                task.estimatedHours &&
                updatedTask.timeRemaining !== "Expired"
              ) {
                updatedTask.displayTimeRemaining =
                  updatedTask.estimatedTimeRemaining;
                updatedTask.displayUrgencyLevel =
                  updatedTask.estimatedUrgencyLevel;
              } else if (task.deadline) {
                updatedTask.displayTimeRemaining = updatedTask.timeRemaining;
                updatedTask.displayUrgencyLevel = updatedTask.urgencyLevel;
              } else {
                updatedTask.displayTimeRemaining = "N/A";
                updatedTask.displayUrgencyLevel = "low";
              }

              // **4. Check and Trigger Notifications**
              if (
                updatedTask.displayTimeRemaining !== "Expired" &&
                updatedTask.displayTimeRemaining !== "N/A"
              ) {
                const [hoursStr, minutesStr, secondsStr] =
                  updatedTask.displayTimeRemaining.split(" ");
                const hours = parseInt(hoursStr.replace("h", ""));
                const minutes = parseInt(minutesStr.replace("m", ""));
                const seconds = parseInt(secondsStr.replace("s", ""));
                const totalHours = hours + minutes / 60 + seconds / 3600;

                // **12 Hours Reminder**
                if (totalHours <= 12 && !updatedTask.notified12) {
                  const hash = getNotificationHash(task._id, 12);
                  if (!isNotificationDeleted(hash)) {
                    addNotification(
                      `Reminder: Task "${task.taskName}" is due in less than 12 hours.`,
                      "info"
                    );
                    updatedTask.notified12 = true;
                    markNotificationAsNotified(task._id, 12);
                  }
                }

                // **6 Hours Reminder**
                if (totalHours <= 6 && !updatedTask.notified6) {
                  const hash = getNotificationHash(task._id, 6);
                  if (!isNotificationDeleted(hash)) {
                    addNotification(
                      `Urgent: Task "${task.taskName}" is due in less than 6 hours.`,
                      "warning"
                    );
                    updatedTask.notified6 = true;
                    markNotificationAsNotified(task._id, 6);
                  }
                }

                // **3 Hours Reminder**
                if (totalHours <= 3 && !updatedTask.notified3) {
                  const hash = getNotificationHash(task._id, 3);
                  if (!isNotificationDeleted(hash)) {
                    addNotification(
                      `Critical: Task "${task.taskName}" is due in less than 3 hours.`,
                      "error"
                    );
                    updatedTask.notified3 = true;
                    markNotificationAsNotified(task._id, 3);
                  }
                }
              }

              return updatedTask;
            })
            .sort((a, b) => b._id.localeCompare(a._id)) // Maintain sort order
      );
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [addNotification]);

  // **Functions to Handle Notification Flags**

  // Function to check if a notification hash is in the deleted list
  const isNotificationDeleted = (hash: number): boolean => {
    return false; // Implement if you have a separate deleted hashes list
    // Currently, deletion is handled by removing the notification from the list
    // If you have a separate list of deleted notification hashes, implement this check
  };

  // Function to mark a notification as notified by updating localStorage
  const markNotificationAsNotified = (taskId: string, threshold: number) => {
    const hash = getNotificationHash(taskId, threshold);
    const notifiedKey = `notification_${hash}`;
    localStorage.setItem(notifiedKey, "true");
  };

  // Function to check if a notification has already been notified
  const hasNotificationBeenNotified = (
    taskId: string,
    threshold: number
  ): boolean => {
    const hash = getNotificationHash(taskId, threshold);
    const notifiedKey = `notification_${hash}`;
    return localStorage.getItem(notifiedKey) === "true";
  };

  // Update addNotification to prevent duplicate notifications
  const addUniqueNotification = (
    message: string,
    type: "success" | "error" | "info" | "warning",
    taskId: string,
    threshold: number
  ) => {
    const hash = getNotificationHash(taskId, threshold);
    if (!hasNotificationBeenNotified(taskId, threshold)) {
      addNotification(message, type);
      markNotificationAsNotified(taskId, threshold);
    }
  };

  // Function to fetch remarks
  const fetchRemarks = async (taskId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/remarks/${taskId}`
      );
      setRemarks(response.data.remarks);
    } catch (error) {
      console.error("Error fetching remarks:", error);
      // Removed toast notifications
      addNotification(
        "Failed to fetch remarks. Please try again later.",
        "error"
      );
    }
  };

  // Handle row selection
  const handleRowSelection = (newSelection: GridSelectionModel) => {
    setSelectedRows(newSelection as string[]);
  };

  // Open dialog to add notes
  const handleOpenDialog = (task: Task) => {
    setSelectedTask(task);
    fetchRemarks(task._id);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle adding notes
  const handleAddNotes = async () => {
    if (newRemark.trim()) {
      try {
        if (selectedTask) {
          await axios.put(`http://localhost:5000/api/Employee/notes`, {
            id: selectedTask._id,
            note: newRemark,
          });

          setRemarks((prevRemarks) => [...prevRemarks, newRemark]);
          setNewRemark("");

          // Removed toast notifications
          addNotification("Note added successfully!", "success");
        }
      } catch (error) {
        console.error("Error adding note:", error);
        // Removed toast notifications
        addNotification("Failed to add note. Please try again.", "error");
      } finally {
        handleCloseDialog();
        if (userName) {
          fetchTasks(userName);
        }
      }
    }
  };

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 2,
      minWidth: 150,
      renderCell: (params) => (
        <div
          onClick={() => handleOpenDialog(params.row)}
          style={{
            cursor: "pointer",
            color: "#1e90ff",
          }}
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
        params.value ? `${params.value} hrs` : "Not Required",
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
        const { displayTimeRemaining, displayUrgencyLevel } = params.row;
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
<div className="overflow-hidden rounded-lg shadow-md p-4" style={{ height: "100vh" }}>
    <div className="relative h-full">
      {/* DataGrid Section */}
      <div
        className={`absolute top-0 left-0 w-full h-full ${
          isDrawerOpen ? "hidden" : "block"
        }`}
      >
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
          <div style={{ height: "100%", overflowY: "auto" }} className="overflow-x-auto">
            <DataGrid
              rows={tasks}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              getRowId={(row) => row._id}
              checkboxSelection
              onSelectionModelChange={(newSelection) =>
                handleRowSelection(newSelection)
              }
              selectionModel={selectedRows}
              autoHeight={false} // Disable autoHeight for consistent scroll behavior
              sx={{
                height: "100%",
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
        <DialogContent className="max-w-full lg:max-w-3xl p-0 overflow-hidden bg-white">
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
                      : selectedTask?.deadline
                      ? "Based on Deadline"
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

              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Description
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {selectedTask?.description || "No description available"}
                </p>
              </div>

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

      {/* Task Drawer */}
      {selectedTask && (
        <TaskDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          task={selectedTask}
        />
      )}
    </div>
  </div>
  );
};

export default TaskViewEmployee;
