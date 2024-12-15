// src/components/TaskViewEmployee.tsx

import { Button as MuiButton } from "@mui/material";
import Box from "@mui/material/Box";
import { AlertTriangle, Eye } from "lucide-react"; // Import icons
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid, GridColDef, GridSelectionModel } from "@mui/x-data-grid";
import axios from "axios";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  urgencyLevel: string; // Based on deadline
  estimatedTimeRemaining: string; // Based on estimatedHours
  estimatedUrgencyLevel: string; // Based on estimatedHours
  displayTimeRemaining: string; // New field for consolidated time remaining
  displayUrgencyLevel: string; // New field for consolidated urgency level
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

const calculateTimeRemaining = (
  targetTime: number
): { time: string; urgencyLevel: string } => {
  const now = new Date().getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { time: "Expired", urgencyLevel: "critical" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Define urgency levels based on remaining time
  const urgencyLevel = hours < 24 ? "high" : "low";

  return { time: `${hours}h ${minutes}m ${seconds}s`, urgencyLevel };
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

  // State to store estimatedDeadlines to prevent resetting on re-fetch
  const [estimatedDeadlines, setEstimatedDeadlines] = useState<{
    [key: string]: number;
  }>({});

  const handleStatusChange = (task: Task) => {
    setSelectedTaskForStatus(task);
    setStatusModalOpen(true);
  };

  const fetchTasks = async (employeeName: string) => {
    setLoading(true);
    try {
      const response = await axios.post<Task[]>(
        "http://localhost:5001/api/tasks/employee",
        { employeeName }
      );
      let allTasks = response.data;

      // Sort tasks by _id in descending order to have the latest tasks first
      allTasks.sort((a, b) => b._id.localeCompare(a._id));

      // Add timeRemaining and urgencyLevel based on estimatedHours or deadline
      const tasksWithTime = allTasks.map((task) => {
        let updatedTask = { ...task };

        // Handle Deadline
        if (task.deadline) {
          const deadlineTime = new Date(task.deadline).setHours(23, 59, 59);
          const { time, urgencyLevel } = calculateTimeRemaining(deadlineTime);
          updatedTask.timeRemaining = time;
          updatedTask.urgencyLevel = urgencyLevel;
        } else {
          updatedTask.timeRemaining = "N/A";
          updatedTask.urgencyLevel = "low";
        }

        // Handle Estimated Hours
        if (task.estimatedHours) {
          const estimatedDeadlineKey = `estimatedDeadline_${task._id}`;
          let estimatedDeadline = parseInt(
            localStorage.getItem(estimatedDeadlineKey) || "0"
          );

          if (!estimatedDeadline) {
            // Set estimatedDeadline only once
            estimatedDeadline =
              new Date().getTime() + task.estimatedHours * 60 * 60 * 1000;
            localStorage.setItem(
              estimatedDeadlineKey,
              estimatedDeadline.toString()
            );
            console.log(
              `Set new estimatedDeadline for task ${task._id}: ${estimatedDeadline}`
            );
          } else {
            console.log(
              `Using existing estimatedDeadline for task ${task._id}: ${estimatedDeadline}`
            );
          }

          const { time, urgencyLevel } = calculateTimeRemaining(
            estimatedDeadline
          );
          updatedTask.estimatedTimeRemaining = time;
          updatedTask.estimatedUrgencyLevel = urgencyLevel;

          // Update the estimatedDeadlines state
          setEstimatedDeadlines((prev) => ({
            ...prev,
            [task._id]: estimatedDeadline,
          }));
        } else {
          updatedTask.estimatedTimeRemaining = "N/A";
          updatedTask.estimatedUrgencyLevel = "low";
        }

        // Determine displayTimeRemaining and displayUrgencyLevel
        if (task.estimatedHours) {
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
      console.log("Fetched and set tasks with timeRemaining:", tasksWithTime);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks. Please try again later.", {
        position: "top-right",
        autoClose: 5001,
      });
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

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks
          .map((task) => {
            let updatedTask = { ...task };

            // Update Deadline Time Remaining
            if (task.deadline) {
              const deadlineTime = new Date(task.deadline).setHours(23, 59, 59);
              const { time, urgencyLevel } = calculateTimeRemaining(deadlineTime);
              updatedTask.timeRemaining = time;
              updatedTask.urgencyLevel = urgencyLevel;
            } else {
              updatedTask.timeRemaining = "N/A";
              updatedTask.urgencyLevel = "low";
            }

            // Update Estimated Time Remaining
            if (task.estimatedHours) {
              const estimatedDeadlineKey = `estimatedDeadline_${task._id}`;
              let estimatedDeadline = parseInt(
                localStorage.getItem(estimatedDeadlineKey) || "0"
              );

              if (estimatedDeadline) {
                const { time, urgencyLevel } = calculateTimeRemaining(
                  estimatedDeadline
                );
                updatedTask.estimatedTimeRemaining = time;
                updatedTask.estimatedUrgencyLevel = urgencyLevel;
              } else {
                updatedTask.estimatedTimeRemaining = "N/A";
                updatedTask.estimatedUrgencyLevel = "low";
              }
            } else {
              updatedTask.estimatedTimeRemaining = "N/A";
              updatedTask.estimatedUrgencyLevel = "low";
            }

            // Determine displayTimeRemaining and displayUrgencyLevel
            if (task.estimatedHours) {
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
          })
          .sort((a, b) => b._id.localeCompare(a._id)) // Maintain sort order
      );
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchRemarks = async (taskId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/remarks/${taskId}`
      );
      setRemarks(response.data.remarks);
      console.log(`Fetched remarks for task ${taskId}:`, response.data.remarks);
    } catch (error) {
      console.error("Error fetching remarks:", error);
      toast.error("Failed to fetch remarks. Please try again later.", {
        position: "top-right",
        autoClose: 5001,
      });
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

          setRemarks((prevRemarks) => [...prevRemarks, newRemark]);
          setNewRemark("");

          toast.success("Note added successfully!", {
            position: "top-right",
            autoClose: 5001,
          });
          console.log(`Added new remark to task ${selectedTask._id}: ${newRemark}`);
        }
      } catch (error) {
        console.error("Error adding note:", error);
        toast.error("Failed to add note. Please try again.", {
          position: "top-right",
          autoClose: 5001,
        });
      } finally {
        handleCloseDialog();
        if (userName) {
          fetchTasks(userName);
        }
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "projectName", headerName: "Project Name", flex: 2, minWidth: 150 },
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
        <div className="text-sm text-gray-500 mt-4"> {/* Adjusted margin */}
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
            mt: 1, // Adds top margin
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
          <div style={{ minWidth: "1700px" }}> {/* Increased minWidth to accommodate new column */}
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
                  strokeWidth="2"
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
                {/* Consolidated Time Remaining */}
                <TaskDetailItem
                  label="Time Remaining"
                  value={
                    selectedTask?.displayTimeRemaining || "Not Applicable"
                  }
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

              {/* New Section for Notes */}
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

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <UpdateStatusModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        taskId={selectedTaskForStatus?._id || ""}
        currentStatus={selectedTaskForStatus?.status || "Pending"}
        fetchTasks={() => {
          if (userName) {
            fetchTasks(userName); // Re-fetch tasks after updating the status
          }
        }}
      />

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