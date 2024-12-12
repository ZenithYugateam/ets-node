import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getLeaveRequests, updateLeaveRequestStatus, deleteLeaveRequest } from "../../api/admin";
import { 
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Check,
  X,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface LeaveApprovalsProps {
  adminId: string;
}

interface LeaveRequest {
  _id: string;
  username: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  description?: string;
  createdAt: string;
}

const LeaveApprovals: React.FC<LeaveApprovalsProps> = ({ adminId }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const fetchLeaveRequests = async () => {
    try {
      const data = await getLeaveRequests(null, adminId);
      // Sort by creation date, most recent first
      const sortedData = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLeaveRequests(sortedData);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [adminId]);

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    setActionLoading(requestId);
    try {
      await updateLeaveRequestStatus(requestId, status);
      setLeaveRequests(requests =>
        requests.map(request =>
          request._id === requestId ? { ...request, status } : request
        )
      );
      toast.success(`Leave request ${status} successfully`);
    } catch (error) {
      toast.error(`Failed to ${status} leave request`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLeaveRequest = async () => {
    if (!requestToDelete) return;
    
    try {
      await deleteLeaveRequest(requestToDelete);
      toast.success('Leave request deleted successfully');
      setLeaveRequests(requests => requests.filter(request => request._id !== requestToDelete));
    } catch (error) {
      toast.error('Failed to delete leave request');
    } finally {
      setDeleteConfirmOpen(false);
      setRequestToDelete(null);
    }
  };

  const filteredRequests = leaveRequests.filter(request => 
    selectedFilter === 'all' ? true : request.status === selectedFilter
  );

  const getStatusStyles = (status: string) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      approved: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200'
    };
    return styles[status] || '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress size={40} className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Requests Management</h1>
            <p className="text-gray-600 mt-1">Manage and respond to employee leave requests</p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setSelectedFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4 inline-block mr-1" />
              Pending
            </button>
            <button
              onClick={() => setSelectedFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === 'approved'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline-block mr-1" />
              Approved
            </button>
            <button
              onClick={() => setSelectedFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === 'rejected'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <XCircle className="w-4 h-4 inline-block mr-1" />
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Leave Requests</h3>
            <p className="text-gray-500">There are no {selectedFilter !== 'all' ? selectedFilter : ''} leave requests to display.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-medium text-gray-900">{request.username}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusStyles(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-500 capitalize mb-4">{request.type} Leave</p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Duration:</span>
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4 mt-1 text-gray-400" />
                            <div>
                              <span className="font-medium">Reason:</span>
                              <p className="mt-1">{request.reason}</p>
                            </div>
                          </div>
                        </div>
                        {request.description && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Additional Details:</span>
                              <span className="block mt-1">{request.description}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col gap-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="contained"
                            onClick={() => handleStatusUpdate(request._id, 'approved')}
                            disabled={actionLoading === request._id}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors w-full"
                            startIcon={actionLoading === request._id ? <CircularProgress size={20} /> : <Check className="w-5 h-5" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => handleStatusUpdate(request._id, 'rejected')}
                            disabled={actionLoading === request._id}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors w-full"
                            startIcon={actionLoading === request._id ? <CircularProgress size={20} /> : <X className="w-5 h-5" />}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setRequestToDelete(request._id);
                          setDeleteConfirmOpen(true);
                        }}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors w-full"
                        startIcon={<Trash2 className="w-5 h-5" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center gap-2 text-gray-900">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Confirm Delete
          </div>
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-600 mt-2">
            Are you sure you want to delete this leave request? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            className="text-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteLeaveRequest}
            variant="contained"
            color="error"
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeaveApprovals;