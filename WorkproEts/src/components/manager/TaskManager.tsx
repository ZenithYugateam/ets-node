import React, { useEffect, useState, useContext, useCallback } from "react";
import { Clock, AlertTriangle } from "lucide-react"; // Import icons
import axios from "axios";
import { AuthContext } from "../../AuthContext";

interface AuthContextType {
  userId: string;
  role: string;
  userName: string;
}

interface Task {
  _id: string;
  title: string;
  priority: string;
  deadline: string; // Deadline as a string
  status: string;
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
  urgencyLevel?: string; // Optional field for urgency level (e.g., "high", "medium", "low")
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("All Tasks");
  const [isLoading, setIsLoading] = useState(false);
  const authContext = useContext<AuthContextType>(AuthContext);
  const managerId = authContext.userId;

  // Function to calculate time remaining
  const calculateTimeRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline).setHours(23, 59, 59); // Set deadline to end of the day
    const now = new Date().getTime();
    const diff = deadlineDate - now;

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

  // Update time remaining for tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          const { time, urgencyLevel } = calculateTimeRemaining(task.deadline);
          return { ...task, timeRemaining: time, urgencyLevel };
        })
      );
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get<Task[]>("http://localhost:5000/api/tasks");
        const allTasks = response.data;

        // Filter tasks for the current manager
        const managerTasks = allTasks.filter(
          (task) => task.assignee?.userId?._id === managerId
        );

        // Add initial time remaining and urgency for each task
        const tasksWithTime = managerTasks.map((task) => {
          const { time, urgencyLevel } = calculateTimeRemaining(task.deadline);
          return { ...task, timeRemaining: time, urgencyLevel };
        });

        setTasks(tasksWithTime);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        alert("Failed to fetch tasks. Please try again later.");
      }
    };

    fetchTasks();
  }, [managerId]);

  const handleStatusUpdate = useCallback(async (_id: string, newStatus: string): Promise<void> => {
    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === _id ? { ...task, status: newStatus } : task
      )
    );

    try {
      const response = await axios.put(`http://localhost:5000/api/tasks/${_id}`, { status: newStatus });
      console.log("Status updated response:", response.data);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update task status. Reverting changes.");
      // If the request fails, revert the status change
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === _id ? { ...task, status: task.status } : task
        )
      );
    }
  }, []);

  const filteredTasks = tasks.filter((task) =>
    filter === "All Tasks" || task.status === filter
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Task Overview</h2>
          <div className="flex items-center space-x-2">
            <select
              className="border-gray-300 rounded-lg text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All Tasks</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.department}
                    </div>
                  </td>
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
                    <div className="text-sm text-gray-500">
                      {new Date(task.deadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        task.urgencyLevel === "high"
                          ? "text-yellow-500"
                          : task.urgencyLevel === "critical"
                          ? "text-red-500 animate-pulse"
                          : "text-green-500"
                      }`}
                    >
                      {task.timeRemaining}
                      {task.urgencyLevel === "critical" && (
                        <AlertTriangle className="inline h-4 w-4 ml-1 animate-bounce" />
                      )}
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
                    <select
                      className="text-sm border-gray-300 rounded-lg"
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                    >
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Pending</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{task.description}</div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    colSpan={8}
                  >
                    No tasks available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isLoading && <div className="spinner">Loading...</div>}
    </div>
  );
};

export default TaskManager;
