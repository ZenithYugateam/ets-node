import { Calendar, ClipboardList, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [role, setRole] = useState(() => {
    const storedRole = sessionStorage.getItem('role');
    return storedRole ? JSON.parse(storedRole) : null; 
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedRole = sessionStorage.getItem('role');
      setRole(updatedRole ? JSON.parse(updatedRole) : null); 
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const dashboardRoute = `/${role || 'default'}`; 

  const links = [
    { to: dashboardRoute, icon: LayoutDashboard, label: 'Dashboard' },
    ...(role === 'Admin'
      ? [{ to: '/leave-approvals', icon: Calendar, label: 'Leave Approvals' }]
      : [{ to: '/leave-requests', icon: Calendar, label: 'Leave Requests' }]),
    { to: '/work-sheets', icon: ClipboardList, label: 'Worksheet' },
  ];

  return (
    <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-auto">
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
