import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const fetchDashboardStats = async () => {
  const { data } = await axios.get(`${API_URL}/admin/stats`);
  return data;
};

export const fetchUsers = async () => {
  const { data } = await axios.get(`${API_URL}/users`);
  return data;
};

export const createUser = async (userData) => {
  const { data } = await axios.post(`${API_URL}/users`, userData);
  return data;
};

export const updateUser = async ({ id, userData }) => {
  const { data } = await axios.put(`${API_URL}/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await axios.delete(`${API_URL}/users/${id}`);
  return data;
};

export const fetchDepartments = async () => {
  const { data } = await axios.get(`${API_URL}/departments`);
  return data;
};

export const createDepartment = async (departmentData) => {
  const { data } = await axios.post(`${API_URL}/departments`, departmentData);
  return data;
};

export const updateDepartment = async ({ id, departmentData }) => {
  const { data } = await axios.put(`${API_URL}/departments/${id}`, departmentData);
  return data;
};

export const deleteDepartment = async (id) => {
  const { data } = await axios.delete(`${API_URL}/departments/${id}`);
  return data;
};

export const fetchActivityLogs = async () => {
  const { data } = await axios.get(`${API_URL}/activities`);
  return data;
};

export interface Task {
  _id: string;
  title: string;
  assignee: {
    userId: string;
    name: string;
    avatar: string;
  };
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
  department: string;
  createdBy: string;
}
export interface LeaveRequest {
  _id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  description?: string;
  userid: string;
}
export const createTask = async (taskData: Omit<Task, '_id'>) => {
  const response = await axios.post(`${API_URL}/tasks3`, taskData);
  return response.data;
};

export const getTasks = async () => {
  const response = await axios.get(`${API_URL}/tasks`);
  return response.data;
};

export const updateTask = async (taskId: string, taskData: Partial<Task>) => {
  const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId: string) => {
  const response = await axios.delete(`${API_URL}/tasks/${taskId}`);
  return response.data;
};

export const getTasksByDepartment = async (department: string) => {
  const response = await axios.get(`${API_URL}/tasks/department/${department}`);
  return response.data;
};

export const getTasksByAssignee = async (userId: string) => {
  const response = await axios.get(`${API_URL}/tasks/assignee/${userId}`);
  return response.data;
};

export const getProfileData = async (userId: string) => {
  const response = await axios.post(`${API_URL}/getProfileData`, {userId});
  return response.data;
};

export const updateProfileData = async (userId: string, newPassword: any) => {
  const response = await axios.patch(`${API_URL}/usersData/${userId}`, {newPassword});
  return response.data;
}
export const createLeaveRequest = async (data: Partial<LeaveRequest>) => {
  const response = await fetch(`${API_URL}/leave-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create leave request');
  }

  return response.json();
};

export const getUserData = async (userId: string) => {
  const response = await fetch(`${API_URL}/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json(); // Get the error message from the response body
    console.log('Error response: ', errorData);
    throw new Error(errorData.message || 'Failed to fetch user data');
  }

  const data = await response.json();
  console.log("Fetched user data:", data); // Log the user data
  return data;
};

export const getLeaveRequests = async (userid?: string | null, assigneeId?: string | null) => {
  const url = assigneeId
    ? `${API_URL}/leave-requests?assigneeId=${assigneeId}`
    : userid
    ? `${API_URL}/leave-requests?userid=${userid}`
    : `${API_URL}/leave-requests`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch leave requests');
  }

  return response.json();
};

export const updateLeaveRequestStatus = async (requestId: string, status: any) => {
  const response = await fetch(`${API_URL}/leave-requests/${requestId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update leave request status');
  }

  return response.json();
};

export const deleteLeaveRequest = async (id: string) => {
  try {
    const { data } = await axios.delete(`${API_URL}/leave-requests/${id}`);
    return data; // Returning the response from the API after successful deletion
  } catch (error) {
    // Handle the error appropriately
    console.error("Error deleting leave request:", error);
    throw new Error('Failed to delete leave request');
  }
};