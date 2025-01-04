import { useEffect, useState } from 'react';
import axios from 'axios';

type PublicTransportDetails = {
  mode?: string;
  billAmount?: number;
};

type Vehicle = {
  vehicleNumber: string;
  vehicleName: string;
  startReading: number;
  endReading: number;
  type: string;
};

type TravellingDetails = {
  transportMode: string;
  selectedVehicles: string[];
  date: string;
  time: string;
  readings: number;
  images: string[];
  publicTransportDetails?: PublicTransportDetails;
  privateVehicleDetails?: string;
  privateVehicleNumber?: string;
};

interface TravellingDetailsDisplayProps {
  managerTaskId: string;
  userName: string;
}

export const TravellingDetailsDisplay = ({
  managerTaskId,
  userName,
}: TravellingDetailsDisplayProps) => {
  const [travellingDetails, setTravellingDetails] = useState<TravellingDetails | null>(null);
  const [privateVehicles, setPrivateVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch travelling details first to determine transport mode
        const travellingResponse = await axios.get(
          `https://ets-node-1.onrender.com/api/submissions/selected-vehicles/${managerTaskId}`
        );

        if (!travellingResponse.data) {
          setTravellingDetails(null);
          return;
        }

        const details: TravellingDetails = travellingResponse.data;
        setTravellingDetails(details);

        // Fetch additional data based on transport mode
        if (details.transportMode === 'Public') {
          setError(null);
        } else if (details.transportMode === 'Private') {
          // Fetch private vehicles
          const privateResponse = await axios.get(
            `https://ets-node-1.onrender.com/api/private-vehicles/${userName}`
          );
          setPrivateVehicles(privateResponse.data || []);
        } else if (details.transportMode === 'Company') {
          // Fetch all vehicles for company transport
          const allVehiclesResponse = await axios.get(`https://ets-node-1.onrender.com/api/vehicles`);
          setAllVehicles(allVehiclesResponse.data || []);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch travelling details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [managerTaskId, userName]);

  if (isLoading) {
    return <p>Loading travelling details...</p>;
  }

  if (!travellingDetails) {
    return <p className="text-gray-500">No data is submitted yet</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const {
    transportMode,
    selectedVehicles,
    date,
    time,
    readings,
    images,
    publicTransportDetails,
  } = travellingDetails;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">Travelling Details</h2>

      {/* Transport Mode */}
      {/* <div>
        <h3 className="text-sm font-medium text-gray-700">Transport Mode</h3>
        <p className="text-sm text-gray-900">{transportMode || 'N/A'}</p>
      </div> */}

      {/* Based on Transport Mode */}
      {transportMode === 'Public' && publicTransportDetails ? (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Public Transport Details</h3>
          <p className="text-sm text-gray-900">Mode: {publicTransportDetails.mode || 'N/A'}</p>
          <p className="text-sm text-gray-900">
            Bill Amount: ₹{publicTransportDetails.billAmount || 'N/A'}
          </p>
        </div>
      ) : transportMode === 'Private' ? (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Private Vehicles</h3>
          {privateVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {privateVehicles.map((vehicle) => (
                <div key={vehicle.vehicleNumber} className="p-4 border rounded-md shadow-sm">
                  <p className="font-medium">{vehicle.vehicleName}</p>
                  <p className="text-sm text-gray-500">Number: {vehicle.vehicleNumber}</p>
                  <p className="text-sm">Start Reading: {vehicle.startReading}</p>
                  <p className="text-sm">End Reading: {vehicle.endReading}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No private vehicles found.</p>
          )}
        </div>
      ) : transportMode === 'Company' ? (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Company Vehicles</h3>
          {allVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allVehicles.map((vehicle) => (
                <div key={vehicle.vehicleNumber} className="p-4 border rounded-md shadow-sm">
                  <p className="font-medium">{vehicle.vehicleName}</p>
                  <p className="text-sm text-gray-500">Number: {vehicle.vehicleNumber}</p>
                  <p className="text-sm">Type: {vehicle.type}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No company vehicles found.</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500"></p>
      )}

      {/* Selected Vehicles */}
      {selectedVehicles?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Selected Vehicles</h3>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {selectedVehicles.map((vehicle, index) => (
              <li key={index} className="text-sm text-gray-900">
                {vehicle}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Date and Time */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Date and Time</h3>
        <p className="text-sm text-gray-900">
          Date: {new Date(date).toLocaleDateString() || 'N/A'}
        </p>
        <p className="text-sm text-gray-900">Time: {time || 'N/A'}</p>
      </div>

      {/* Vehicle Reading */}
      {readings && (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Vehicle Reading</h3>
          <p className="text-sm text-gray-900">{readings} km</p>
        </div>
      )}

      {/* Uploaded Images */}
      <div>
        <h3 className="text-sm font-medium text-gray-700">Uploaded Images</h3>
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
