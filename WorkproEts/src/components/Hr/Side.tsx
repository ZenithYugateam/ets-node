import React from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { Users, Building2, Home, FileText, Briefcase, UserCheck, Clipboard, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation(); // Get the current route
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900">Workspace</h1>
      </div>
      
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          <a
            href="/HRDashboard"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50 group'
            }`}
          >
            <Home size={20} className={`${isActive('/') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'}`} />
            <span className="ml-3 text-sm font-medium">Dashboard</span>
          </a>
          
          <a
            href="/Userview"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive('/Userview') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50 group'
            }`}
          >
            <Users size={20} className={`${isActive('/Userview') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'}`} />
            <span className="ml-3 text-sm font-medium">User Management</span>
          </a>
          
          <a
            href="/clients"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive('/clients') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50 group'
            }`}
          >
            <Briefcase size={20} className={`${isActive('/clients') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'}`} />
            <span className="ml-3 text-sm font-medium">Client Management</span>
          </a>
          
          <a
            href="/students"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive('/students') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50 group'
            }`}
          >
            <UserCheck size={20} className={`${isActive('/students') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'}`} />
            <span className="ml-3 text-sm font-medium">Student Management</span>
          </a>
          
          <a
            href="/worksheets"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive('/worksheets') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50 group'
            }`}
          >
            <FileText size={20} className={`${isActive('/worksheets') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'}`} />
            <span className="ml-3 text-sm font-medium">Worksheets</span>
          </a>
          
          <a
            href="/leave-requests"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive('/leave-requests') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50 group'
            }`}
          >
            <Clipboard size={20} className={`${isActive('/leave-requests') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'}`} />
            <span className="ml-3 text-sm font-medium">Leave Requests</span>
          </a>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <a
          href="/settings"
          className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive('/settings') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50 group'
          }`}
        >
          <Settings size={20} className={`${isActive('/settings') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-900'}`} />
          <span className="ml-3 text-sm font-medium">Settings</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
