import React, { useContext } from "react";
import { useQuery } from "react-query";
import { getTasks } from "../../api/admin";
import { AuthContext } from "../../AuthContext";
import { Task } from "../../types/Task";
import { Clock } from "lucide-react";

const TaskView = () => {
  const { userId } = useContext(AuthContext); // Employee ID from context

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery("tasks", async () => {
    const allTasks: Task[] = await getTasks();

    // Filter tasks assigned to the logged-in employee
    return allTasks.filter((task) => task.assignee.userId._id === userId);
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error loading tasks</div>
      ) : tasks.length === 0 ? (
        <div>No tasks assigned to you</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task._id}>
                  {/* Task Title */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {task.department}
                    </div>
                  </td>

                  {/* Task Priority */}
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

                  {/* Task Deadline */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString()
                        : "No Deadline"}
                    </div>
                  </td>

                  {/* Task Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === "Pending"
                          ? "bg-gray-100 text-gray-800"
                          : task.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : task.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>

                  {/* Task Progress */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`absolute top-0 h-2 rounded-full ${
                          task.progress >= 75
                            ? "bg-green-500"
                            : task.progress >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {task.progress}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskView;
