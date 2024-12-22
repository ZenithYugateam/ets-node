import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, CheckCircle, X } from "lucide-react";
import type { Task } from "./types/index";
import { TaskDrawer } from "./TaskDrawer";

interface TaskTableProps {
  tasks: Task[];
  onAcceptTask: (taskId: number) => void;
}

export const TaskTable = ({ tasks, onAcceptTask }: TaskTableProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAccept = (task: Task) => {
    onAcceptTask(task.id);
  };

  const handleView = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setSelectedTask(null); // Reset the selected task
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "S. No",
                "Project Name",
                "Task Name",
                "Deadline",
                "Description",
                "Drone",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task, index) => (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {task.projectName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.taskName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.deadline}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {task.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.hasDrone ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {task.status === "pending" ? (
                    <button
                      onClick={() => handleAccept(task)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept
                    </button>
                  ) : (
                    <button
                      onClick={() => handleView(task)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Task Drawer */}
      {selectedTask && (
        <TaskDrawer
          isOpen={isDrawerOpen}
          onClose={handleClose} // Close handler to close the drawer
          task={selectedTask}
        />
      )}

      {/* Close Button (Optional) */}
      {isDrawerOpen && (
        <button
          onClick={handleClose}
          className="fixed bottom-4 right-4 p-3 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </>
  );
};
