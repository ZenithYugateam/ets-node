import React, { useEffect, useState } from 'react';
import { createLeaveRequest, getUserData } from '../../api/admin';
import { toast } from 'react-toastify';

export interface LeaveFormData {
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
    username: '',
  });

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the date range
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date cannot be earlier than start date');
      return;
    }

    // Ensure userid and username are present
    if (!formData.userid || !formData.username) {
      toast.error('User information is missing. Please try again.');
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        ...formData,
        status: 'pending',
      };

      console.log('Submitting Leave Request:', requestData);

      const response = await createLeaveRequest(requestData);
      toast.success('Leave request submitted successfully!');
      setFormData({
        type: 'vacation',
        startDate: '',
        endDate: '',
        reason: '',
        userid: formData.userid, // Keep userid and username
        username: formData.username,
      });
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error(`Error submitting leave request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getData = async () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      toast.error('User ID not found. Please log in again.');
      return;
    }

    try {
      const response = await getUserData(userId);
      console.log('User Data Response:', response);

      if (response && response.username) {
        setUsername(response.username);
        setFormData((prevData) => ({
          ...prevData,
          username: response.username,
          userid: userId,
        }));
      } else {
        toast.error('Failed to fetch user data.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error fetching user data. Please try again.');
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-lg">
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
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as 'vacation' | 'sick' | 'personal',
              })
            }
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
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!formData.userid || !formData.username || loading}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default LeaveRequestForm;
