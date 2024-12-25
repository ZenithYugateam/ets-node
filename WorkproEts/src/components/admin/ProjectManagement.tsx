// src/components/ProjectManagement.tsx

import React, { useState, useContext, useEffect } from "react";
import { Plus, X, AlertTriangle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { createTask, getTasks, updateTask, deleteTask } from "../../api/admin";
import { toast } from "react-toastify";
import { AuthContext } from "../../AuthContext";
import { Task, Priority, Status, UrgencyLevel, TimeRemaining } from "../../types/task";
import { calculateTimeRemaining } from "../../utils/calculateTimeRemaining";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Separator } from "../../ui/Separator";
import { ScrollArea } from "../../ui/scroll-area";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, CircularProgress } from "@mui/material";

const ProjectManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { userId } = useContext(AuthContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    assignee: {
      userId: "",
      name: "",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    priority: "Medium" as Priority,
    deadline: "",
    status: "Pending" as Status,
    progress: 0,
    department: "",
    description: "",
    estimatedHours: 0,
  });

  // Fetch projects (tasks)
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery<Task[]>("tasks", async () => {
    try {
      const tasks = await getTasks();
      return tasks;
    } catch (error: any) {
      toast.error(`Failed to fetch projects: ${error.message}`);
      return [];
    }
  });

  // Fetch departments
  const {
    data: departmentsData = [],
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useQuery("departments", async () => {
    try {
      const response = await fetch("http://localhost:5001/api/departments");
      if (!response.ok) {
        throw new Error("Error fetching departments");
      }
      const data = await response.json();
      return data || []; // Ensure we return an array
    } catch (error: any) {
      toast.error(`Failed to fetch departments: ${error.message}`);
      return [];
    }
  });

  // Fetch managers based on selected department
  const {
    data: managersData = [], // Provide default empty array
    isLoading: managersLoading,
    error: managersError,
  } = useQuery(
    ["managers", formData.department],
    async () => {
      try {
        if (!formData.department) return []; // Return empty array if no department selected

        const response = await fetch(
          `http://localhost:5001/users/managers/${encodeURIComponent(
            formData.department
          )}`
        );
        if (!response.ok) {
          throw new Error("Error fetching managers");
        }
        const data = await response.json();
        return data || []; // Ensure we return an array
      } catch (error: any) {
        toast.error(`Failed to fetch managers: ${error.message}`);
        return [];
      }
    },
    {
      enabled: !!formData.department,
    }
  );

  // Mutation for creating a task
  const createMutation = useMutation(createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries("tasks");
      toast.success("Project created successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  // Mutation for updating a task
  const updateMutation = useMutation(
    ({ taskId, data }: { taskId: string; data: Partial<Task> }) =>
      updateTask(taskId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("tasks");
        toast.success("Project updated successfully");
        setIsModalOpen(false);
        setEditingTask(null);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(`Failed to update project: ${error.message}`);
      },
    }
  );

  // Mutation for deleting a task
  const deleteMutation = useMutation(deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries("tasks");
      toast.success("Project deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      assignee: {
        userId: "",
        name: "",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      priority: "Medium",
      deadline: "",
      status: "Pending",
      progress: 0,
      department: "",
      description: "",
      estimatedHours: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit: Partial<Task> = {
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
    };

    // If the status is set to "Completed" and it's a new task or status is changing to "Completed"
    if (formData.status === "Completed") {
      dataToSubmit.completedAt = new Date().toISOString();
    } else {
      dataToSubmit.completedAt = null; // Reset if status is not "Completed"
    }

    if (editingTask) {
      // Update existing project
      updateMutation.mutate({
        taskId: editingTask._id,
        data: dataToSubmit,
      });
    } else {
      // Create new project
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      assignee: task.assignee,
      priority: task.priority,
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      status: task.status,
      progress: task.progress,
      department: task.department,
      description: task.description,
      estimatedHours: task.estimatedHours,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(taskId);
    }
  };

  // Handle Time Remaining Calculation and Time to Complete
  const [tasksWithTime, setTasksWithTime] = useState<Task[]>([]);

  useEffect(() => {
    if (tasks) {
      const processedTasks = tasks.map((task) => {
        let updatedTask = { ...task };

        // Only calculate time remaining if the task is not completed
        if (task.status !== "Completed") {
          // Calculate Time Remaining based on deadline or estimatedHours
          if (task.deadline) {
            const deadlineTimestamp = new Date(task.deadline).setHours(23, 59, 59, 999);
            const deadlineCalculation: TimeRemaining = calculateTimeRemaining(
              deadlineTimestamp,
              "deadline"
            );
            updatedTask.timeRemaining = deadlineCalculation.time;
            updatedTask.urgencyLevel = deadlineCalculation.urgencyLevel;
          } else if (task.estimatedHours) {
            const estimatedDeadline = Date.now() + task.estimatedHours * 60 * 60 * 1000;
            const estimatedCalculation: TimeRemaining = calculateTimeRemaining(
              estimatedDeadline,
              "estimated"
            );
            updatedTask.timeRemaining = estimatedCalculation.time;
            updatedTask.urgencyLevel = estimatedCalculation.urgencyLevel;
          } else {
            updatedTask.timeRemaining = "N/A";
            updatedTask.urgencyLevel = "low";
          }
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

        // Determine display fields
        updatedTask.displayTimeRemaining = updatedTask.timeRemaining;
        updatedTask.displayUrgencyLevel = updatedTask.urgencyLevel;

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

  // Update Time Remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTasksWithTime((prevTasks) =>
        prevTasks.map((task) => {
          // Only update timeRemaining if the task is not completed
          if (task.status !== "Completed") {
            let updatedTask = { ...task };

            if (task.deadline) {
              const deadlineTimestamp = new Date(task.deadline).setHours(23, 59, 59, 999);
              const deadlineCalculation: TimeRemaining = calculateTimeRemaining(
                deadlineTimestamp,
                "deadline"
              );
              updatedTask.timeRemaining = deadlineCalculation.time;
              updatedTask.urgencyLevel = deadlineCalculation.urgencyLevel;
            } else if (task.estimatedHours) {
              const estimatedDeadline = Date.now() + task.estimatedHours * 60 * 60 * 1000;
              const estimatedCalculation: TimeRemaining = calculateTimeRemaining(
                estimatedDeadline,
                "estimated"
              );
              updatedTask.timeRemaining = estimatedCalculation.time;
              updatedTask.urgencyLevel = estimatedCalculation.urgencyLevel;
            } else {
              updatedTask.timeRemaining = "N/A";
              updatedTask.urgencyLevel = "low";
            }

            // Determine displayTimeRemaining and displayUrgencyLevel
            if (task.estimatedHours) {
              updatedTask.displayTimeRemaining = updatedTask.timeRemaining;
              updatedTask.displayUrgencyLevel = updatedTask.urgencyLevel;
            } else if (task.deadline) {
              updatedTask.displayTimeRemaining = updatedTask.timeRemaining;
              updatedTask.displayUrgencyLevel = updatedTask.urgencyLevel;
            } else {
              updatedTask.displayTimeRemaining = "N/A";
              updatedTask.displayUrgencyLevel = "low";
            }

            return updatedTask;
          }

          // If task is completed, do not update timeRemaining
          return task;
        })
      );
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

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
      headerName: "Project Title",
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
      field: "deadline",
      headerName: "Deadline",
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center text-sm text-gray-500 mt-4">
          <Clock className="h-4 w-4 mr-1" />
          {params.value ? new Date(params.value).toLocaleDateString() : "N/A"}
        </div>
      ),
    },
    {
      field: "timeRemaining",
      headerName: "Time Remaining",
      flex: 2,
      minWidth: 200,
      renderCell: (params) => {
        const { displayTimeRemaining, displayUrgencyLevel, status } = params.row;

        // If the task is completed, display "Completed" with a different style
        if (status === "Completed") {
          return (
            <div className="flex items-center text-sm font-medium text-green-700 mt-4">
              Completed
            </div>
          );
        }

        let colorClass = "text-green-500";

        if (displayUrgencyLevel === "high") {
          colorClass = "text-yellow-500";
        } else if (displayUrgencyLevel === "critical") {
          colorClass = "text-red-500 animate-pulse";
        }

        return (
          <div className={`flex items-center text-sm font-medium ${colorClass} mt-4`}>
            {displayTimeRemaining}
            {displayUrgencyLevel === "critical" && (
              <AlertTriangle className="inline h-4 w-4 ml-1 animate-bounce" />
            )}
          </div>
        );
      },
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
            {date.toLocaleString()}
          </div>
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      minWidth: 250,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            params.value === "In Progress"
              ? "bg-blue-100 text-blue-800"
              : params.value === "Completed"
              ? "bg-green-100 text-green-800"
              : params.value === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : params.value === "Cancelled"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(params.row)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => handleDelete(params.row._id)}
            className="text-red-600 hover:text-red-900"
          >
            <DeleteIcon />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Project Management</h2>
        <Button
          onClick={() => {
            resetForm();
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          variant="contained"
          color="primary"
          startIcon={<Plus />}
        >
          Add Project
        </Button>
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
      ) : error ? (
        <div className="text-red-500">Error loading projects</div>
      ) : (
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={tasksWithTime}
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

      {/* Project Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
            <DialogHeader className="px-6 pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-semibold tracking-tight">
                    {editingTask ? "Edit Project" : "Create New Project"}
                  </DialogTitle>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </DialogHeader>
            <Separator className="my-4" />
            <ScrollArea className="px-6 pb-6 max-h-[calc(80vh-8rem)]">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Project Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
                    required
                  />
                </div>
                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  {departmentsLoading ? (
                    <div>Loading departments...</div>
                  ) : departmentsError ? (
                    <div>Error loading departments</div>
                  ) : (
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          department: e.target.value,
                          assignee: {
                            userId: "",
                            name: "",
                            avatar: formData.assignee.avatar,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departmentsData.map((dept: any) => (
                        <option key={dept._id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {/* Assignee Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assignee Name
                  </label>
                  {managersLoading ? (
                    <div>Loading assignees...</div>
                  ) : managersError ? (
                    <div>Error loading assignees</div>
                  ) : (
                    <select
                      value={formData.assignee.userId}
                      onChange={(e) => {
                        const assigneeId = e.target.value;
                        const assignee = managersData.find(
                          (a: any) => a._id === assigneeId
                        );
                        if (assignee) {
                          setFormData({
                            ...formData,
                            assignee: {
                              userId: assignee._id,
                              name: assignee.name,
                              avatar: assignee.avatar || formData.assignee.avatar,
                            },
                          });
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
                      required
                      disabled={!formData.department}
                    >
                      <option value="">Select Assignee</option>
                      {managersData.map((assignee: any) => (
                        <option key={assignee._id} value={assignee._id}>
                          {assignee.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as Priority,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as Status,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Accepted">Accepted</option>
                  </select>
                </div>
                {/* Estimated Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedHours: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
                    min="0"
                    required
                  />
                </div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 block w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
                  />
                </div>
                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
                    required
                  />
                </div>
                {/* Submit and Cancel Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTask(null);
                      resetForm();
                    }}
                    variant="outlined"
                    color="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<Plus />}
                  >
                    {editingTask ? "Update Project" : "Create Project"}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectManagement;
