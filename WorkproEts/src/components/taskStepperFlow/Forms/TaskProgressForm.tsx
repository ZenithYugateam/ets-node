import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Task } from '../types';

type TaskStatus = 'completed' | 'not_completed';


interface TaskProgressFormProps {
  currentStep: number;
  task: Task;
}

export const TaskProgressForm = ({currentStep, task}:TaskProgressFormProps) => {
  const [status, setStatus] = useState<TaskStatus | null>(null);

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    console.log(`Task Status: ${newStatus === 'completed' ? 'Completed' : 'Not Completed'}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Task Status</h3>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => handleStatusChange('completed')}
            className={`flex items-center px-4 py-2 rounded-md ${
              status === 'completed'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            } border`}
          >
            <Check className="h-4 w-4 mr-2" />
            Completed
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('not_completed')}
            className={`flex items-center px-4 py-2 rounded-md ${
              status === 'not_completed'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            } border`}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Not Completed
          </button>
        </div>
      </div>
    </div>
  );
};
