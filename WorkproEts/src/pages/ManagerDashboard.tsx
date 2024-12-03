import React, { useEffect, useState } from 'react';
import { Plus, Search, LogOut } from 'lucide-react';
import TeamOverview from '../components/manager/TeamOverview';
import TaskManager from '../components/manager/TaskManager';
import PerformanceOverview from '../components/manager/PerformanceOverview';
import TaskManagement from '../components/admin/TaskManagement';
import { useNavigate } from 'react-router-dom';
import AddTaskManagements from '../components/manager/AddTaskManagements';

const ManagerDashboard = () => {
  const [managerName, setManagerName] = useState<string | null>('Manager');
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(''); // State to handle user role
  const navigate = useNavigate();

  // Fetch user data and role
  const getData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${sessionStorage.getItem('userId') || ''}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setManagerName(userData.name);
      setRole(userData.role); // Set the role (Manager/Employee)
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    getData();
  }, []);

  // Fetch Manager Details from session or API
  useEffect(() => {
    const fetchManagerDetails = async () => {
      const storedUserId = sessionStorage.getItem('userId');
      const storedUserName = sessionStorage.getItem('userName');

      if (!storedUserId) {
        console.error('No userId found in sessionStorage. Redirecting to login.');
        navigate('/'); // Redirect to login if no `userId`
        return;
      }

      setUserId(storedUserId);

      if (storedUserName) {
        setManagerName(storedUserName);
      } else {
        try {
          console.log(`Fetching manager details for userId: ${storedUserId}`);
          const response = await fetch(`http://localhost:5000/api/users/${storedUserId}`);

          if (!response.ok) {
            throw new Error('Failed to fetch manager details');
          }

          const data = await response.json();
          setManagerName(data.name);
          sessionStorage.setItem('userName', data.name); // Cache the name in sessionStorage
        } catch (error) {
          console.error('Error fetching manager details:', error);
          setManagerName('Manager');
        }
      }
    };

    fetchManagerDetails();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    sessionStorage.clear();
    console.log('Session cleared. Redirecting to login...');
    navigate('/');
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
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* New Task Button */}
          <button
            onClick={() => console.log('New Task')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Task
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamOverview />
        <PerformanceOverview />
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        <TaskManager />
        <AddTaskManagements />
      </div>
    </div>
  );
};

export default ManagerDashboard;
