import { useEffect, useState } from 'react';
import axios from 'axios';


interface DroneSubmitFormSubmission {
  type: string;
  checkedItems: string[];
  managerTaskId: string;
  currentStep: number;
}

interface DroneSubmitFormDisplayProps {
  managerTaskId: string;
}


export const DroneSubmissionDisplay = ({ managerTaskId }: DroneSubmitFormDisplayProps) => {


  const [submission, setSubmission] = useState<DroneSubmitFormSubmission | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDroneSubmitForm = async () => {
      try {
        setIsLoading(true);

        // Fetch DroneSubmitForm data by type and managerTaskId
        const response = await axios.get('http://localhost:5001/api/submissions', {
          params: { type: 'DroneSubmitForm', managerTaskId },
        });

        if (response.status === 200 && response.data.data.length > 0) {
          setSubmission(response.data.data[0]); // Assuming one submission per managerTaskId
        } else {
          setError('No DroneSubmitForm submissions found for the given managerTaskId.');
        }
      } catch (err) {
        console.error('Error fetching DroneSubmitForm submission:', err);
        setError('An error occurred while fetching the DroneSubmitForm submission.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDroneSubmitForm();
  }, [managerTaskId]);

  if (isLoading) {
    return <p>Loading DroneSubmitForm submission...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!submission) {
    return <p>No DroneSubmitForm submission data available.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Drone Submit Form</h2>

      {/* Checked Items */}
      {submission.checkedItems && submission.checkedItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Checked Items</h3>
          <ul className="list-disc list-inside space-y-1">
            {submission.checkedItems.map((item, idx) => (
              <li key={idx} className="text-sm">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Step */}
      <p>
        <strong>Current Step:</strong> {submission.currentStep}
      </p>

      {/* Manager Task ID */}
      <p>
        <strong>Manager Task ID:</strong> {submission.managerTaskId}
      </p>
    </div>
  );
};
