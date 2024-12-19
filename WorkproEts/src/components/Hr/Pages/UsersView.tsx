import { useState } from "react";
import { Plus, Search } from "lucide-react";
import UserTable from "../UserTable";
import UserForm from "../Addusers from";
import DepartmentForm from "../Departmentform";
import TaskForm from "../Taskform";
import { User, Department } from "../Types/types";
import Side from "../Side";

const UsersView = () => {
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isDepartmentFormOpen, setIsDepartmentFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false); // State for TaskForm
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [departments] = useState<Department[]>([
    { id: "1", name: "Engineering" },
    { id: "2", name: "Marketing" },
    { id: "3", name: "Sales" },
  ]);

  const handleAddUser = (userData: Partial<User>) => {
    console.log("Adding user:", userData);
    setIsUserFormOpen(false);
  };

  const handleAddDepartment = (departmentData: Omit<Department, "id">) => {
    console.log("Adding department:", departmentData);
    setIsDepartmentFormOpen(false);
  };

  const handleAddTask = (taskData: { title: string; department: string }) => {
    console.log("Adding task:", taskData);
    setIsTaskFormOpen(false);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };

  const handleViewUser = (user: User) => {
    console.log("Viewing user:", user);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Side />

      <div className="flex-1 overflow-hidden">
        <div className="h-full p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-6">
                Users Management
              </h1>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsUserFormOpen(true)}
                    className="flex items-center justify-center px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all duration-300 flex-1 sm:flex-none"
                  >
                    <Plus size={20} className="mr-2" />
                    Add User
                  </button>
                  <button
                    onClick={() => setIsDepartmentFormOpen(true)}
                    className="flex items-center justify-center px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-all duration-300 flex-1 sm:flex-none"
                  >
                    <Plus size={20} className="mr-2" />
                    Add Department
                  </button>
                  <button
                    onClick={() => setIsTaskFormOpen(true)}
                    className="flex items-center justify-center px-6 py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition-all duration-300 flex-1 sm:flex-none"
                  >
                    <Plus size={20} className="mr-2" />
                    Add Task
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <UserTable onEdit={handleEditUser} onView={handleViewUser} />
            </div>
          </div>
        </div>

        <UserForm
          isOpen={isUserFormOpen}
          onClose={() => {
            setIsUserFormOpen(false);
            setSelectedUser(undefined);
          }}
          onSubmit={handleAddUser}
          initialData={selectedUser}
          departments={departments.map((d) => d.name)}
        />

        <DepartmentForm
          isOpen={isDepartmentFormOpen}
          onClose={() => setIsDepartmentFormOpen(false)}
          onSubmit={handleAddDepartment}
        />

        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSubmit={handleAddTask}
        />
      </div>
    </div>
  );
};

export default UsersView;
