import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Bell,
  Settings,
  Users,
  Bug,
  Menu,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { BugReportModal } from "./shared/BugReportModal";
import { NotificationContext } from "./context/NotificationContext";

const Navbar: React.FC<{ onSidebarToggle: () => void }> = ({
  onSidebarToggle,
}) => {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, markAsRead, markAllAsRead, deleteNotification } =
    useContext(NotificationContext);

  const unreadNotifications = notifications.filter((notif) => !notif.read)
    .length;

  const toggleBugModal = () => setIsBugModalOpen(!isBugModalOpen);

  const handleDropdownToggle = () => setIsDropdownOpen(!isDropdownOpen);

  const handleDropdownClose = () => setIsDropdownOpen(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleDropdownClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 flex-wrap">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Icon */}
              <button
                onClick={onSidebarToggle}
                className="lg:hidden text-gray-600 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Users className="h-8 w-8 text-indigo-600" />
              <span className="text-lg font-semibold text-gray-800">
                WorkForce Pro
              </span>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4 flex-wrap">
              {/* Notification Bell */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200"
                  onClick={handleDropdownToggle}
                  aria-expanded={isDropdownOpen}
                  aria-label="Open notifications"
                >
                  <Bell className="h-6 w-6 text-gray-500" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <button
                          className="text-sm text-blue-500 hover:underline"
                          onClick={() => markAllAsRead()}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">
                          No notifications
                        </li>
                      ) : (
                        notifications.map((notif) => {
                          let IconComponent;
                          switch (notif.type) {
                            case "info":
                              IconComponent = Info;
                              break;
                            case "warning":
                              IconComponent = AlertTriangle;
                              break;
                            case "success":
                              IconComponent = CheckCircle;
                              break;
                            case "error":
                              IconComponent = XCircle;
                              break;
                            default:
                              IconComponent = Info;
                          }

                          return (
                            <li
                              key={notif.id}
                              className={`p-4 border-b border-gray-200 flex justify-between items-center ${
                                !notif.read ? "bg-blue-50" : "bg-white"
                              } cursor-pointer transition-colors duration-200`}
                              onClick={() => {
                                if (!notif.read) markAsRead(notif.id);
                              }}
                            >
                              <div className="flex items-center">
                                <IconComponent
                                  className={`h-5 w-5 mr-2 ${
                                    !notif.read
                                      ? "text-blue-500"
                                      : "text-gray-500"
                                  }`}
                                />
                                <span
                                  className={`text-sm ${
                                    !notif.read
                                      ? "text-blue-700 font-medium"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {notif.message}
                                </span>
                              </div>
                              <button
                                className="text-sm text-red-500 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notif.id);
                                }}
                              >
                                Delete
                              </button>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Profile Link */}
              <Link
                to="/profile"
                className="p-2 rounded-full hover:bg-gray-100 focus:ring focus:ring-blue-200"
                aria-label="Go to profile"
              >
                <Settings className="h-6 w-6 text-gray-500" />
              </Link>

              {/* Bug Report Button */}
              <Button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={toggleBugModal}
                aria-label="Report a bug"
              >
                <Bug className="h-6 w-6 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bug Report Modal */}
      <BugReportModal isOpen={isBugModalOpen} onClose={toggleBugModal} />

      {/* Add top padding to avoid content being hidden behind the fixed navbar */}
      <div className="pt-16"></div>
    </>
  );
};

export default Navbar;
