import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  type: 'vacation' | 'sick' | 'personal';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  employeeRole: 'employee' | 'manager';
  statusUpdatedAt?: string;
  statusUpdatedBy?: string;
}

interface LeaveContextType {
  leaves: LeaveRequest[];
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected', updatedBy: string) => void;
  addLeave: (leave: Omit<LeaveRequest, 'id' | 'status'>) => void;
  getLeavesByEmployee: (employeeName: string) => LeaveRequest[];
  getLeavesByRole: (role: 'employee' | 'manager') => LeaveRequest[];
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch leave requests from the server
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get('/api/leave-requests');
        console.log(response);
        if (Array.isArray(response.data)) {
          setLeaves(response.data);
          console.log(fetchLeaves);
        } else {
          console.error('Unexpected API response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLeaves();
  }, []);
  

  const updateLeaveStatus = (id: string, status: 'approved' | 'rejected', updatedBy: string) => {
    setLeaves(currentLeaves =>
      currentLeaves.map(leave =>
        leave.id === id
          ? {
              ...leave,
              status,
              statusUpdatedAt: new Date().toISOString(),
              statusUpdatedBy: updatedBy,
            }
          : leave
      )
    );
  };

  const addLeave = (leave: Omit<LeaveRequest, 'id' | 'status'>) => {
    const newLeave: LeaveRequest = {
      ...leave,
      id: Date.now().toString(),
      status: 'pending',
    };
    setLeaves(currentLeaves => [...currentLeaves, newLeave]);
  };

  const getLeavesByEmployee = (employeeName: string) => {
    if (!Array.isArray(leaves)) {
      console.error('Leaves is not an array:', leaves);
      return [];
    }
    return leaves.filter(leave => leave.employeeName === employeeName);
  };
  

  const getLeavesByRole = (role: 'employee' | 'manager') => {
    return leaves.filter(leave => leave.employeeRole === role);
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!Array.isArray(leaves)) {
    return <div>Error: Data is not in the expected format</div>;
  }
  console.log('Leaves:', leaves);


  return (
    <LeaveContext.Provider
      value={{
        leaves,
        updateLeaveStatus,
        addLeave,
        getLeavesByEmployee,
        getLeavesByRole,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};
