
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { BugReportModal } from './BugReportModal';
import { useState } from 'react';

const BugReporting = () => {
    const [open , setOpen] = useState<boolean>(true);
    const onClose = () => {
        setOpen(false);
    }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
              <BugReportModal isOpen = {open} onClose = {onClose} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BugReporting;
