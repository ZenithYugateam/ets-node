import { Bell, Settings, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Bug } from 'lucide-react';
import { Box, Button } from "@mui/material";
import {useState} from "react";
import { BugReportModal } from "./shared/BugReportModal";

const Navbar = () => {
  const [open, setOpen] = useState<boolean>(false);
  const handleClick = () => {
    setOpen(true);
    <BugReportModal isOpen={open} onClose={()=>setOpen(false)} />
  };
  return (
    <>
    <nav className="bg-white border-b border-gray-200">
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
    <Box>
      <BugReportModal isOpen={open} onClose={() => setOpen(false)} />
    </Box>
    </>
  );
};

export default Navbar;
