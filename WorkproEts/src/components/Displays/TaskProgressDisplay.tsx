import { useEffect, useState } from "react";
import axios from "axios";
import { Check, RefreshCw } from "lucide-react";
import Confetti from "react-confetti";

interface TaskProgressDisplayProps {
  managerTaskId: string;
}

export const TaskProgressDisplay = ({ managerTaskId }: TaskProgressDisplayProps) => {
  const [status, setStatus] = useState<"Completed" | "Not Completed" | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  useEffect(() => {
    const fetchTaskStatus = async () => {
      try {
        setIsLoading(true);

        // Fetch task data from the server
        const response = await axios.get("http://localhost:5001/api/submissions", {
          params: { type: "Submission_task_final", managerTaskId },
        });

        const submissions = response.data.data; // Accessing the `data` property

        if (submissions && submissions.length > 0) {
          const taskData = submissions[0]; // Assuming the first submission contains the relevant data
          setStatus(taskData.status);

          if (taskData.status === "Completed") {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        } else {
          setError("No submissions found.");
        }
      } catch (err) {
        console.error("Error fetching task status:", err);
        setError("Failed to fetch task status.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskStatus();
  }, [managerTaskId]);

  if (isLoading) {
    return <p>Loading task status...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!status) {
    return <p>No task status available.</p>;
  }

  return (
    <div className="space-y-6 relative">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

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
              Not Completed
            </>
          )}
        </div>
      </div>
    </div>
  );
};
