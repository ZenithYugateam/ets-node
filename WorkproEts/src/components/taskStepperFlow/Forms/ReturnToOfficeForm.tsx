import { useState, useEffect } from 'react';
import { FormField } from '../ui/FormField';
import { ImageUpload } from '../ui/ImageUpload';
import { Task } from '../types';

interface ReturnToOfficeData {
  timeReached: string;
  endReading: number;
  images: File[];
  currentStep: number; 
}

interface ReturnToOfficeFormProps {
  currentStep: number;
  task: Task;
}

export const ReturnToOfficeForm = ({ currentStep, task }: ReturnToOfficeFormProps) => {
  const [formData, setFormData] = useState<ReturnToOfficeData>({
    timeReached: '',
    endReading: 0,
    images: [],
    currentStep: currentStep
  });

  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelectedVehicles = async () => {
      try {
        setLoadingVehicles(true);
        setError(null);

        const managerTaskId = task._id; 
        const response = await fetch('http://localhost:5000/api/submissions/selected-vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ managerTaskId }),
        });

        if (!response.ok) {
          throw new Error(`Error fetching vehicles: ${response.statusText}`);
        }

        const data = await response.json();
        setSelectedVehicles(data.selectedVehicles || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchSelectedVehicles();
  }, [task._id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert images to Base64
    const base64Images = await Promise.all(
      formData.images.map((image) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(image);
        });
      })
    );

    // Prepare data to submit
    const submissionData = {
      type: "returnToOffice",
      selectedVehicles: selectedVehicles,
      timeReached: formData.timeReached,
      endReading: formData.endReading,
      images: base64Images,
      currentStep: formData.currentStep,
      managerTaskId: task._id, // Using the task._id as managerTaskId
    };

    console.log('Submitting Data:', submissionData);

    try {
      const response = await fetch('http://localhost:5000/api/submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error submitting data:', result);
        alert(`Error: ${result.error || 'Unknown error'}`);
      } else {
        console.log('Submission successful!', result);
        alert('Submission successful!');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Failed to submit due to network error.');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FormField label="Selected Vehicles">
        {loadingVehicles && <p>Loading vehicles...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loadingVehicles && !error && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {selectedVehicles.map((vehicle, index) => (
              <div 
                key={index} 
                className="border p-2 rounded shadow-sm bg-gray-100 text-gray-700"
              >
                {vehicle}
              </div>
            ))}
          </div>
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Time Reached">
          <input
            type="time"
            value={formData.timeReached}
            onChange={(e) => setFormData({ ...formData, timeReached: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </FormField>

        <FormField label="End Reading">
          <input
            type="number"
            value={formData.endReading}
            onChange={(e) => setFormData({ ...formData, endReading: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </FormField>
      </div>

      <FormField label="Upload Images">
        <ImageUpload
          images={formData.images}
          onChange={(images) => setFormData({ ...formData, images })}
        />
      </FormField>

      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit
      </button>
    </form>
  );
};
