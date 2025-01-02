import { useEffect, useState } from "react";
import axios from "axios";
import { TaskStepperDisplay } from "./TaskStepperDisplay";
import { Tooltip } from "@mui/material"; // For tooltips
import { Search, Filter } from "lucide-react"; // For search and filter icons

const ManagerTasksDisplay = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
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
        const response = await axios.get("http://localhost:5001/api/manager-tasks");
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

  // Handle filtering logic
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
    // Ensure valid `createdAt` timestamps, falling back to 0 if missing
    const dateA = new Date(a.createdAt).getTime() || 0;
    const dateB = new Date(b.createdAt).getTime() || 0;
  
    // Return descending order: latest createdAt first
    return dateB - dateA;
  });
  


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          {/* Tailwind CSS Spinner */}
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
        <h1 className="text-3xl font-extrabold text-center text-gray-700 mb-8">Task Management Dashboard</h1>

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
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
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
                onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Tasks Table */}
          {filteredTasks.length > 0 ? (
            <div className="overflow-x-auto shadow-md rounded-lg bg-white">
                            <div
                  className="overflow-y-auto"
                  style={{ maxHeight: "400px" }} // Set max height for the table container
                >
              <table className="table-auto w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Task Name</th>
                    <th className="px-4 py-2">Project Name</th>
                    <th className="px-4 py-2">Employee Name</th>
                    <th className="px-4 py-2">Priority</th>
                    <th className="px-4 py-2">Deadline</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Manager Name</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Remarks</th>
                    <th className="px-4 py-2">Notes</th>
                    <th className="px-4 py-2">Selected Employees</th>
                    <th className="px-4 py-2">Drone Required</th>
                    <th className="px-4 py-2">DGPS Required</th>
                    <th className="px-4 py-2">Estimated Hours</th>
                    <th className="px-4 py-2">Accepted</th>
                    <th className="px-4 py-2">Accepted At</th>
                    <th className="px-4 py-2">Completed At</th>
                    <th className="px-4 py-2">Completed Time (Hours)</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr
                      key={task._id}
                      className="border-b hover:bg-gray-50 transition duration-200 ease-in-out"
                    >
                      {/* Task Name with Tooltip */}
                      <td className="px-4 py-2 font-medium text-gray-900">
                        <Tooltip title={task.taskName || "No Task Name"} arrow>
                          <span className="block truncate w-40">{task.taskName || "N/A"}</span>
                        </Tooltip>
                      </td>

                      {/* Project Name with Tooltip */}
                      <td className="px-4 py-2">
                        <Tooltip title={task.projectName || "No Project Name"} arrow>
                          <span className="block truncate w-40">{task.projectName || "N/A"}</span>
                        </Tooltip>
                      </td>

                      {/* Employee Name with Tooltip */}
                                          <td className="px-4 py-2">
                      <Tooltip
                        title={task.employees && task.employees.length > 0 ? task.employees.join(", ") : "No Employees"}
                        arrow
                      >
                        <span className="block truncate w-40">
                          {task.employees && task.employees.length > 0
                            ? task.employees.join(", ") // Join array into a comma-separated string
                            : "N/A"} 
                        </span>
                      </Tooltip>
                    </td>


                      {/* Priority with Color Coding */}
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getPriorityClasses(task.priority)
                          }`}
                        >
                          {task.priority
                            ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                            : "N/A"}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-2">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Description with Truncation and Tooltip */}
                      <td className="px-4 py-2">
                        <Tooltip title={task.description || "No Description"} arrow>
                          <span className="block truncate w-60">{task.description || "N/A"}</span>
                        </Tooltip>
                      </td>

                      {/* Manager Name with Tooltip */}
                      <td className="px-4 py-2">
                        <Tooltip title={task.managerName || "No Manager Name"} arrow>
                          <span className="block truncate w-40">{task.managerName || "N/A"}</span>
                        </Tooltip>
                      </td>

                      {/* Status with Color Coding */}
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusClasses(task.status)
                          }`}
                        >
                          {task.status
                            ? task.status.charAt(0).toUpperCase() + task.status.slice(1)
                            : "N/A"}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="px-4 py-2">
                        {Array.isArray(task.remarks) && task.remarks.length > 0
                          ? task.remarks.join(", ")
                          : "None"}
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-2">
                        {Array.isArray(task.notes) && task.notes.length > 0
                          ? task.notes.join(", ")
                          : "None"}
                      </td>

                      {/* Selected Employees */}
                      <td className="px-4 py-2">
                        {Array.isArray(task.selectedEmployees) && task.selectedEmployees.length > 0
                          ? task.selectedEmployees.join(", ")
                          : "None"}
                      </td>

                      {/* Drone Required */}
                      <td className="px-4 py-2">
                        {task.droneRequired ? (
                          <span className="text-green-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-red-600 font-semibold">No</span>
                        )}
                      </td>

                      {/* DGPS Required */}
                      <td className="px-4 py-2">
                        {task.dgpsRequired ? (
                          <span className="text-green-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-red-600 font-semibold">No</span>
                        )}
                      </td>

                      {/* Estimated Hours */}
                      <td className="px-4 py-2">
                        {task.estimatedHours ? `${task.estimatedHours} hrs` : "Not Specified"}
                      </td>

                      {/* Accepted */}
                      <td className="px-4 py-2">
                        {task.accepted ? (
                          <span className="text-green-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-red-600 font-semibold">No</span>
                        )}
                      </td>

                      {/* Accepted At */}
                      <td className="px-4 py-2">
                        {task.acceptedAt
                          ? new Date(task.acceptedAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      {/* Completed At */}
                      <td className="px-4 py-2">
                        {task.completedAt
                          ? new Date(task.completedAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      {/* Completed Time (Hours) */}
                      <td className="px-4 py-2">
                        {task.completedTime
                          ? `${task.completedTime} hrs`
                          : "Not Specified"}
                      </td>

                      {/* Action Button */}
                      <td className="px-4 py-2 text-center">
                        <button
                          className="px-4 py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150"
                          onClick={() => setSelectedTaskId(task._id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          ) : (
            <p className="text-center text-lg text-gray-600">No tasks found.</p>
          )}
        </div>

        {/* Modal for Task Details */}
        {selectedTaskId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="relative bg-white w-full max-w-5xl max-h-[90%] p-6 rounded-lg shadow-lg overflow-y-auto"
              style={{ minHeight: "400px", minWidth: "600px" }}
            >
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Task Details</h2>
              <TaskStepperDisplay managerTaskId={selectedTaskId} />
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
