import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useMutation, useQuery } from "react-query";
import { fetchManagedDepartments } from "./fetchManagedDepartments";
import { createTask, Task } from "../../api/admin";
import { toast } from "react-toastify";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Separator } from "../../ui/Separator";
import { ScrollArea } from "../../ui/scroll-area";

const ProjectManagement: React.FC<{
  managerId: string;
  managerName: string;
}> = ({ managerId, managerName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
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
    department: "",
    description: "",
  });

  const { isLoading, isError } = useQuery(
    ["managedDepartments", managerId],
    () => fetchManagedDepartments(managerId),
    {
      onSuccess: (data) => {
        setDepartments(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, department: data[0] })); // Default to first department
        }
      },
      onError: (error) => {
        toast.error(`Failed to fetch departments: ${error.message}`);
      },
    }
  );

  const createMutation = useMutation(createTask, {
    onSuccess: () => {
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
      department: departments[0] || "",
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

  if (isLoading) return <p>Loading departments...</p>;
  if (isError) return <p>Failed to load departments.</p>;

  return (
    <div className="flex justify-end">
      <Button
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        style={{ backgroundColor: "#007BFF", color: "#FFFFFF" }}
        className="hover:bg-blue-700 transition ease-in-out duration-200"
        startIcon={<Plus />}
      >
        Add Project
      </Button>

      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-lg shadow-lg">
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, department: e.target.value }))
                    }
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={formData.assignee.name}
                    readOnly
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 h-32"
                    placeholder="Enter project description"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    variant="outlined"
                    className="px-5 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600"
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
