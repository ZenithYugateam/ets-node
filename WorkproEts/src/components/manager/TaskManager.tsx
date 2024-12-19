// src/components/TaskManager.tsx

import React, { useEffect, useState, useContext } from "react";
import { AlertTriangle } from "lucide-react"; // Import icons
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import { NotificationContext } from "../context/NotificationContext"; // Import NotificationContext
import { format } from "date-fns";

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
  notified12?: boolean; // Flag for 12-hour reminder
  notified6?: boolean;  // Flag for 6-hour reminder
  notified3?: boolean;  // Flag for 3-hour reminder
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
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
    let urgencyLevel = "low";
    if (diff <= 24 * 60 * 60 * 1000) { // ≤ 24 hours
      urgencyLevel = "high";
    }
    if (diff <= 1 * 60 * 60 * 1000) { // ≤ 1 hour
      urgencyLevel = "critical";
    }

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

  // Fetch tasks assigned to the manager
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
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
        addNotification("Failed to fetch tasks. Please try again later.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [managerId, addNotification]);

  // Function to handle status updates
  const handleStatusUpdate = async (_id: string, newStatus: string): Promise<void> => {
    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === _id ? { ...task, status: newStatus } : task
      )
    );

    try {
      const response = await axios.put(`http://localhost:5000/api/tasks/${_id}`, { status: newStatus });
      console.log("Status updated response:", response.data);
      addNotification(`Task "${response.data.title}" status updated to "${newStatus}".`, "success");
    } catch (error) {
      console.error("Error updating status:", error);
      addNotification("Failed to update task status. Reverting changes.", "error");
      // If the request fails, revert the status change
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === _id ? { ...task, status: task.status } : task
        )
      );
    }
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) =>
    filter === "All Tasks" || task.status === filter
  );

  // **Notification Logic in Fetch Tasks**
  useEffect(() => {
    // This effect runs whenever tasks are fetched or updated
    tasks.forEach((task) => {
      if (task.timeRemaining && task.timeRemaining !== "Expired" && task.timeRemaining !== "N/A") {
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
  }, [tasks, addNotification]);

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
      {/* Removed ToastContainer */}
    </div>
  );
};

export default TaskManager;
