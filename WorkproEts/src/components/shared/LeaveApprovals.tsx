import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getLeaveRequests, updateLeaveRequestStatus, deleteLeaveRequest } from "../../api/admin";
import { Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';

interface LeaveApprovalsProps {
  adminId: string;
}

const LeaveApprovals: React.FC<LeaveApprovalsProps> = ({ adminId }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const fetchLeaveRequests = async () => {
    try {
      const data = await getLeaveRequests(null, adminId);
      setLeaveRequests(data);
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

  const handleDeleteLeaveRequest = async (id: string) => {
    try {
      await deleteLeaveRequest(id);
      toast.success(`Leave request deleted successfully`);
      fetchLeaveRequests(); // Optionally, refetch to update the list after deletion
    } catch (error) {
      toast.error('Failed to delete leave request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress color="primary" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Leave Requests</h2>
      </div>

      {leaveRequests.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No leave requests found
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>{request.username}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">
                      {request.reason}
                      {request.description && (
                        <Button
                          onClick={() => setSelectedRequest(request)}
                          size="small"
                          color="primary"
                        >
                          <svg className="w-4 h-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.status === 'approved' && <CheckCircleIcon color="success" />}
                    {request.status === 'rejected' && <CancelIcon color="error" />}
                    {/* {request.status === 'pending' && <HourglassEmptyIcon />} */}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleStatusUpdate(request._id, 'approved')}
                            disabled={actionLoading === request._id}
                            startIcon={actionLoading === request._id ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleStatusUpdate(request._id, 'rejected')}
                            disabled={actionLoading === request._id}
                            startIcon={actionLoading === request._id ? <CircularProgress size={20} color="inherit" /> : <CancelIcon />}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="contained"
                        color="default"
                        onClick={() => handleDeleteLeaveRequest(request._id)}
                        startIcon={<CloseIcon />}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default LeaveApprovals;
