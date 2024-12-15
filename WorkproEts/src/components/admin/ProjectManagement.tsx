import React, { useState, useContext } from "react";
import { Clock, Plus, X, Trash2, Edit2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { createTask, getTasks, updateTask, deleteTask } from "../../api/admin";
import { toast } from "react-toastify";
import { AuthContext } from "../../AuthContext";
import { Task } from "../../types/Task";

const ProjectManagement = () => {
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
    priority: "Medium" as Task["priority"],
    deadline: "",
    status: "Pending" as Task["status"],
    progress: 0,
    department: "",
    description: "",
  });

  // Fetch projects (tasks)
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery("tasks", async () => {
    try {
      const tasks = await getTasks();
      return tasks;
    } catch (error: any) {
      toast.error(`Failed to fetch projects: ${error.message}`);
      return [];
    }
  });

  
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
      priority: "Medium" as Task["priority"],
      deadline: "",
      status: "Pending" as Task["status"],
      progress: 0,
      department: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTask) {
      // Update existing project
      updateMutation.mutate({
        taskId: editingTask._id,
        data: formData,
      });
    } else {
      // Create new project
      createMutation.mutate(formData);
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
    });
    setIsModalOpen(true);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(taskId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        {/* Header */}
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </button>
          </div>
        </div>

        {/* Projects Table */}
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error loading projects</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Title
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
                    Description
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
                {tasks?.map((task) => (
                  <tr key={task._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {task.department || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.title}
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
                      <div className="text-sm text-gray-900">
                        {task.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : task.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : task.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
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
        )}
      </div>

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingTask ? "Edit Project" : "Create New Project"}
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
                    {(departmentsData || []).map((dept: any) => (
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
                            avatar: formData.assignee.avatar,
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
                      priority: e.target.value as Task["priority"],
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
                      status: e.target.value as Task["status"],
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
                  {editingTask ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
