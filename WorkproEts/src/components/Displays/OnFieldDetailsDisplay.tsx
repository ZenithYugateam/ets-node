import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

type Location = {
  latitude: number;
  longitude: number;
};

type OnFieldDetails = {
  location: Location | null;
  isReporting: boolean;
};

interface OnFieldDetailsDisplayProps {
  managerTaskId: string;
}

export const OnFieldDetailsDisplay = ({ managerTaskId }: OnFieldDetailsDisplayProps) => {
  const [onFieldDetails, setOnFieldDetails] = useState<OnFieldDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnFieldDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch on-field details using the updated API
        const response = await axios.get('http://localhost:5001/api/submissions', {
          params: { type: 'onFieldDetails', managerTaskId },
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          // Assuming the API returns an array of submissions
          const submission = response.data.data[0]; // Take the first submission if multiple exist
          setOnFieldDetails({
            location: submission.location || null,
            isReporting: submission.isReporting || false,
          });
        } else {
          setError('No on-field details found.');
        }
      } catch (err) {
        console.error('Error fetching on-field details:', err);
        setError('Failed to fetch on-field details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnFieldDetails();
  }, [managerTaskId]);

  if (isLoading) {
    return <p>Loading on-field details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!onFieldDetails) {
    return <p>No on-field details available.</p>;
  }

  const { location, isReporting } = onFieldDetails;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">On-Field Details</h2>

      {/* Field Reporting */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Field Reporting:</h3>
        <p className="text-sm text-gray-900">{isReporting ? 'Yes' : 'No'}</p>
      </div>

      {/* Location */}
      {location ? (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Location:</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Latitude</p>
              <p className="text-sm font-medium">{location.latitude}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Longitude</p>
              <p className="text-sm font-medium">{location.longitude}</p>
            </div>
          </div>

          {/* Map */}
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[location.latitude, location.longitude]}>
              <Popup>
                Latitude: {location.latitude}, Longitude: {location.longitude}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Location not available.</p>
      )}
    </div>
  );
};
