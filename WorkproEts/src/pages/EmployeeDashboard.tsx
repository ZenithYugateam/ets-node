import { useEffect, useState } from 'react';
import { getUserData } from '../api/admin'; 
import TimeCard from '../components/TimeCard'; 
import TaskViewEmployee from '../components/employee/TaskViewEmployee';

const EmployeeDashboard = () => {
  const [username, setUserName] = useState<string>(''); 

  const getData = async () => {
    try {
      const userId = sessionStorage.getItem('userId'); 
      if (!userId) {
        throw new Error('User ID not found in session storage');
      }

      const response = await getUserData(userId); 

      if (response && response.name) {
        setUserName(response.name); 
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []); 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {username || 'User'}!
        </h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeCard userId={sessionStorage.getItem('userId')} />
      </div>

      <div className="overflow-x-auto">
        <TaskViewEmployee /> 
      </div>
    </div>
  );
};

export default EmployeeDashboard;
