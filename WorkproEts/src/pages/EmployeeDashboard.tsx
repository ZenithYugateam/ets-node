import React, { useState, useEffect } from 'react';
import { getUserData } from '../api/admin'; // Ensure this function exists and is implemented correctly
import TimeCard from '../components/TimeCard'; // Ensure these imports are correct
import TaskManagement from '../components/admin/TaskManagement';
import TaskEmployee from '../components/employee/taskemployee'; // Updated and corrected path

const EmployeeDashboard = () => {
  const [username, setUserName] = useState<string>(''); // `string` type annotation is optional in TypeScript if type inference works.

  // Fetch user data
  const getData = async () => {
    try {
      const userId = sessionStorage.getItem('userId'); // Fetch `userId` from sessionStorage
      if (!userId) {
        throw new Error('User ID not found in session storage');
      }

      const response = await getUserData(userId); // Ensure `getUserData` is implemented correctly and returns the expected structure

      if (response && response.name) {
        setUserName(response.name); // Set the username
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  // Fetch user data when the component mounts
  useEffect(() => {
    getData();
  }, []); // Empty dependency array ensures it only runs once

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {username || 'User'}!
        </h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeCard userId={sessionStorage.getItem('userId')} />
      </div>

      {/* Task Management Section */}
      <TaskEmployee /> {/* Correct usage of the component */}
    </div>
  );
};

export default EmployeeDashboard;
