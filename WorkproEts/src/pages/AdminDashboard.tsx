import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Users, Building2, ClipboardList, AlertCircle, LogOut } from 'lucide-react';
import UserManagement from '../components/admin/UserManagement';
import TaskManagement from '../components/admin/TaskManagement';
import DepartmentConfig from '../components/admin/DepartmentConfig';
import ActivityLogs from '../components/admin/ActivityLogs';
import ProjectManagement from '../components/admin/ProjectManagement';
import { fetchDashboardStats } from '../api/admin';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { data: stats } = useQuery('dashboardStats', fetchDashboardStats);
  const [userCount, setUserCount] = useState(0);
  const [groupedByDepartment, setGroupedByDepartment] = useState({});
  const [adminName, setAdminName] = useState<string>(''); // Store admin name

  useEffect(() => {
    const adminId = localStorage.getItem('userId'); // Get `adminId` from localStorage

    const fetchAdminName = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/usersData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();

        // Find the admin user and set the name
        const adminUser = data.find((user: any) => user._id === adminId);
        if (adminUser) {
          setAdminName(adminUser.name);
        } else {
          setAdminName('Admin'); // Default fallback
        }
      } catch (error) {
        toast.error(`Error fetching admin data: ${error.message}`);
      }
    };

    fetchAdminName();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, <span className="text-indigo-600">{adminName}</span>
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
        {/* Metrics */}
        {stats &&
          [
            {
              id: 1,
              label: 'Total Employees',
              value: stats.totalEmployees || 0,
              icon: Users,
              color: 'text-blue-600',
              bgColor: 'bg-blue-100',
            },
            {
              id: 2,
              label: 'Departments',
              value: stats.totalDepartments || 0,
              icon: Building2,
              color: 'text-green-600',
              bgColor: 'bg-green-100',
            },
            {
              id: 3,
              label: 'Active Tasks',
              value: stats.activeTasks || 0,
              icon: ClipboardList,
              color: 'text-purple-600',
              bgColor: 'bg-purple-100',
            },
            {
              id: 4,
              label: 'Pending Approvals',
              value: stats.pendingApprovals || 0,
              icon: AlertCircle,
              color: 'text-orange-600',
              bgColor: 'bg-orange-100',
            },
          ].map((metric) => {
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

      {/* Admin components */}
      <UserManagement adminId={localStorage.getItem('userId')!} />
      <ProjectManagement />
      <ActivityLogs />
    </div>
  );
};

export default AdminDashboard;
