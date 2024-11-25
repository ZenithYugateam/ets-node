import React, { useEffect, useState } from 'react';
import { Plus, Search, LogOut } from 'lucide-react';
import { createLeaveRequest, getLeaveRequests, getUserData } from '../api/admin';
import TeamOverview from '../components/manager/TeamOverview';
import TaskManager from '../components/manager/TaskManager';
import PerformanceOverview from '../components/manager/PerformanceOverview';
import TaskManagement from '../components/admin/TaskManagement';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@mui/material';

const ManagerDashboard = () => {
  const [managerName, setManagerName] = useState<string | null>('Manager');
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>('');  // New state to handle user role
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveForm, setLeaveForm] = useState({
    type: '',
    startDate: '',
    endDate: '',
    userid: '1234',
    reason: '',
    username: '',
  });
  const navigate = useNavigate();

  // Fetch user data and role
  const getData = async () => {
    try {
      const response = await getUserData(sessionStorage.getItem('userId') || '');
      setManagerName(response.name);
      setRole(response.role);  // Set the role (Manager/Employee)
      setLeaveForm((prevForm) => ({
        ...prevForm,
        username: response.name,
      }));
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    getData();
  }, []);

  // Fetch leave requests based on user role
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        if (role === 'Manager') {
          // If the role is Manager, fetch leave requests from all employees
          const data = await getLeaveRequests('');
          setLeaveRequests(data);
        } 
        
      } catch (error) {
        console.error('Error fetching leave requests:', error.message);
      }
    };

    fetchLeaveRequests();
  }, [role, userId]);

  // Handle leave request form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLeaveRequest(leaveForm);
      alert('Leave request created successfully!');
      setLeaveForm({
        type: '',
        startDate: '',
        endDate: '',
        userid: '1234',
        reason: '',
        username: '',
      }); // Reset form
      const updatedRequests = await getLeaveRequests(leaveForm.userid);
      setLeaveRequests(updatedRequests); // Refresh leave requests
    } catch (error) {
      console.error('Error creating leave request:', error.message);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  };

  // Get status chip based on the leave request status
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: 'warning' };
      case 'approved':
        return { label: 'Approved', color: 'success' };
      case 'rejected':
        return { label: 'Rejected', color: 'error' };
      default:
        return { label: 'Unknown', color: 'default' };
    }
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.clear();
    console.log('Session cleared. Redirecting to login...');
    navigate('/');
  };

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
        
        {/* Create Leave Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold">Create Leave Request</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={leaveForm.type}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Select Type</option>
              <option value="vacation">Vacation</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={leaveForm.startDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={leaveForm.endDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              name="reason"
              value={leaveForm.reason}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </form>

        {/* Display Leave Requests */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Leave Requests</h2>
          {leaveRequests.length > 0 ? (
  leaveRequests.map((request) => {
    const { label, color } = getStatusChip(request.status);
    function handleLeaveRequestAction(_id: any, _arg1: string): void {
      throw new Error('Function not implemented.');
    }

    return (
      <div key={request._id} className="p-4 border border-gray-300 rounded-md">
        <p>
          <strong>Type:</strong> {request.type}
        </p>
        <p>
          <strong>Start Date:</strong> {new Date(request.startDate).toLocaleDateString()}
        </p>
        <p>
          <strong>End Date:</strong> {new Date(request.endDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Reason:</strong> {request.reason}
        </p>
        <p>
          <strong>Status:</strong>
          <Chip
            size="small"
            label={label}
            color={color}
            sx={{
              fontSize: '0.79rem',
              padding: '4px 1px',
              marginLeft: '10px',
            }}
          />
        </p>
        {/* Only show Accept/Reject buttons if role is Admin */}
        {role === 'Admin' && (
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => handleLeaveRequestAction(request._id, 'approve')}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleLeaveRequestAction(request._id, 'reject')}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    );
  })
) : (
  <p>No leave requests found.</p>
)}
        </div>
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        <TaskManager />
        <TaskManagement />
      </div>
    </div>
  );
};

export default ManagerDashboard;
