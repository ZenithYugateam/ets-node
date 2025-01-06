import { useEffect, useState } from 'react';
import axios from 'axios';

type Flight = {
  flightNo: string;
  takeoffTime: string;
};

type BeforeFlightDetails = {
  crew: string[];
  method: string;
  sightName: string;
  date: string; // ISO string
  flights: Flight[];
  images: string[]; // Base64 strings or URLs
};

interface BeforeFlightDisplayProps {
  managerTaskId: string;
}

export const BeforeFlightDisplay = ({ managerTaskId }: BeforeFlightDisplayProps) => {
  const [beforeFlightDetails, setBeforeFlightDetails] = useState<BeforeFlightDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBeforeFlightDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch before-flight details using the updated API
        const response = await axios.get('http://localhost:5001/api/submissions', {
          params: { type: 'beforeFlight', managerTaskId },
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          // Assuming the API returns an array of submissions
          const submission = response.data.data[0]; // Take the first matching submission
          setBeforeFlightDetails({
            crew: submission.crew || [],
            method: submission.method || 'N/A',
            sightName: submission.sightName || 'N/A',
            date: submission.date || '',
            flights: submission.flights || [],
            images: submission.images || [],
          });
        } else {
          setError('No before-flight details found.');
        }
      } catch (err) {
        console.error('Error fetching before-flight details:', err);
        setError('Failed to fetch before-flight details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBeforeFlightDetails();
  }, [managerTaskId]);

  if (isLoading) {
    return <p>Loading before-flight details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!beforeFlightDetails) {
    return <p>No before-flight details available.</p>;
  }

  const { crew, method, sightName, date, flights, images } = beforeFlightDetails;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">Before-Flight Details</h2>

      {/* Crew */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Crew Members:</h3>
        {crew.length > 0 ? (
          <ul className="mt-2 list-disc list-inside space-y-1">
            {crew.map((member, index) => (
              <li key={index} className="text-sm text-gray-900">
                {member}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No crew members specified.</p>
        )}
      </div>

      {/* Method of Survey */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Method of Survey:</h3>
        <p className="text-sm text-gray-900">{method}</p>
      </div>

      {/* Sight Name */}
      {sightName && (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Sight Name:</h3>
          <p className="text-sm text-gray-900">{sightName}</p>
        </div>
      )}

      {/* Date */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Date:</h3>
        <p className="text-sm text-gray-900">
          {date ? new Date(date).toLocaleDateString() : 'N/A'}
        </p>
      </div>

      {/* Flights */}
      {flights.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Flights:</h3>
          <ul className="mt-2 space-y-2">
            {flights.map((flight, index) => (
              <li
                key={index}
                className="flex justify-between bg-gray-100 px-4 py-2 rounded-md shadow-sm"
              >
                <p className="text-sm font-medium">Flight No: {flight.flightNo}</p>
                <p className="text-sm">Take-off Time: {flight.takeoffTime}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

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
