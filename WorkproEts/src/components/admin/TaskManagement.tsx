import React, { useState, useEffect } from "react";
import { Clock, MoreVertical, Plus, X, Trash2, Edit2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { createTask, getTasks, updateTask, deleteTask } from "../../api/admin";
import { toast } from "react-toastify";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Typography } from "@mui/material";

interface Task {
  _id: string;
  title: string;
  assignee: {
    userId: string;
    name: string;
    avatar: string;
  };
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
  department: string;
  createdBy: string;
  description: string;
}

const TaskManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    assignee: {
      userId: "1234",
      name: "",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    priority: "Medium" as Task["priority"],
    deadline: "",
    status: "Pending" as Task["status"],
    progress: 0,
    department: "",
    description: "",
  });

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery("tasks", async () => {
    const response = await axios.post(
      "http://localhost:5000/api/fetchTaskData",
      {
        userId: "1234", // Replace with dynamic user ID if needed
      }
    );

    console.log("repomsme dats  : ", response.data);
    return response.data;
  });

  const createMutation = useMutation(createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries("tasks");
      toast.success("Task created successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const updateMutation = useMutation(
    ({ taskId, data }: { taskId: string; data: Partial<Task> }) =>
      updateTask(taskId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("tasks");
        toast.success("Task updated successfully");
        setIsModalOpen(false);
        setEditingTask(null);
        resetForm();
      },
      onError: () => {
        toast.error("Failed to update task");
      },
    }
  );

  const deleteMutation = useMutation(deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries("tasks");
      toast.success("Task deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      assignee: {
        userId: "1234",
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
    });
  };

  const [taskData, setTaskData] = useState<Task[]>([]);

  useEffect(() => {
    if (tasks) {
      setTaskData(tasks);
    }
  }, [tasks]);
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/fetchTaskData",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "1234" }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setTaskData(data);
      } catch (error) {
        toast.error(`Error fetching users: ${error.message}`);
      }
    };

    fetchAllUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("form data ", formData);

    try {
      const response = await fetch("http://localhost:5000/api/tasks3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      console.log("response form teh serverr : ", response);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
        toast.error("failed to create a task");
      }

      toast.success("successfully created task");
    } catch (error) {
      console.log("error ", error);
    }
    if (editingTask) {
      updateMutation.mutate({
        taskId: editingTask._id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      assignee: task.assignee,
      priority: task.priority,
      deadline: task.deadline,
      status: task.status,
      progress: task.progress,
      department: task.department,
      description: task.description,
    });
    setIsModalOpen(true);
  };
  

  const handleDelete = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(taskId, {
        onSuccess: () => {
          setTaskData(taskData.filter((task) => task._id !== taskId));
          toast.success('Task deleted successfully');
        },
      });
    }
  };
  


  const columns = [
    { field: "title", headerName: "Task Name", flex: 1 },
    { field: "priority", headerName: "Priority", flex: 1 },
    {
      field: "deadline",
      headerName: "Deadline",
      flex: 1,
      renderCell: (params: any) => (
        <Typography>{new Date(params.value).toLocaleDateString()}</Typography>
      ),
    },
    { field: "status", headerName: "Status", flex: 1 },
   
    { field: "department", headerName: "Department", flex: 1 },
    {
      field: "assignee",
      headerName: "Assignee",
      flex: 1,
      renderCell: (params: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src={params.value.avatar}
            alt={params.value.name}
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
          <Typography>{params.value.name}</Typography>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params: any) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Project Management
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                resetForm();
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks?.map((task: Task) => (
                <tr key={task._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {task.assignee.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === "High"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(task.deadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.description}
                    </div>
                  </td>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : task.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingTask ? "Edit Task" : "Create New Project"}
              </h3>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  Assignee Name
                </label>
                <input
                  type="text"
                  value={formData.assignee.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignee: { ...formData.assignee, name: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as Task["priority"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Task["status"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="textbox"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <DataGrid
              rows={taskData || []}
              columns={columns}
              getRowId={(row) => row._id}
              autoHeight
              pageSize={4}
              rowsPerPageOptions={[5, 10, 20]}
              loading={isLoading}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;

function handleOpenModal(row: any): void {
  throw new Error("Function not implemented.");
}
