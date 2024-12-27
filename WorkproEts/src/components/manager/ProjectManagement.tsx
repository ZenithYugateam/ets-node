import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useMutation, useQueryClient } from "react-query";
import { createTask } from "../../api/admin";
import { toast } from "react-toastify";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Separator } from "../../ui/Separator";
import { ScrollArea } from "../../ui/scroll-area";
import { Task } from "../../types/task";

const ProjectManagement: React.FC<{
  managerId: string;
  managerName: string;
  department: string;
}> = ({ managerId, managerName, department }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Omit<Task, "_id" | "createdBy" | "progress">>({
    title: "",
    assignee: {
      userId: managerId,
      name: managerName,
      avatar: "",
    },
    priority: "Medium",
    deadline: "",
    status: "Pending",
    department, // Pre-fill department from props
    description: "",
  });

  // Mutation for creating a project
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

  const resetForm = () => {
    setFormData({
      title: "",
      assignee: {
        userId: managerId,
        name: managerName,
        avatar: "",
      },
      priority: "Medium",
      deadline: "",
      status: "Pending",
      department,
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTask: Omit<Task, "_id" | "createdBy" | "progress"> = {
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : "",
    };

    createMutation.mutate({ ...newTask, createdBy: managerId });
  };

  return (
    <div className="flex justify-end">
      <Button
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        style={{ backgroundColor: "#007BFF", color: "#FFFFFF" }} // Blue button styling
        className="hover:bg-blue-700 transition ease-in-out duration-200"
        startIcon={<Plus />}
      >
        Add Project
      </Button>

      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
            <DialogHeader className="px-6 pt-6">
              <div className="flex items-start justify-between">
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                  Create New Project
                </DialogTitle>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </DialogHeader>
            <Separator className="my-4" />
            <ScrollArea className="px-6 pb-6 max-h-[calc(80vh-8rem)]">
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={formData.assignee.name}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
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
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
                    required
                  />
                </div>

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

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    variant="outlined"
                    color="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    style={{ backgroundColor: "#007BFF", color: "#FFFFFF" }} // Blue submit button
                    className="hover:bg-blue-700 transition ease-in-out duration-200"
                    startIcon={<Plus />}
                  >
                    Create Project
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
