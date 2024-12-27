import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddTaskManagements from "../components/manager/AddTaskManagements";
import TaskManager from "../components/manager/TaskManager";
import TimeCard from "../components/TimeCard";
import ProjectManagement from "../components/manager/ProjectManagement";

const ManagerDashboard = () => {
  const [managerName, setManagerName] = useState<string | null>("Manager");
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(""); // Role
  const [department, setDepartment] = useState<string | null>(""); // Department
  const navigate = useNavigate();

  const getData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/users/${sessionStorage.getItem("userId") || ""}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();

      setManagerName(userData.name || "Manager");
      setRole(userData.role || ""); // Separate role
      setUserId(userData._id); // Manager ID
      setDepartment(userData.department || "Unknown"); // Fetch department explicitly
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    console.log("Session cleared. Redirecting to login...");
    navigate("/");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {managerName}</h1>
          <p className="text-gray-500 text-sm">
            Here's an overview of your team's performance and tasks.
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeCard userId={sessionStorage.getItem("userId")} />
        </div>

        {/* Project Management Component */}
        <ProjectManagement
          managerId={userId || ""}
          managerName={managerName || ""}
          department={department || ""} // Pass the correct department
        />

        {/* Task Overview Component */}
        <TaskManager />

        <AddTaskManagements />
      </div>
    </div>
  );
};

export default ManagerDashboard;
