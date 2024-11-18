import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Clock,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/employee', icon: Users, label: 'Employee Dashboard' },
    { to: '/manager', icon: ClipboardList, label: 'Manager Dashboard' },
    { to: '/admin', icon: Settings, label: 'Admin Dashboard' },
    { to: '/timesheets', icon: Clock, label: 'Timesheets' },
  ];

  return (
    <div className="w-64 bg-white h-[calc(100vh-4rem)] border-r border-gray-200">
      <div className="p-4">
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="ml-3">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;