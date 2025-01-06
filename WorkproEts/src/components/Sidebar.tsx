import { Calendar, ClipboardList, LayoutDashboard, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
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

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const dashboardRoute = `/${role || 'default'}`;

  console.log("user id : ", sessionStorage.getItem("userId"))

  const links = [
    { to: dashboardRoute, icon: LayoutDashboard, label: 'Dashboard' },
    ...(role === 'Admin'
      ? [{ to: '/leave-approvals', icon: Calendar, label: 'Leave Approvals' }]
      : [{ to: '/leave-requests', icon: Calendar, label: 'Leave Requests' }]),
    { to: '/work-sheets', icon: ClipboardList, label: 'Worksheet' },
    ...(role === 'Admin' || 
      (role == 'Manager'  && sessionStorage.getItem('userId') === '677285de51c34d16ee98fac7' )  || 
      (role == 'Manager'  && sessionStorage.getItem('userId') === '6772870251c34d16ee98fad0' )  || 
      (role == 'Manager'  && sessionStorage.getItem('userId') === '6772873751c34d16ee98fad3' )  ||
      (role == 'Manager'  && sessionStorage.getItem('userId') === '6772865a51c34d16ee98faca' )  
      ? [{ to: '/attendance-view', icon: Calendar, label: 'Attendance View' }]
      : []), 
    ...(role === 'Admin' || role === 'Manager'
      ? [{ to: '/inventory', icon: ClipboardList, label: 'IVMS' }]
      : []),
  ];
  

  return (
    <>
      {/* Mobile Menu Button */}
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

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-auto transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
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
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="ml-3">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;