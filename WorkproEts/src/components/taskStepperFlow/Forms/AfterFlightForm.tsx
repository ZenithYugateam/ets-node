import React, { useState, useEffect } from 'react';
import { FormField } from '../ui/FormField';
import { ImageUpload } from '../ui/ImageUpload';
import Camera from '../ui/Camera';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import type { FlightNotes, Task } from '../types';

interface AfterFlightFormProps {
  task: Task;
  currentStep: number;
}

export const AfterFlightForm = ({ task, currentStep }: AfterFlightFormProps) => {
  const [formData, setFormData] = useState<FlightNotes>({
    crew: [],
    method: '',
    sightName: '',
    date: new Date(),
    flightNo: '',
    takeoffTime: '',
    landingTime: '',
    images: [],
    currentStep: currentStep
  });

  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [flights, setFlights] = useState<{ flightNo: string; landingTime: string }[]>([]);
  const [newFlight, setNewFlight] = useState<{ flightNo: string; landingTime: string }>({ flightNo: '', landingTime: '' });
  const [showFlightInput, setShowFlightInput] = useState(false);

  useEffect(() => {
    setFormData((prevData) => ({ ...prevData, crew: task.selectedEmployees }));
  }, [task.selectedEmployees]);

  const badgeStyles =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500 text-white';

  const handleAddFlight = () => {
    setShowFlightInput(true);
  };

  const saveFlightDetails = () => {
    if (newFlight.flightNo && newFlight.landingTime) {
      setFlights((prevFlights) => [...prevFlights, newFlight]);
      setNewFlight({ flightNo: '', landingTime: '' });
      setShowFlightInput(false);
    } 
  };

  const handleImageCapture = (image: string) => {
    setCapturedImages((prevImages) => [...prevImages, image]);
  };

  const handleDeleteImage = (index: number) => {
    setCapturedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const allImages = [...formData.images, ...capturedImages];
      const base64Images = await Promise.all(
        allImages.map((image) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            if (typeof image === 'string') {
              resolve(image); 
            } else {
              reader.readAsDataURL(image); 
            }
          })
        )
      );

      const dataToSubmit = {
        type: 'afterFlight',
        crew: formData.crew,
        method: formData.method,
        sightName: formData.sightName,
        date: formData.date,
        flights,
        images: base64Images,
        currentStep: currentStep,
        managerTaskId: task._id
      };

      const response = await fetch('https://ets-node-dpa9.onrender.com/api/submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Submission failed: ${errorData.error || 'Unknown error'}`);
      } else {
        const result = await response.json();
        toast.success(`Submission successful! ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error during submission:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <form className="space-y-6">
      <ToastContainer />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Crew">
          <div className="flex flex-wrap gap-2">
            {formData.crew.map((employee) => (
              <span key={employee} className={badgeStyles}>
                {employee}
              </span>
            ))}
          </div>
        </FormField>

        <FormField label="Method">
          <input
            type="text"
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </FormField>
      </div>

      <div>
        <button
          type="button"
          onClick={handleAddFlight}
          className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Add Flight
        </button>
      </div>

      {showFlightInput && (
        <div className="mt-4 grid grid-cols-2 gap-4 items-end">
          <FormField label="Flight Number">
            <input
              type="text"
              value={newFlight.flightNo}
              onChange={(e) => setNewFlight({ ...newFlight, flightNo: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ maxWidth: '120px' }}
            />
          </FormField>

          <FormField label="Landing Time">
            <input
              type="time"
              value={newFlight.landingTime}
              onChange={(e) => setNewFlight({ ...newFlight, landingTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ maxWidth: '120px' }}
            />
          </FormField>

          <div className="col-span-2">
            <button
              type="button"
              onClick={saveFlightDetails}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Save Flight
            </button>
          </div>
        </div>
      )}

      <FormField label="Upload Post-Flight Images">
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
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </FormField>

      <div>
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-6 inline-flex items-center px-6 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
};
