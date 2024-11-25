import { useState, useEffect } from 'react';
import { createLeaveRequest, getLeaveRequests, getUserData } from '../api/admin';  // Import API functions
import TimeCard from '../components/TimeCard';
import TaskList from '../components/TaskList';
import PerformanceMetrics from '../components/PerformanceMetrics';
import { Chip } from '@mui/material';

const EmployeeDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [username, setUserName] = useState<string>('');
  const [leaveForm, setLeaveForm] = useState({
    type: '',
    startDate: '',
    endDate: '',
    userid: '', // Will be set after fetching user data
    reason: '',
    username: '',
  });

  // Fetch Leave Requests based on the logged-in user's ID
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        if (leaveForm.userid) {
          const data = await getLeaveRequests(leaveForm.userid); // Fetch leave requests for the logged-in user
          setLeaveRequests(data);
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error.message);
      }
    };

    fetchLeaveRequests();
  }, [leaveForm.userid]); // Runs when leaveForm.userid is updated

  // Fetch User Data and set leaveForm and userId
  const getData = async () => {
    try {
      const userId = sessionStorage.getItem('userId') || ''; // Get userId from sessionStorage or another source
      const response = await getUserData(userId);
      
      setUserName(response.name); // Set username
      setLeaveForm((prevForm) => ({
        ...prevForm,
        username: response.name,
        userid: response._id, // Use _id as userid
      }));
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    getData();
  }, []); // Only run this once when the component mounts

  // Handle Leave Request Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!leaveForm.userid) {
        alert('User ID is missing. Please try again.');
        return;
      }

      // Log the form data before submitting to ensure `userid` is present
      console.log('Submitting leave request:', leaveForm);

      // Call the API to create the leave request
      await createLeaveRequest(leaveForm);

      alert('Leave request created successfully!');
      
      // Reset the form and fetch updated leave requests
      setLeaveForm({
        type: '',
        startDate: '',
        endDate: '',
        userid: leaveForm.userid, // Keep the userid after submission
        reason: '',
        username: '',
      });

      const updatedRequests = await getLeaveRequests(leaveForm.userid); // Fetch updated leave requests for the current user
      setLeaveRequests(updatedRequests); // Refresh the list of leave requests
    } catch (error) {
      console.error('Error creating leave request:', error.message);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  };

  // Determine chip color based on leave status
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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Leave Requests</h2>
        {leaveRequests.length > 0 ? (
          leaveRequests.map((request) => {
            const { label, color } = getStatusChip(request.status);
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
              </div>
            );
          })
        ) : (
          <p>No leave requests found.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
