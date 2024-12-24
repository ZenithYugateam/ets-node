import { useEffect, useState } from 'react';
import axios from 'axios';

type ReturnToOfficeDetails = {
  selectedVehicles: string[];
  timeReached: string;
  endReading: number;
  images: string[]; // Base64 strings or URLs
};

interface ReturnToOfficeDisplayProps {
  managerTaskId: string;
}

export const ReturnToOfficeDisplay = ({ managerTaskId }: ReturnToOfficeDisplayProps) => {
  const [returnToOfficeDetails, setReturnToOfficeDetails] = useState<ReturnToOfficeDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReturnToOfficeDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch return-to-office details using the updated API
        const response = await axios.get('http://localhost:5001/api/submissions', {
          params: { type: 'returnToOffice', managerTaskId },
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          // Assuming the API returns an array of submissions
          const submission = response.data.data[0]; // Take the first matching submission
          setReturnToOfficeDetails({
            selectedVehicles: submission.selectedVehicles || [],
            timeReached: submission.timeReached || 'N/A',
            endReading: submission.endReading || 'N/A',
            images: submission.images || [],
          });
        } else {
          setError('No return-to-office details found.');
        }
      } catch (err) {
        console.error('Error fetching return-to-office details:', err);
        setError('Failed to fetch return-to-office details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReturnToOfficeDetails();
  }, [managerTaskId]);

  if (isLoading) {
    return <p>Loading return-to-office details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!returnToOfficeDetails) {
    return <p>No return-to-office details available.</p>;
  }

  const { selectedVehicles, timeReached, endReading, images } = returnToOfficeDetails;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">Return to Office Details</h2>

      {/* Selected Vehicles */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Selected Vehicles:</h3>
        {selectedVehicles.length > 0 ? (
          <ul className="mt-2 list-disc list-inside space-y-1">
            {selectedVehicles.map((vehicle, index) => (
              <li key={index} className="text-sm text-gray-900">
                {vehicle}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No vehicles selected.</p>
        )}
      </div>

      {/* Time Reached */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Time Reached:</h3>
        <p className="text-sm text-gray-900">{timeReached}</p>
      </div>

      {/* End Reading */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">End Reading:</h3>
        <p className="text-sm text-gray-900">{endReading}</p>
      </div>

      {/* Images */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Uploaded Images:</h3>
        {images.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Uploaded ${index}`}
                className="w-full h-auto rounded-md shadow-sm"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No images uploaded.</p>
        )}
      </div>
    </div>
  );
};
