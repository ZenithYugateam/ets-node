import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, RefreshCw } from 'lucide-react';
import Confetti from 'react-confetti';
import { Task } from '../../api/admin';

interface TaskProgressDisplayProps {
  managerTaskId: string;
}

export const TaskProgressDisplay = ({ managerTaskId }: TaskProgressDisplayProps) => {
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<"Completed" | "In Progress" | null>(null);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);

        // Fetch the task data from the server
        const response = await axios.get('http://localhost:5001/api/submissions', {
          params: { type: 'Submission_task_final', managerTaskId },
        });

        const taskData = response.data;

        if (taskData) {
          setTask(taskData);
          setStatus(taskData.status);
          setCurrentStep(taskData.currentStep);

          if (taskData.status === "Completed") {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        } else {
          setError('Task data not found.');
        }
      } catch (err) {
        console.error('Error fetching task:', err);
        setError('Failed to fetch task data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [managerTaskId]);

  if (isLoading) {
    return <p>Loading task details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!task) {
    return <p>No task data available.</p>;
  }

  return (
    <div className="space-y-6 relative">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Task Details</h3>
        <p className="text-sm text-gray-600">
          <strong>Task Name:</strong> {task.name}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Task Description:</strong> {task.description}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Manager Task ID:</strong> {task._id}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Current Step:</strong> {currentStep}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Task Status</h3>
        <div
          className={`flex items-center px-4 py-2 rounded-md border text-sm font-medium ${
            status === "Completed"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          {status === "Completed" ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Completed
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              In Progress
            </>
          )}
        </div>
      </div>
    </div>
  );
};
