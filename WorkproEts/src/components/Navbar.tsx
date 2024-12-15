// src/components/Navbar.tsx
import { Bell, Settings, Users, Bug } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { useState } from "react";
import { BugReportModal } from "./shared/BugReportModal"; // Named import

const Navbar = () => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold">WorkForce Pro</span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-6 w-6 text-gray-500" />
              </button>
              <Link to="/profile" className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="h-6 w-6 text-gray-500" />
              </Link>
              <Button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={handleClick}
              >
                <Bug className="h-6 w-6 text-red-500" />
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
