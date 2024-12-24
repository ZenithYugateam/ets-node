import { useEffect, useState } from "react";
import axios from "axios";

interface Submission {
  projectSubmitted: boolean;
  submissions: {
    [key: string]: {
      submitted: boolean;
      systemName: string;
      media: string[]; // Array of file URLs or base64 images
      capturedImages: string[];
    };
  };
}

interface DataSubmissionDisplayProps {
  managerTaskId: string;
}

export const DataSubmissionDisplay = ({ managerTaskId }: DataSubmissionDisplayProps) => {
  const [dataSubmission, setDataSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataSubmissionDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch data submission details using the updated API
        const response = await axios.get('http://localhost:5001/api/submissions', {
          params: { type: 'DataSubmission', managerTaskId },
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          // Assuming the first submission is relevant
          const submission = response.data.data[0]; // Take the first matching submission
          setDataSubmission({
            projectSubmitted: submission.projectSubmitted || false,
            submissions: submission.submissions || {},
          });
        } else {
          setError("No data submission details found.");
        }
      } catch (err) {
        console.error("Error fetching data submission details:", err);
        setError("Failed to fetch data submission details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataSubmissionDetails();
  }, [managerTaskId]);

  if (isLoading) {
    return <p>Loading data submission details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!dataSubmission) {
    return <p>No data submission details available.</p>;
  }

  const { projectSubmitted, submissions } = dataSubmission;

  const renderSubmission = (key: string, label: string) => {
    const submission = submissions[key];

    if (!submission || !submission.submitted) {
      return (
        <div key={key} className="mt-4">
          <h3 className="text-sm font-medium text-gray-700">{label}:</h3>
          <p className="text-sm text-gray-500">Not submitted</p>
        </div>
      );
    }

    return (
      <div key={key} className="mt-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-700">{label}:</h3>
        <p className="text-sm text-gray-900">System Name: {submission.systemName || "N/A"}</p>

        {/* Uploaded Media */}
        {submission.media.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Uploaded Media:</h4>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {submission.media.map((file, index) => (
                <img
                  key={index}
                  src={file}
                  alt={`${label} Media ${index + 1}`}
                  className="w-full h-auto rounded-md shadow-sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Captured Images */}
        {submission.capturedImages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Captured Images:</h4>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {submission.capturedImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${label} Captured Image ${index + 1}`}
                  className="w-full h-auto rounded-md shadow-sm"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">Data Submission Details</h2>

      {/* Project Submission Status */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Project Submitted:</h3>
        <p className="text-sm text-gray-900">{projectSubmitted ? "Yes" : "No"}</p>
      </div>

      {/* Submissions */}
      {Object.keys(submissions).map((key) =>
        renderSubmission(key, key.replace(/([a-z])([A-Z])/g, "$1 $2"))
      )}
    </div>
  );
};
