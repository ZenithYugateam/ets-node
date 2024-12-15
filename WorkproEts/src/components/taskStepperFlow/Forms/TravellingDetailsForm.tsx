import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FormField } from '../ui/FormField';
import { ImageUpload } from '../ui/ImageUpload';
import Camera from '../ui/Camera'; // Import the Camera component
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Task } from '../types';

// Types
type TravellingDetails = {
  selectedVehicles: string[];
  date: Date;
  time: string;
  readings: number;
  images: File[];
};

type Vehicle = {
  vehicleNumber: string;
  vehicleName: string;
};

interface TravellingDetailsFormProps {
  currentStep: number;
  task: Task;
}

export const TravellingDetailsForm = ({ currentStep, task }: TravellingDetailsFormProps) => {
  const [formData, setFormData] = useState<TravellingDetails>({
    selectedVehicles: [],
    date: new Date(),
    time: '',
    readings: 0,
    images: [],
  });

  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5001/api/getAllVechileData');
        setVehicleList(response.data);
      } catch (err) {
        setError(err.message || 'Error fetching vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Toggle vehicle selection
  const toggleVehicleSelection = (vehicleNumber: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedVehicles.includes(vehicleNumber);
      const newSelectedVehicles = isSelected
        ? prev.selectedVehicles.filter((num) => num !== vehicleNumber)
        : [...prev.selectedVehicles, vehicleNumber];

      return { ...prev, selectedVehicles: newSelectedVehicles };
    });
  };

  // Convert images to Base64
  const convertImagesToBase64 = async (images: File[]): Promise<string[]> => {
    const base64Promises = images.map(
      (image) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        })
    );
    return Promise.all(base64Promises);
  };

  const handleImageCapture = (image: string) => {
    setCapturedImages((prevImages) => [...prevImages, image]);
  };

  const handleDeleteCapturedImage = (index: number) => {
    setCapturedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const base64Images = await convertImagesToBase64(formData.images);
      const submissionData = {
        selectedVehicles: formData.selectedVehicles,
        date: formData.date.toISOString(),
        time: formData.time,
        readings: formData.readings,
        images: [...base64Images, ...capturedImages],
        currentStep: currentStep,
        type: 'travellingDetails',
        managerTaskId: task._id,
      };

      const response = await axios.post('http://localhost:5001/api/submission', submissionData);

      console.log('Submission successful:', response.data);
      toast.success('Travelling details submitted successfully!');
    } catch (error) {
      console.error('Error submitting travelling details:', error);
      setError(error.response?.data?.error || 'Failed to submit travelling details.');
      toast.error('Error submitting travelling details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <ToastContainer />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {vehicleList.map((vehicle) => (
          <div
            key={vehicle.vehicleNumber}
            onClick={() => toggleVehicleSelection(vehicle.vehicleNumber)}
            className={`cursor-pointer rounded-lg border-2 p-4 text-center ${
              formData.selectedVehicles.includes(vehicle.vehicleNumber)
                ? 'border-green-500 bg-green-100'
                : 'border-gray-300'
            }`}
          >
            <p className="font-medium">{vehicle.vehicleName}</p>
            <p className="text-sm text-gray-500">{vehicle.vehicleNumber}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Date">
          <DatePicker
            selected={formData.date}
            onChange={(date) => setFormData({ ...formData, date: date || new Date() })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </FormField>

        <FormField label="Time">
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </FormField>
      </div>

      <FormField label="Readings">
        <input
          type="number"
          value={formData.readings}
          onChange={(e) => setFormData({ ...formData, readings: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </FormField>

      <FormField label="Upload Images">
        <ImageUpload
          images={formData.images}
          onChange={(images) => setFormData({ ...formData, images })}
        />
      </FormField>

      <FormField label="Capture Images">
        <Camera onImageCapture={handleImageCapture} />
        {capturedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {capturedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Captured ${index}`}
                  className="w-full h-auto rounded-md shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteCapturedImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </FormField>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        className="mt-4 w-full rounded-md bg-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Submit
      </button>
    </form>
  );
};
