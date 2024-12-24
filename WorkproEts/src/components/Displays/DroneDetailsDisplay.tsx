import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ChecklistItem {
  item: string;
  quantity: number;
}

interface DroneDetails {
  _id: string;
  managerTaskId: string;
  droneName: string;
  checklistItems: ChecklistItem[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface DroneDetailsDisplayProps {
  managerTaskId: string; // Task ID to fetch data for
}

export const DroneDetailsDisplay: React.FC<DroneDetailsDisplayProps> = ({ managerTaskId }) => {
  const [droneDetails, setDroneDetails] = useState<DroneDetails[]>([]); // Initialize as an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDroneDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://ets-node-dpa9.onrender.com/api/droneDetailsList/${managerTaskId}`);
        console.log('API Response:', response.data); // Debug
        setDroneDetails(Array.isArray(response.data) ? response.data : []); // Ensure it's an array
        setError(null); // Clear previous errors if successful
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch drone details');
      } finally {
        setLoading(false);
      }
    };

    fetchDroneDetails();
  }, [managerTaskId]);

  if (loading) {
    return <p className="text-gray-500">Loading drone details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!Array.isArray(droneDetails) || droneDetails.length === 0) {
    return <p className="text-gray-500">No drone details available for the given task ID.</p>;
  }

  return (
    <div className="space-y-6 p-6 bg-white shadow rounded-md">
      <h2 className="text-xl font-bold text-gray-800">Drone Details</h2>
      {droneDetails.map((details) => (
        <div key={details._id} className="border p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">
            <strong>Drone Name:</strong> {details.droneName}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Created At:</strong> {new Date(details.createdAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Updated At:</strong> {new Date(details.updatedAt).toLocaleString()}
          </p>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Checklist Items</h3>
            <ul className="list-disc list-inside mt-2">
              {details.checklistItems.map((item, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {item.item} (Quantity: {item.quantity})
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Uploaded Images</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {details.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Uploaded ${index}`}
                  className="w-full h-auto rounded-md shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
