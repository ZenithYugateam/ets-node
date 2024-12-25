// src/components/TaskManager.tsx

import React, { useEffect, useState, useContext } from "react";
import { AlertTriangle, Clock } from "lucide-react"; // Import icons
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import { NotificationContext } from "../context/NotificationContext"; // Import NotificationContext
import { format } from "date-fns";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, CircularProgress, Select, MenuItem } from "@mui/material";

interface AuthContextType {
  userId: string;
  role: string;
  userName: string;
}

interface Task {
  _id: string;
  title: string;
  priority: Priority;
  deadline: string; // Deadline as a string
  status: Status;
  department: string;
  description: string;
  assignee: {
    userId?: {
      _id: string;
      name: string;
    };
    name: string;
    avatar: string;
  };
  timeRemaining?: string; // Optional field for remaining time
  urgencyLevel?: UrgencyLevel; // Optional field for urgency level (e.g., "high", "medium", "low")
  notified12?: boolean; // Flag for 12-hour reminder
  notified6?: boolean;  // Flag for 6-hour reminder
  notified3?: boolean;  // Flag for 3-hour reminder
  completedAt?: string; // New field for completion time
  timeToComplete?: string; // New field for time difference
}

type Priority = "High" | "Medium" | "Low";
type Status = "In Progress" | "Completed" | "Pending" | "Cancelled" | "Accepted";
type UrgencyLevel = "high" | "critical" | "low";

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksWithTime, setTasksWithTime] = useState<Task[]>([]); // Define tasksWithTime state
  const [filter, setFilter] = useState("All Tasks");
  const [isLoading, setIsLoading] = useState(false);
  const authContext = useContext<AuthContextType>(AuthContext);
  const managerId = authContext.userId;
  const { addNotification } = useContext(NotificationContext); // Access addNotification

  // Function to calculate time remaining
  const calculateTimeRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline).setHours(23, 59, 59, 999); // Set deadline to end of the day
    const now = new Date().getTime();
    const diff = deadlineDate - now;

    if (diff <= 0) {
      return { time: "Expired", urgencyLevel: "critical" };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Define urgency levels based on remaining time
    let urgencyLevel: UrgencyLevel = "low";
    if (diff <= 24 * 60 * 60 * 1000) { // ≤ 24 hours
      urgencyLevel = "high";
    }
    if (diff <= 1 * 60 * 60 * 1000) { // ≤ 1 hour
      urgencyLevel = "critical";
    }

    return { time: `${hours}h ${minutes}m ${seconds}s`, urgencyLevel };
  };

  // Fetch tasks assigned to the manager
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Task[]>("http://localhost:5001/api/tasks");
        const allTasks = response.data;

        // Filter tasks for the current manager
        const managerTasks = allTasks.filter(
          (task) => task.assignee?.userId?._id === managerId
        );

        setTasks(managerTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        addNotification("Failed to fetch tasks. Please try again later.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [managerId, addNotification]);

  // Process tasks to include timeRemaining and timeToComplete
  useEffect(() => {
    if (tasks) {
      const processedTasks = tasks.map((task) => {
        let updatedTask = { ...task };

        // Only calculate time remaining if the task is not completed
        if (task.status !== "Completed") {
          const { time, urgencyLevel } = calculateTimeRemaining(task.deadline);
          updatedTask.timeRemaining = time;
          updatedTask.urgencyLevel = urgencyLevel;
        } else {
          // If completed, set timeRemaining and urgencyLevel to defaults
          updatedTask.timeRemaining = "Completed";
          updatedTask.urgencyLevel = "low";

          // Calculate timeToComplete
          if (task.deadline && task.completedAt) {
            const deadline = new Date(task.deadline);
            const completedAt = new Date(task.completedAt);
            const diff = completedAt.getTime() - deadline.getTime();

            const isBefore = diff <= 0;
            const absDiff = Math.abs(diff);

            const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

            updatedTask.timeToComplete = `${isBefore ? "Before" : "After"} Deadline by ${days}d ${hours}h ${minutes}m`;
          } else {
            updatedTask.timeToComplete = "N/A";
          }
        }

        return updatedTask;
      });

      // Sort tasks by createdAt in descending order to have the latest tasks first
      processedTasks.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });

      setTasksWithTime(processedTasks);
      console.log("Fetched and set tasks with timeRemaining and timeToComplete:", processedTasks);
    }
  }, [tasks]);

  // Update time remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTasksWithTime((prevTasks) =>
        prevTasks.map((task) => {
          // Only update timeRemaining if the task is not completed
          if (task.status !== "Completed") {
            const { time, urgencyLevel } = calculateTimeRemaining(task.deadline);
            return { ...task, timeRemaining: time, urgencyLevel };
          }

          // If task is completed, do not update timeRemaining
          return task;
        })
      );
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Function to handle status updates
  const handleStatusUpdate = async (_id: string, newStatus: string): Promise<void> => {
    // Find the current task
    const task = tasksWithTime.find((t) => t._id === _id);
    if (!task) {
      addNotification("Task not found.", "error");
      return;
    }

    // Optimistic update
    setTasksWithTime((prevTasks) =>
      prevTasks.map((task) =>
        task._id === _id ? { ...task, status: newStatus } : task
      )
    );

    // Determine if we need to set or reset completedAt
    const dataToUpdate: Partial<Task> = {};

    if (newStatus === "Completed" && !task.completedAt) {
      dataToUpdate.completedAt = new Date().toISOString();
    } else if (newStatus !== "Completed" && task.completedAt) {
      dataToUpdate.completedAt = null; // Reset if status is not "Completed"
    }

    try {
      const response = await axios.put(`http://localhost:5001/api/tasks/${_id}`, { status: newStatus, ...dataToUpdate });
      console.log("Status updated response:", response.data);
      addNotification(`Task "${response.data.title}" status updated to "${newStatus}".`, "success");

      // Re-process tasks to update timeToComplete if necessary
      const updatedTask: Task = response.data;
      let updatedTasks = [...tasksWithTime];
      updatedTasks = updatedTasks.map((t) => {
        if (t._id === _id) {
          if (updatedTask.status === "Completed") {
            // Calculate timeToComplete
            if (updatedTask.deadline && updatedTask.completedAt) {
              const deadline = new Date(updatedTask.deadline);
              const completedAt = new Date(updatedTask.completedAt);
              const diff = completedAt.getTime() - deadline.getTime();

              const isBefore = diff <= 0;
              const absDiff = Math.abs(diff);

              const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
              const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

              return { ...t, timeToComplete: `${isBefore ? "Before" : "After"} Deadline by ${days}d ${hours}h ${minutes}m` };
            } else {
              return { ...t, timeToComplete: "N/A" };
            }
          } else {
            return { ...t, timeToComplete: "N/A" };
          }
        }
        return t;
      });

      setTasksWithTime(updatedTasks);
    } catch (error) {
      console.error("Error updating status:", error);
      addNotification("Failed to update task status. Reverting changes.", "error");
      // If the request fails, revert the status change
      setTasksWithTime((prevTasks) =>
        prevTasks.map((task) =>
          task._id === _id ? { ...task, status: task.status, completedAt: task.completedAt } : task
        )
      );
    }
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasksWithTime.filter((task) =>
    filter === "All Tasks" || task.status === filter
  );

  // **Notification Logic**
  useEffect(() => {
    // This effect runs whenever tasks are fetched or updated
    filteredTasks.forEach((task) => {
      if (
        task.timeRemaining &&
        task.timeRemaining !== "Expired" &&
        task.timeRemaining !== "N/A" &&
        task.status !== "Completed"
      ) {
        const [hoursStr, minutesStr, secondsStr] = task.timeRemaining.split(" ");
        const hours = parseInt(hoursStr.replace("h", ""));
        const minutes = parseInt(minutesStr.replace("m", ""));
        const seconds = parseInt(secondsStr.replace("s", ""));
        const totalHours = hours + minutes / 60 + seconds / 3600;

        const notifiedKey = `notified_${task._id}`;
        const notifiedData = JSON.parse(localStorage.getItem(notifiedKey) || "{}");

        // **12 Hours Reminder**
        if (totalHours <= 12 && !notifiedData.notified12) {
          addNotification(`Reminder: Task "${task.title}" is due in less than 12 hours.`, "info");
          notifiedData.notified12 = true;
        }

        // **6 Hours Reminder**
        if (totalHours <= 6 && !notifiedData.notified6) {
          addNotification(`Urgent: Task "${task.title}" is due in less than 6 hours.`, "warning");
          notifiedData.notified6 = true;
        }

        // **3 Hours Reminder**
        if (totalHours <= 3 && !notifiedData.notified3) {
          addNotification(`Critical: Task "${task.title}" is due in less than 3 hours.`, "error");
          notifiedData.notified3 = true;
        }

        // **Update localStorage if any notification was sent**
        if (notifiedData.notified12 || notifiedData.notified6 || notifiedData.notified3) {
          localStorage.setItem(notifiedKey, JSON.stringify(notifiedData));
        }
      }
    });
  }, [filteredTasks, addNotification]);

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "title",
      headerName: "Task Title",
      flex: 2,
      minWidth: 200,
    },
    {
      field: "assignee",
      headerName: "Assignee",
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Task["assignee"]>) => {
        const assignee = params.value;
        if (!assignee) return "Unassigned";

        return (
          <div className="flex items-center space-x-2">
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="h-8 w-8 rounded-full"
            />
            <span>{assignee.name}</span>
          </div>
        );
      },
    },
    {
      field: "deadline",
      headerName: "Deadline",
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center text-sm text-gray-500 mt-4">
          <Clock className="h-4 w-4 mr-1" />
          {params.value ? format(new Date(params.value), "P") : "N/A"}
        </div>
      ),
    },
    {
      field: "timeRemaining",
      headerName: "Time Remaining",
      flex: 2,
      minWidth: 200,
      renderCell: (params) => {
        const { timeRemaining, urgencyLevel, status } = params.row;

        // If the task is completed, display "Completed" with a different style
        if (status === "Completed") {
          return (
            <div className="flex items-center text-sm font-medium text-green-700 mt-4 ml-2">
              Completed
            </div>
          );
        }

        let colorClass = "text-green-500";

        if (urgencyLevel === "high") {
          colorClass = "text-yellow-500";
        } else if (urgencyLevel === "critical") {
          colorClass = "text-red-500 animate-pulse";
        }

        return (
          <div className={`flex items-center text-sm font-medium ${colorClass}`}>
            {timeRemaining}
            {urgencyLevel === "critical" && (
              <AlertTriangle className="inline h-4 w-4 ml-1 animate-bounce" />
            )}
          </div>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            params.value === "High"
              ? "bg-red-100 text-red-800"
              : params.value === "Medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Select
          value={params.value}
          onChange={(e) => handleStatusUpdate(params.row._id, e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Cancelled">Cancelled</MenuItem>
          <MenuItem value="Accepted">Accepted</MenuItem>
        </Select>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      minWidth: 250,
    },
    {
      field: "completedAt",
      headerName: "Completed At",
      flex: 2,
      minWidth: 200,
      renderCell: (params) => {
        const completedAt = params.value;
        if (!completedAt) return "N/A";

        const date = new Date(completedAt);
        return (
          <div className="flex items-center text-sm text-gray-700 mt-4">
            {format(date, "Pp")}
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Task Overview</h2>
        <div className="flex items-center space-x-2">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            variant="outlined"
            size="small"
          >
            <MenuItem value="All Tasks">All Tasks</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>
        </div>
      </div>

      {/* Projects DataGrid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        </div>
      ) : (
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredTasks}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row._id}
            disableSelectionOnClick
            sx={{
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
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
              },
            }}
          />
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && <div className="spinner">Loading...</div>}
      {/* Removed ToastContainer */}
    </div>
  );
};

export default TaskManager;
