import {
  Bell,
  Settings,
  Users,
  Bug,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { useState, useContext, useEffect, useRef } from "react";
import { BugReportModal } from "./shared/BugReportModal";
import { NotificationContext } from "./context/NotificationContext";

const Navbar = () => {
  const [open, setOpen] = useState<boolean>(false);
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useContext(NotificationContext);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const unreadNotifications = notifications.filter((notif) => !notif.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo and title - hidden on mobile when menu is open */}
              <div className="flex items-center ml-12 lg:ml-0">
                <Users className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-semibold hidden sm:block">
                  WorkForce Pro
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Bell Button with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-gray-200 rounded-md shadow-lg z-20">
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
                    <ul className="max-h-[60vh] sm:max-h-60 overflow-y-auto">
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
                              className={`p-4 border-b border-gray-200 flex justify-between items-start ${
                                !notif.read ? "bg-blue-50" : "bg-white"
                              } cursor-pointer transition-colors duration-200`}
                              onClick={() => {
                                if (!notif.read) {
                                  markAsRead(notif.id);
                                }
                              }}
                            >
                              <div className="flex items-start">
                                <IconComponent
                                  className={`h-5 w-5 mr-2 flex-shrink-0 ${
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
                              <div className="flex flex-col items-end ml-2">
                                {!notif.read && (
                                  <span className="text-xs text-blue-500 mb-1">
                                    New
                                  </span>
                                )}
                                <button
                                  className="text-xs text-red-500 hover:underline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notif.id);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <Link
                to="/profile"
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
              </Link>
              
              <Button
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 min-w-0"
                onClick={handleClick}
                aria-label="Report Bug"
              >
                <Bug className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Add top padding to avoid content being hidden behind the fixed navbar */}
      <div className="pt-16">
        <BugReportModal isOpen={open} onClose={handleClose} />
      </div>
    </>
  );
};

export default Navbar;