import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Users, Building2, ClipboardList, AlertCircle, LogOut } from 'lucide-react';
import UserManagement from '../components/admin/UserManagement';
import ProjectManagement from '../components/admin/ProjectManagement';
import LeaveApprovals from '../components/shared/LeaveApprovals';
import { fetchDashboardStats, fetchUsers, fetchDepartments } from '../api/admin';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
}

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // State for metrics
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [totalManagers, setTotalManagers] = useState<number>(0);
  const [departments, setDepartments] = useState<number>(0);
  const [adminName, setAdminName] = useState<string>('');

  // Fetch dashboard stats using react-query
  const { data: stats } = useQuery('dashboardStats', fetchDashboardStats);

  // Fetch all users and update metrics
  const fetchAllUsers = async () => {
    try {
      const users = await fetchUsers(); // Call fetchUsers API
      const employees = users.filter((user: { role: string }) => user.role === 'Employee').length;
      const managers = users.filter((user: { role: string }) => user.role === 'Manager').length;

      setTotalEmployees(employees);
      setTotalManagers(managers);

      const adminId = localStorage.getItem('userId');
      const admin = users.find((user: { _id: string | null }) => user._id === adminId);
      if (admin) setAdminName(admin.name);
    } catch (error: any) {
      toast.error(`Error fetching users: ${error.message}`);
    }
  };

  // Fetch all departments
  const fetchAllDepartments = async () => {
    try {
      const departments = await fetchDepartments(); // Call fetchDepartments API
      setDepartments(departments.length);
    } catch (error: any) {
      toast.error(`Error fetching departments: ${error.message}`);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllUsers();
    fetchAllDepartments();
  }, []);

  // Function to handle updates dynamically
  const handleDataUpdated = () => {
    fetchAllUsers();
    fetchAllDepartments();
    queryClient.invalidateQueries('dashboardStats');
  };

  // Metrics data
  const metrics = [
    {
      id: 1,
      label: 'Total Employees',
      value: totalEmployees || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 2,
      label: 'Departments',
      value: stats?.totalDepartments || departments || 0,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    // {
    //   id: 3,
    //   label: 'Active Tasks',
    //   value: stats?.activeTasks || 0,
    //   icon: ClipboardList,
    //   color: 'text-purple-600',
    //   bgColor: 'bg-purple-100',
    // },
    // {
    //   id: 4,
    //   label: 'Pending Approvals',
    //   value: stats?.pendingApprovals || 0,
    //   icon: AlertCircle,
    //   color: 'text-orange-600',
    //   bgColor: 'bg-orange-100',
    // },
    {
      id: 5,
      label: 'Total Managers',
      value: totalManagers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, <span className="text-indigo-600">{sessionStorage.getItem('userName')}</span>
        </h1>
        <button
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          onClick={() => {
            localStorage.clear(); // Clear session
            window.location.href = '/'; // Redirect to login
          }}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{metric.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <UserManagement adminId={localStorage.getItem('userId')} fetchAllUsers= {fetchAllUsers} />
      <ProjectManagement />
    </div>
  );
};

export default AdminDashboard;
