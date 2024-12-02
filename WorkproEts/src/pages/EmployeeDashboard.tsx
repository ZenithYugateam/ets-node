import { useState, useEffect } from 'react';
import { getUserData } from '../api/admin'; // Import API functions
import TimeCard from '../components/TimeCard';
import TaskList from '../components/TaskList';
import PerformanceMetrics from '../components/PerformanceMetrics';

const EmployeeDashboard = () => {
  const [username, setUserName] = useState<string>('');

  // Fetch User Data and set leaveForm and userId
  const getData = async () => {
    try {
      const userId = sessionStorage.getItem('userId') || ''; // Get userId from sessionStorage or another source
      const response = await getUserData(userId);
      
      setUserName(response.name); // Set username
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    getData();
  }, []); // Only run this once when the component mounts

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeCard />
        <TaskList />
      </div>

      <PerformanceMetrics />
    </div>
  );
};

export default EmployeeDashboard;
