import { useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import axios from 'axios';
import Confetti from 'react-confetti'; // Import Confetti
import { Task } from '../types';

type Status = "Completed" | "In Progress"; // Restrict the status types

interface TaskProgressFormProps {
  currentStep: number;
  task: Task;
} 
export const TaskProgressForm = ({ currentStep, task }: TaskProgressFormProps) => {
  const [status, setStatus] = useState<Status | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleStatusChange = async (newStatus: Status) => {
    setStatus(newStatus);
    try {
      const response = await axios.put(`http://localhost:5000/api/manager-tasks/update-status`, {
        id: task._id, 
        status: newStatus,
      });

      if (response.status === 200 && newStatus === "Completed") {
        setShowConfetti(true); 
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div className="space-y-6 relative">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Task Status</h3>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => handleStatusChange("Completed")}
            className={`flex items-center px-4 py-2 rounded-md ${
              status === "Completed"
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            } border`}
          >
            <Check className="h-4 w-4 mr-2" />
            Completed
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange("In Progress")}
            className={`flex items-center px-4 py-2 rounded-md ${
              status === "In Progress"
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            } border`}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Not Completed
          </button>
        </div>
      </div>
    </div>
  );
};
