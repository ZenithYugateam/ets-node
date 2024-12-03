import React, { useEffect, useState, useContext } from "react";
import { Clock, MoreVertical } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../AuthContext"; // Adjust the path based on your project structure

interface AuthContextType {
  userId: string;
  role: string;
  userName: string;
  // Add any other properties as needed
}

interface Task {
  _id: string;
  title: string;
  priority: string;
  deadline: string;
  status: string;
  progress: number;
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
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const authContext = useContext<AuthContextType>(AuthContext);
  const managerId = authContext.userId; 

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch tasks using axios
        const response = await axios.get<Task[]>(
          "http://localhost:5000/api/tasks"
        );
        const allTasks = response.data;

        // Filter tasks assigned to the manager
        const managerTasks = allTasks.filter((task) => {
          return (
            task.assignee &&
            task.assignee.userId &&
            task.assignee.userId._id === managerId
          );
        });

        setTasks(managerTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [managerId]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Task Overview</h2>
          <div className="flex items-center space-x-2">
            <select className="border-gray-300 rounded-lg text-sm">
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
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
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
              {tasks.map((task) => (
                <tr key={task._id}>
                  {/* Project */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.department}
                    </div>
                  </td>
                  {/* Task */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                  </td>
                  {/* Assignee */}
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
                  {/* Priority */}
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
                  {/* Deadline */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(task.deadline).toLocaleDateString()}
                    </div>
                  </td>
                  {/* Progress */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  {/* Status */}
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
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-500">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {/* No Tasks Message */}
              {tasks.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    colSpan={8}
                  >
                    No tasks assigned to you.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
