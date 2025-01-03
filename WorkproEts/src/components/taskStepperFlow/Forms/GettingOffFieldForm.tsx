import { useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FormField } from '../ui/FormField';
import { Task } from '../types';

// Fix for the default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GettingOffFieldData {
  location: { latitude: number; longitude: number } | null;
  departingTime: string;
  currentStep: number;
}

interface GettingOffFieldFormProps {
  currentStep: number;
  task: Task;
  setCurrentStep: (step: number) => void;
}

export const GettingOffFieldForm = ({ currentStep,setCurrentStep, task }: GettingOffFieldFormProps) => {
  const [formData, setFormData] = useState<GettingOffFieldData>({
    location: null,
    departingTime: '',
    currentStep: currentStep,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location) {
      alert('Please fetch the location before submitting.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      type: 'gettingOffField',
      onFieldDetails: {
        location: formData.location,
        departingTime: formData.departingTime,
        currentStep: formData.currentStep,
      },
      managerTaskId : task._id,
    };

    try {
      const response = await fetch('http://localhost:5001/api/submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Submission failed: ${errorData.error || 'Unknown error'}`);
      } else {
        const result = await response.json();
        alert(`Submission successful! ${result.message}`);
        // Optionally reset the form or navigate away
        setFormData({
          location: null,
          departingTime: '',
          currentStep: currentStep,
        });

        if(currentStep < 10){
          setCurrentStep(currentStep + 1);
        }
      }
    } catch (error: any) {
      console.error('Error during submission:', error);
      alert('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Departure Location</h3>
          <button
            type="button"
            onClick={fetchLocation}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4 mr-1" />
            )}
            {isLoading ? 'Fetching...' : 'Fetch Location'}
          </button>
        </div>

        {formData.location && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Latitude</p>
                <p className="text-sm font-medium">{formData.location.latitude}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Longitude</p>
                <p className="text-sm font-medium">{formData.location.longitude}</p>
              </div>
            </div>

            <MapContainer
              center={[formData.location.latitude, formData.location.longitude]}
              zoom={13}
              style={{ height: '300px', width: '100%' }}
              className="mt-4"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[formData.location.latitude, formData.location.longitude]}>
                <Popup>
                  Latitude: {formData.location.latitude}, Longitude: {formData.location.longitude}
                </Popup>
              </Marker>
            </MapContainer>
          </>
        )}
      </div>

      <FormField label="Departing Time">
        <input
          type="time"
          value={formData.departingTime}
          onChange={(e) => setFormData({ ...formData, departingTime: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
