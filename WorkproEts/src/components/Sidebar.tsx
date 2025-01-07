import { Calendar, ClipboardList, LayoutDashboard, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type AccessList = {
  [key: string]: boolean;
};

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(() => {
    const storedRole = sessionStorage.getItem('role');
    return storedRole ? JSON.parse(storedRole) : null;
  });
  const [accessList, setAccessList] = useState<AccessList>({});

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

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchAccessList = async () => {
      const userId = sessionStorage.getItem('userId');
      if (userId) {
        try {
          const response = await fetch(`https://ets-node-1.onrender.com/users/${userId}/access-list`);
          const data = await response.json();
          if (response.ok) {
            console.log('Fetched access list:', data.accessList); // Log the access list
            setAccessList(data.accessList || {});
          } else {
            console.error('Failed to fetch access list:', data.error);
          }
        } catch (error) {
          console.error('Error fetching access list:', error);
        }
      }
    };
    fetchAccessList();
  }, []);

  const dashboardRoute = `/${role || 'default'}`;

  const links = [
    // Leave Approvals or Leave Requests
    ...(role === 'Admin'
      ? [{ to: '/leave-approvals', icon: Calendar, label: 'Leave Approvals', key: 'leaveApprovals' }]
      : [{ to: '/leave-requests', icon: Calendar, label: 'Leave Requests', key: 'leave_request' }]),
    
    // Worksheet
    { to: '/work-sheets', icon: ClipboardList, label: 'Worksheet', key: 'worksheet' },
    
    // Attendance View (conditional based on role and userId)
    ...(role === 'Admin' || 
      (role === 'Manager' && ['677285de51c34d16ee98fac7', '6772870251c34d16ee98fad0', '6772873751c34d16ee98fad3', '6772865a51c34d16ee98faca'].includes(sessionStorage.getItem('userId')))
      ? [{ to: '/attendance-view', icon: Calendar, label: 'Attendance View', key: 'attendance_view' }]
      : []),
  
    // Access Components (Admin only)
    ...(role === 'Admin'
      ? [{ to: '/access-components', icon: ClipboardList, label: 'Access Components', key: 'accessComponents' }]
      : []),
  
    // IVMS (Admin and Manager only)
    ...(role === 'Admin' || role === 'Manager'
      ? [{ to: '/inventory', icon: ClipboardList, label: 'IVMS', key: 'ivms' }]
      : []),
  ];
  

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-4 z-20 p-2 rounded-md hover:bg-gray-100"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-auto transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          <nav className="space-y-1">
            {/* Dashboard Link (Always Present) */}
            <Link
              to={dashboardRoute}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                location.pathname === dashboardRoute
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard
                className={`h-5 w-5 ${
                  location.pathname === dashboardRoute
                    ? 'text-indigo-600'
                    : 'text-gray-400'
                }`}
              />
              <span className="ml-3">Dashboard</span>
            </Link>

            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;

              const hasAccess = 
                role === 'Admin' 
                  ? link.key !== 'leave_request' 
                  : accessList[link.key]; // Other roles rely on accessList

              return hasAccess ? (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="ml-3">{link.label}</span>
                </Link>
              ) : null;
            })}


          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
