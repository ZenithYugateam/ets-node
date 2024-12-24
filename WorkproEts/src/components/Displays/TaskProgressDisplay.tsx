import { useEffect, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import { Check, RefreshCw } from "lucide-react";

interface TaskProgressDisplayProps {
  managerTaskId: string;
  type: string; // Type of submission (e.g., "afterFlight")
}

export const TaskProgressDisplay = ({ managerTaskId, type }: TaskProgressDisplayProps) => {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  useEffect(() => {
    const fetchTaskProgress = async () => {
      try {
        setIsLoading(true);

        // Fetch submission data using the provided API
        const response = await axios.get("https://ets-node-dpa9.onrender.com/api/submissions", {
          params: { type, managerTaskId },
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          // Assuming the status is part of the first submission object
          const submission = response.data.data[0];

          setStatus(submission.status || "In Progress");

          if (submission.status === "Completed") {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        } else {
          setError("No submissions found.");
        }
      } catch (err) {
        console.error("Error fetching submission data:", err);
        setError("Failed to fetch task progress.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskProgress();
  }, [managerTaskId, type]);

  if (isLoading) {
    return <p>Loading task progress...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!status) {
    return <p>No progress data available.</p>;
  }

  return (
    <div className="space-y-6 relative">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <h2 className="text-lg font-bold text-gray-800">Task Progress</h2>

      <div className="flex items-center space-x-4">
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
