import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { createLeaveRequest, getUserData } from '../../api/admin';
import { toast } from 'react-toastify';

interface LeaveFormData {
  type: 'vacation' | 'sick' | 'personal';
  startDate: string;
  endDate: string;
  reason: string;
  userid: string;
  username: string;
}

const LeaveRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<LeaveFormData>({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
    userid: '', 
    username: '', // Initialize username
  });

  const [username, setUsername] = useState<string>(''); // State for the username

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate date range
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date cannot be earlier than start date');
      return;
    }

    try {
      const requestData = {
        ...formData,
        status: 'pending', // Set status to 'pending' before submitting
      };
      const response = await createLeaveRequest(requestData); 
      toast.success('Leave request submitted successfully!');
    } catch (error) {
      toast.error(`Error submitting leave request: ${error.message}`);
    }
  };

  // Function to get user data (username)
  const getData = async () => {
    const userId = sessionStorage.getItem('userId') || '';
    const response = await getUserData(userId);
    console.log('Response:', response);
    
    if (response && response.username) {
      setUsername(response.username); // Set the username from the response
      setFormData((prevData) => ({
        ...prevData,
        username: response.username, // Optionally set username in formData as well
        userid: userId, // You can also store the userId in formData if necessary
      }));
    }
  };

  // Fetch user data when the component mounts
  useEffect(() => {
    getData();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-lg">
      {/* Display Username */}
      {username && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Leave Request for: {username}</h3>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type */}
        <div>
          <label className="block text-sm font-semibold">Leave Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'vacation' | 'sick' | 'personal' })}
            className="mt-1 block w-full"
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="mt-1 block w-full"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="mt-1 block w-full"
            required
          />
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-semibold">Reason</label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows={4}
          className="mt-1 block w-full"
          required
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button type="submit" className="btn btn-primary">Submit Request</button>
      </div>
    </form>
  );
};

export default LeaveRequestForm;
