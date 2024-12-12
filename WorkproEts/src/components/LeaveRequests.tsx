import React, { useState, useEffect } from 'react';
import { createLeaveRequest, getLeaveRequests, getUserData } from '../api/admin';
import { Chip } from '@mui/material';
import { Calendar, Clock, FileText, User } from 'lucide-react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  };

  const getStatusChip = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Leave Dashboard</h1>
            <p className="text-gray-600">Welcome, {username} ({userRole || 'User'})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select
              name="type"
              value={leaveForm.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select Type</option>
              <option value="vacation">Vacation Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="startDate"
                value={leaveForm.startDate}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="endDate"
                value={leaveForm.endDate}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                name="reason"
                value={leaveForm.reason}
                onChange={handleChange}
                required
                rows={4}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Please provide a detailed reason for your leave request..."
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 transition-colors font-medium"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Your Leave Requests</h2>
        </div>

        <div className="space-y-4">
          {leaveRequests.length > 0 ? (
            leaveRequests.map((request) => (
              <div key={request._id} className="p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-gray-900 capitalize">{request.type} Leave</span>
                      {getStatusChip(request.status)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Duration:</span>{' '}
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No leave requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequests;