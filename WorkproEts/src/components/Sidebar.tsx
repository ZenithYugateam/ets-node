import { Calendar, ClipboardList, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
}: {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const location = useLocation();
  const [role, setRole] = useState(() => {
    const storedRole = sessionStorage.getItem("role");
    return storedRole ? JSON.parse(storedRole) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedRole = sessionStorage.getItem("role");
      setRole(updatedRole ? JSON.parse(updatedRole) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const dashboardRoute = `/${role || "default"}`;

  const links = [
    { to: dashboardRoute, icon: LayoutDashboard, label: "Dashboard" },
    ...(role === "Admin"
      ? [{ to: "/leave-approvals", icon: Calendar, label: "Leave Approvals" }]
      : [{ to: "/leave-requests", icon: Calendar, label: "Leave Requests" }]),
    { to: "/work-sheets", icon: ClipboardList, label: "Worksheet" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full overflow-y-auto">
          <nav className="space-y-1 p-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={toggleSidebar} // Close sidebar on link click (for mobile)
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? "text-indigo-600" : "text-gray-400"
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
