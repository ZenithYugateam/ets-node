import { useEffect, useState } from "react";
import { getUserData } from "../api/admin"; // API call to fetch user data
import TimeCard from "../components/TimeCard"; // Time card component
import TaskViewEmployee from "../components/employee/TaskViewEmployee"; // Employee tasks component
import { LogOut } from "lucide-react"; // LogOut icon

const EmployeeDashboard = () => {
  const [username, setUserName] = useState<string>(""); // State for username

  // Fetch user data
  const getData = async () => {
    try {
      const userId = sessionStorage.getItem("userId"); // Get user ID from session storage
      if (!userId) {
        throw new Error("User ID not found in session storage");
      }

      const response = await getUserData(userId); // Fetch user data

      if (response && response.name) {
        setUserName(response.name); // Set username
      } else {
        throw new Error("Invalid user data received");
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message); // Log errors
    }
  };

  useEffect(() => {
    getData(); // Fetch user data on component mount
  }, []);

  return (
    <div className="space-y-6 px-4 lg:px-8 py-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome, {username || "User"}!
        </h1>
        <button
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          onClick={() => {
            localStorage.clear(); // Clear local storage
            sessionStorage.clear(); // Clear session storage
            window.location.href = "/"; // Redirect to login page
          }}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </button>
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TimeCard Component */}
        <TimeCard userId={sessionStorage.getItem("userId")} />

        {/* Add additional cards if needed */}
      </div>

      {/* Task View Section */}
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Your Tasks</h2>
        <TaskViewEmployee />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
