import { useEffect, useState } from "react";
import axios from "axios";
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material"; // Tooltip & Dialog components
import { Search, Filter } from "lucide-react"; // Search and Filter icons
import { ReportView } from "../manager/Dialog_ui/ReportView";

const ManagerTasksDisplay = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null); // For Task Details dialog
  const [selectedTaskId, setSelectedTaskId] = useState(null); // For Action button
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
  });

  // Debounced search term to improve performance
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          "https://ets-node-1.onrender.com/api/manager-tasks"
        );
        setTasks(response.data.tasks || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Function to get color classes based on priority
  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get color classes based on status
  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      // Search filter
      const matchesSearch = Object.values(task).some((value) =>
        String(value).toLowerCase().includes(debouncedSearch.toLowerCase())
      );

      // Status filter
      const taskStatus = task.status?.toLowerCase() || "";
      const matchesStatus =
        filters.status === "all" || taskStatus === filters.status.toLowerCase();

      // Priority filter
      const taskPriority = task.priority?.toLowerCase() || "";
      const matchesPriority =
        filters.priority === "all" ||
        taskPriority === filters.priority.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;
      return dateB - dateA;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-lg font-bold text-red-500">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center text-gray-700 mb-8">
          Task Management Dashboard
        </h1>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, priority: e.target.value }))
                }
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        {filteredTasks.length > 0 ? (
          <div className="overflow-x-auto shadow-md rounded-lg bg-white">
            <table className="table-auto w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Task Name</th>
                  <th className="px-4 py-2">Project Name</th>
                  <th className="px-4 py-2">Employee Name</th>
                  <th className="px-4 py-2">Priority</th>
                  <th className="px-4 py-2">Deadline</th>
                  <th className="px-4 py-2">Manager Name</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Estimated Hours</th>
                  <th className="px-4 py-2">Completed Time</th>
                  <th className="px-4 py-2 text-center">Action</th>
                  <th className="px-4 py-2 text-center">Task Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b hover:bg-gray-50 transition duration-200 ease-in-out"
                  >
                    <td className="px-4 py-2">{task.taskName || "N/A"}</td>
                    <td className="px-4 py-2">{task.projectName || "N/A"}</td>
                    <td className="px-4 py-2">
                      {Array.isArray(task.employees) &&
                      task.employees.length > 0
                        ? task.employees.join(", ")
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClasses(
                          task.priority
                        )}`}
                      >
                        {task.priority
                          ? task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2">{task.managerName || "N/A"}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(
                          task.status
                        )}`}
                      >
                        {task.status
                          ? task.status.charAt(0).toUpperCase() +
                            task.status.slice(1)
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {task.estimatedHours
                        ? `${task.estimatedHours} hrs`
                        : "Not Specified"}
                    </td>
                    <td className="px-4 py-2">
                      {task.completedTime
                        ? (() => {
                            const totalMinutes = Math.floor(
                              task.completedTime * 60
                            );
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = totalMinutes % 60;
                            return `${hours} hrs ${minutes} mins`;
                          })()
                        : "Not Specified"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className={`px-4 py-2 rounded-md shadow-sm focus:outline-none ${
                          task.droneRequired || task.dgpsRequired
                            ? "bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() =>
                          task.droneRequired || task.dgpsRequired
                            ? setSelectedTaskId(task._id)
                            : null
                        }
                        disabled={!task.droneRequired && !task.dgpsRequired}
                      >
                        View
                      </button>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="px-4 py-2 text-white bg-green-500 rounded-md shadow-sm hover:bg-green-600 focus:outline-none"
                        onClick={() => setSelectedTask(task)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-lg text-gray-600">No tasks found.</p>
        )}

        {/* Task Details Dialog */}
        {selectedTask && (
          <Dialog open={true} onClose={() => setSelectedTask(null)}>
            <DialogTitle>Task Details</DialogTitle>
            <DialogContent>
              <p><strong>Task Name:</strong> {selectedTask.taskName || "N/A"}</p>
              <p><strong>Project Name:</strong> {selectedTask.projectName || "N/A"}</p>
              <p>
                <strong>Employees:</strong>{" "}
                {selectedTask.employees && selectedTask.employees.length > 0
                  ? selectedTask.employees.join(", ")
                  : "N/A"}
              </p>
              <p><strong>Manager Name:</strong> {selectedTask.managerName || "N/A"}</p>
              <p><strong>Deadline:</strong> {selectedTask.deadline || "N/A"}</p>
              <p><strong>Priority:</strong> {selectedTask.priority || "N/A"}</p>
              <p><strong>Status:</strong> {selectedTask.status || "N/A"}</p>
              <p><strong>Remarks:</strong> {selectedTask.remarks || "N/A"}</p>
              <p><strong>Notes:</strong> {selectedTask.notes || "N/A"}</p>
              <p><strong>Accepted:</strong> {selectedTask.accepted ? "Yes" : "No"}</p>
              <p><strong>Accepted At:</strong> {selectedTask.acceptedAt || "N/A"}</p>
              <p><strong>Completed At:</strong> {selectedTask.completedAt || "N/A"}</p>
              <p>
                <strong>Completed Time:</strong>{" "}
                {selectedTask.completedTime
                  ? (() => {
                      const totalMinutes = Math.floor(
                        selectedTask.completedTime * 60
                      );
                      const hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;
                      return `${hours} hrs ${minutes} mins`;
                    })()
                  : "Not Specified"}
              </p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTask(null)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Action Modal for View */}
        {selectedTaskId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="relative bg-white w-full max-w-5xl max-h-[90%] p-6 rounded-lg shadow-lg overflow-y-auto"
              style={{ minHeight: "400px", minWidth: "600px" }}
            >
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Task Action View
              </h2>
              <ReportView managerTaskId={selectedTaskId} type={""} />
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                onClick={() => setSelectedTaskId(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerTasksDisplay;
