import React, { useState, useEffect } from 'react';
import { createLeaveRequest, getLeaveRequests, getUserData } from '../api/admin';
import { Chip } from '@mui/material';

interface LeaveRequest {
  _id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

interface LeaveForm {
  type: string;
  startDate: string;
  endDate: string;
  userid: string;
  reason: string;
  username: string;
}

const LeaveRequests: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveForm, setLeaveForm] = useState<LeaveForm>({
    type: '',
    startDate: '',
    endDate: '',
    userid: '',
    reason: '',
    username: '',
  });

  const [userRole, setUserRole] = useState<string | null>('');
  const [username, setUserName] = useState<string>('');

  // Fetch User Data
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        alert('User ID is missing. Please log in again.');
        return;
      }
      try {
        const response = await getUserData(userId);
        setUserName(response.name);
        setUserRole(response.role);
        setLeaveForm((prevForm) => ({
          ...prevForm,
          username: response.name,
          userid: response._id,
        }));
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    fetchUserData();
  }, []);

  // Fetch Leave Requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      if (leaveForm.userid) {
        try {
          const data = await getLeaveRequests(leaveForm.userid);
          setLeaveRequests(data);
        } catch (error) {
          console.error('Error fetching leave requests:', error.message);
        }
      }
    };

    fetchLeaveRequests();
  }, [leaveForm.userid]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.userid || !leaveForm.type || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      await createLeaveRequest(leaveForm);
      alert('Leave request created successfully!');
      setLeaveForm({
        ...leaveForm,
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
      });
      const updatedRequests = await getLeaveRequests(leaveForm.userid);
      setLeaveRequests(updatedRequests);
    } catch (error) {
      console.error('Error creating leave request:', error.message);
    }
  };

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  };

  // Get Chip Status
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
      <h2 className="text-xl font-semibold">Leave Dashboard</h2>
      <p>Welcome, {username} ({userRole || 'User'})</p>

      {/* Leave Request Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Leave Requests List */}
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

export default LeaveRequests;
