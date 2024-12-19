import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddTaskManagements from '../components/manager/AddTaskManagements';
import TaskManager from '../components/manager/TaskManager';
import TimeCard from '../components/TimeCard';

const ManagerDashboard = () => {
  const [managerName, setManagerName] = useState<string | null>('Manager');
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(''); // State to handle user role
  const navigate = useNavigate();

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
      setRole(userData.role); 
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
        <TimeCard userId={sessionStorage.getItem('userId')} />
      </div>
        <TaskManager />
        <AddTaskManagements />
        
      </div>
    </div>
  );
};

export default ManagerDashboard;