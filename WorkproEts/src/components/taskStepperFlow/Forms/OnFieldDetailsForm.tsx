import { useState } from 'react';
import { MapPin, Check, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Task } from '../types';
import axios from 'axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  latitude: number;
  longitude: number;
}

interface OnFieldDetails {
  location: Location | null;
  isReporting: boolean;
  currentStep: number;
  managerTaskId : string
}

interface OnFieldDetailsFormProps {
  currentStep: number;
  task: Task;
  
}

export const OnFieldDetailsForm = ({ currentStep , task }: OnFieldDetailsFormProps) => {
  const [formData, setFormData] = useState<OnFieldDetails>({
    location: null,
    isReporting: false,
    currentStep: currentStep,
    managerTaskId : task._id
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    }
  };


const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();

  try {
    const payload = {
      type: 'onFieldDetails',
      currentStep: formData.currentStep,
      onFieldDetails: {
        location: formData.location,
        isReporting: formData.isReporting,
      },
    };

    const submitData = {
      ...payload , managerTaskId : task._id
    }

  
    const response = await axios.post('http://localhost:5000/api/submission', submitData);

    console.log('Submission successful:', response.data);
    alert('On-field details submitted successfully!');
  } catch (error) {
    console.error('Error submitting on-field details:', error);
    alert('Failed to submit on-field details. Please try again.');
  }
};


  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Current Location</h3>
          <button
            type="button"
            onClick={fetchLocation}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <MapPin className="h-4 w-4 mr-1" />
            {isLoading ? 'Fetching...' : 'Fetch Location'}
          </button>
        </div>
        {formData.location && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Latitude</p>
              <p className="text-sm font-medium">{formData.location.latitude}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Longitude</p>
              <p className="text-sm font-medium">{formData.location.longitude}</p>
            </div>
          </div>
        )}
        {formData.location && (
          <MapContainer
            center={[formData.location.latitude, formData.location.longitude]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker
              position={[formData.location.latitude, formData.location.longitude]}
            >
              <Popup>
                Latitude: {formData.location.latitude}, Longitude: {formData.location.longitude}
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Field Reporting</h3>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isReporting: true })}
            className={`flex items-center px-4 py-2 rounded-md ${
              formData.isReporting
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            } border`}
          >
            <Check className="h-4 w-4 mr-2" />
            Yes
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isReporting: false })}
            className={`flex items-center px-4 py-2 rounded-md ${
              !formData.isReporting
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            } border`}
          >
            <X className="h-4 w-4 mr-2" />
            No
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
};
