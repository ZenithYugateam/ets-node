import { Plus, Search, LogOut } from 'lucide-react';
import TeamOverview from '../components/manager/TeamOverview';
import TaskManager from '../components/manager/TaskManager';
import PerformanceOverview from '../components/manager/PerformanceOverview';
import TaskManagement from '../components/admin/TaskManagement';

const ManagerDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus className="h-5 w-5 mr-2" />
            New Task
          </button>
          <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>

        </div>
      </div>

      <TeamOverview />
      <TaskManagement />
      <TaskManager />
      <PerformanceOverview />
    </div>
  );
};

export default ManagerDashboard;
