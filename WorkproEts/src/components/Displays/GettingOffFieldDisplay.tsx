import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

type Location = {
  latitude: number;
  longitude: number;
};

type GettingOffFieldDetails = {
  location: Location | null;
  departingTime: string;
};

interface GettingOffFieldDisplayProps {
  managerTaskId: string;
}

export const GettingOffFieldDisplay = ({ managerTaskId }: GettingOffFieldDisplayProps) => {
  const [gettingOffFieldDetails, setGettingOffFieldDetails] = useState<GettingOffFieldDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGettingOffFieldDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch getting off field details using the updated API
        const response = await axios.get('https://ets-node-dpa9.onrender.com/api/submissions', {
          params: { type: 'gettingOffField', managerTaskId },
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
          // Assuming the API returns an array of submissions
          const submission = response.data.data[0]; // Take the first matching submission
          setGettingOffFieldDetails({
            location: submission.location || null,
            departingTime: submission.departingTime || 'N/A',
          });
        } else {
          setError('No getting-off-field details found.');
        }
      } catch (err) {
        console.error('Error fetching getting-off-field details:', err);
        setError('Failed to fetch getting-off-field details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGettingOffFieldDetails();
  }, [managerTaskId]);

  if (isLoading) {
    return <p>Loading getting-off-field details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!gettingOffFieldDetails) {
    return <p>No getting-off-field details available.</p>;
  }

  const { location, departingTime } = gettingOffFieldDetails;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">Getting Off Field Details</h2>

      {/* Departing Time */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Departing Time:</h3>
        <p className="text-sm text-gray-900">{departingTime}</p>
      </div>

      {/* Location */}
      {location ? (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Departure Location:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Latitude</p>
              <p className="text-sm font-medium">{location.latitude}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Longitude</p>
              <p className="text-sm font-medium">{location.longitude}</p>
            </div>
          </div>

          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
            className="mt-4"
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
