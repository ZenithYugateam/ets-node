import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Task } from '../types';


interface TaskStepperProps {
  currentStep: number;
  task: Task;
}

export const DataSubmissionForm = ( {currentStep, task} : TaskStepperProps) => {
  const [mediaSubmitted, setMediaSubmitted] = useState<boolean | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const handleSubmit = () => {
    setFormSubmitted(true);
    
    if (mediaSubmitted === true) {
      console.log('Media Submitted: Yes');
    } else if (mediaSubmitted === false) {
      console.log('Media Submitted: No');
    } else {
      console.log('Media Submitted: Not selected');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Media Submitted</h3>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setMediaSubmitted(true)}
            className={`flex items-center px-4 py-2 rounded-md ${
              mediaSubmitted === true
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            } border`}
          >
            <Check className="h-4 w-4 mr-2" />
            Yes
          </button>
          <button
            type="button"
            onClick={() => setMediaSubmitted(false)}
            className={`flex items-center px-4 py-2 rounded-md ${
              mediaSubmitted === false
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            } border`}
          >
            <X className="h-4 w-4 mr-2" />
            No
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Submit
      </button>
    </div>
  );
};
