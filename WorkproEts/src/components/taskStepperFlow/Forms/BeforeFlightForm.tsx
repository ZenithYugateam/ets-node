import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FormField } from '../ui/FormField';
import { ImageUpload } from '../ui/ImageUpload';
import Camera from '../ui/Camera';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { FlightNotes, Task } from '../types/index';
import axios from 'axios';

interface BeforeFlightForm {
  task: Task;
  currentStep: number;
}

export const BeforeFlightForm = ({ task, currentStep }: BeforeFlightForm) => {
  const [formData, setFormData] = useState<FlightNotes>({
    crew: [],
    method: '',
    sightName: '',
    date: new Date(),
    flightNo: '',
    takeoffTime: '',
    images: [],
    currentStep,
    managerTaskId: task._id,
  });

  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [flights, setFlights] = useState<{ flightNo: string; takeoffTime: string }[]>([]);
  const [newFlight, setNewFlight] = useState<{ flightNo: string; takeoffTime: string }>({ flightNo: '', takeoffTime: '' });
  const [showFlightInput, setShowFlightInput] = useState(false);

  useEffect(() => {
    setFormData((prevData) => ({ ...prevData, crew: task.selectedEmployees }));
  }, [task.selectedEmployees]);

  const badgeStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500 text-white";

  const handleAddFlight = () => {
    setShowFlightInput(true);
  };

  const saveFlightDetails = () => {
    if (newFlight.flightNo && newFlight.takeoffTime) {
      setFlights((prevFlights) => [...prevFlights, newFlight]);
      setNewFlight({ flightNo: '', takeoffTime: '' });
      setShowFlightInput(false);
    }
  };

  const handleImageCapture = (image: string) => {
    setCapturedImages((prevImages) => [...prevImages, image]);
  };

  const handleDeleteCapturedImage = (index: number) => {
    setCapturedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      // Combine manually uploaded and captured images
      const allImages = [...formData.images, ...capturedImages];

      const base64Images = allImages.map((image) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          if (typeof image === 'string') {
            resolve(image); // If already base64, resolve directly
          } else {
            reader.readAsDataURL(image);
          }
        })
      );

      const encodedImages = await Promise.all(base64Images);

      const dataToSubmit = {
        type: 'beforeFlight',
        crew: formData.crew,
        method: formData.method,
        sightName: formData.sightName,
        date: formData.date.toISOString(),
        flights,
        images: encodedImages,
        currentStep,
        managerTaskId: formData.managerTaskId,
      };

      const response = await axios.post('http://localhost:5000/api/submission', dataToSubmit);
      console.log('Success:', response.data);
      toast.success('Form submitted successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error submitting form. Please try again.');
    }
  };

  return (
    <form className="space-y-6">
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

        <FormField label="Method of Survey">
          <input
            type="text"
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </FormField>
      </div>

      {/* <FormField label="Sight Name">
        <input
          type="text"
          value={formData.sightName}
          onChange={(e) => setFormData({ ...formData, sightName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </FormField> */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Date">
          <DatePicker
            selected={formData.date}
            onChange={(date) => setFormData({ ...formData, date: date || new Date() })}
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

          <FormField label="Take-off Time">
            <input
              type="time"
              value={newFlight.takeoffTime}
              onChange={(e) => setNewFlight({ ...newFlight, takeoffTime: e.target.value })}
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

      {flights.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium">Added Flights:</h3>
          {flights.map((flight, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md shadow-sm"
            >
              <p className="text-sm font-medium">Flight: {flight.flightNo}</p>
              <p className="text-sm font-medium">Take-off Time: {flight.takeoffTime}</p>
            </div>
          ))}
        </div>
      )}

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
