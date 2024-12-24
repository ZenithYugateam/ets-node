import { useEffect, useState } from 'react';
import axios from 'axios';

type Flight = {
  flightNo: string;
  landingTime: string;
};

type AfterFlightDetails = {
  crew: string[];
  method: string;
  sightName: string;
  flights: Flight[];
  images: string[]; // Base64 strings or URLs
};

interface AfterFlightDisplayProps {
  managerTaskId: string;
}

export const AfterFlightDisplay = ({ managerTaskId }: AfterFlightDisplayProps) => {
  const [afterFlightDetails, setAfterFlightDetails] = useState<AfterFlightDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAfterFlightDetails = async () => {
      try {
        setIsLoading(true);
  
        const response = await axios.get('http://localhost:5001/api/submissions', {
          params: { type: 'afterFlight', managerTaskId },
        });
  
        console.log('API Raw Response:', response.data);
  
        if (response.data && response.data.data && response.data.data.length > 0) {
          const submission = response.data.data[0];
  
          console.log('Mapped Flights:', submission.flights);
  
          setAfterFlightDetails({
            crew: submission.crew || [],
            method: submission.method || 'N/A',
            sightName: submission.sightName || 'N/A',
            flights: submission.flights.map((flight: any) => ({
              flightNo: flight.flightNo || 'N/A',
              landingTime: flight.landingTime || 'N/A',
            })) || [],
            images: submission.images || [],
          });
        } else {
          setError('No after-flight details found.');
        }
      } catch (err) {
        console.error('Error fetching after-flight details:', err);
        setError('Failed to fetch after-flight details.');
      } finally {
        setIsLoading(false);
      }
    };  
  
    fetchAfterFlightDetails();
  }, [managerTaskId]);
  
  
  

  if (isLoading) {
    return <p>Loading after-flight details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!afterFlightDetails) {
    return <p>No after-flight details available.</p>;
  }

  const { crew, method, sightName, flights, images } = afterFlightDetails;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">After-Flight Details</h2>

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

      {/* Method */}
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
                <p className="text-sm">Landing Time: {flight.landingTime}</p>
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
