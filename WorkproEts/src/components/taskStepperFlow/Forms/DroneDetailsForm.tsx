import { useState } from 'react';
import { Check } from 'lucide-react';
import { FormField } from '../ui/FormField';
import { ImageUpload } from '../ui/ImageUpload';
import type { DroneDetails, Task } from '../types/index';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Camera from '../ui/Camera';

const predefinedDroneNames = [
  'MODEL V DRONE',
  'Mavic DJI Air-3',
  'MAVIC 3 Enterprises RTK',
  'M 350 LIDAR',
  'Phantom 4 RTK-1',
  'Dgps'
];

const droneChecklistMapping: Record<string, { item: string; quantity?: number }[]> = {
  'MODEL V DRONE': [
    { item: 'RC', quantity: 1 },
    { item: 'BATTERIES', quantity: 1 },
    { item: 'CHARGING HUB', quantity: 1 },
    { item: 'HUB POWER CABLE', quantity: 1 },
    { item: 'EXTENSION', quantity: 1 },
    { item: 'TOOL KIT', quantity: 1 },
    { item: 'LIPO CHECKR', quantity: 1 },
    { item: 'CHAIRS', quantity: 1 },
    { item: 'TABLE', quantity: 1 },
  ],
  'Mavic DJI Air-3': [
    { item: 'RC', quantity: 1 },
    { item: 'Batteries', quantity: 1 },
    { item: 'Charging Hub', quantity: 1 },
    { item: 'Propellers', quantity: 1 },
    { item: 'RC Charging Hub', quantity: 1 },
    { item: 'Power Adapter', quantity: 1 },
    { item: 'OTG Cable', quantity: 1 },
    { item: 'Power Cable', quantity: 1 },
    { item: 'Foam Support For Gimbal', quantity: 1 },
    { item: 'Gimbal Plastic Support', quantity: 1 },
    { item: 'SD CARD 64/32 GB', quantity: 1 },
    { item: 'C2C Cable', quantity: 1 },
    { item: 'USB Cable', quantity: 1 },
    { item: 'Landing Pad', quantity: 1 },
    { item: 'Safety Jackets And T-Shirts', quantity: 1 },
    { item: 'Power Bank', quantity: 1 },
  ],
  'MAVIC 3 Enterprises RTK': [
    { item: 'RC', quantity: 1 },
    { item: 'Batteries', quantity: 1 },
    { item: 'Charging Hub', quantity: 1 },
    { item: 'Power Adapter', quantity: 1 },
    { item: 'Power Cable', quantity: 1 },
    { item: 'Foam Support For Gimbal', quantity: 1 },
    { item: 'Gimbal Plastic Support', quantity: 1 },
    { item: 'SD CARD 64/32 GB', quantity: 1 },
    { item: 'C2C Cable', quantity: 1 },
    { item: 'USB Cable', quantity: 1 },
    { item: 'Landing Pad', quantity: 1 },
    { item: 'Safety Jackets and T-Shirts', quantity: 1 },
    { item: 'Power Bank', quantity: 1 },
  ],
  'M 350 LIDAR': [
    { item: 'RC', quantity: 1 },
    { item: 'UAV Batteries', quantity: 1 },
    { item: 'UAV Charging Hub', quantity: 1 },
    { item: 'UAV Hub Power Cable', quantity: 1 },
    { item: 'LIDAR Sensor Cap', quantity: 1 },
    { item: 'LIDAR Plastic Camera Cap', quantity: 1 },
    { item: 'SD Card 128 GB (LIDAR)', quantity: 1 },
    { item: 'Drone Cap', quantity: 1 },
    { item: 'Landing Pad (Using Car Matt)', quantity: 1 },
    { item: 'Drone Pilot T-Shirts (Must)', quantity: 1 }, 
    { item: 'LIDAR L2 Sensor', quantity: 1 },
    { item: 'Dgps Base No: B2', quantity: 1 },
    { item: 'Dgps Tripod No:', quantity: 1 },
    { item: 'Dgps Rover No: R3', quantity: 1 },
    { item: 'Dgps Bipod', quantity: 1 },
    { item: 'Dgps Center Pole', quantity: 1 },
  ],
  'Phantom 4 RTK-1': [
    { item: 'RC', quantity: 1 },
    { item: 'Propeller', quantity: 1 }, 
    { item: 'Batteries (RTKI-A1, A2, A3)', quantity: 1 },
    { item: 'Charging HUB', quantity: 1 },
    { item: 'RC Charging HUB', quantity: 1 },
    { item: 'Power Adapter', quantity: 1 },
    { item: 'OTG Cable', quantity: 1 },
    { item: 'Power Cable', quantity: 1 },
    { item: 'SD Card 32gb', quantity: 1 },
    { item: 'Foam Support For Gimbal', quantity: 1 },
    { item: 'Gimbal Plastic Support', quantity: 1 },
    { item: 'Log Sheets', quantity: 1 },
    { item: 'Safety Jackets', quantity: 1 },
    { item: 'C-C Cable', quantity: 1 },
    { item: 'USB-C Cable', quantity: 1 },
    { item: 'Base', quantity: 1 },
    { item: 'Base Batteries B1, B2', quantity: 1 },
    { item: 'Tripod', quantity: 1 },
    { item: 'Tripod Rod', quantity: 1 },
    { item: 'iPad Holder', quantity: 1 },
    { item: 'iPad', quantity: 1 },
  ],'Dgps': [
    { item: 'DGPS Base', quantity: 1 },
    { item: 'DGPS Rover', quantity: 1 },
    { item: 'DGPS Tripod', quantity: 1 },
    { item: 'DGPS Bipod Rod', quantity: 1 },
    { item: 'DGPS Centre Pole', quantity: 1 },
  ],
};

interface DroneDetailsFormProps {
  currentStep: number; 
  task: Task;
}


export const DroneDetailsForm = ({ currentStep, task }: DroneDetailsFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DroneDetails>({
    droneName: '',
    checklistItems: [],
    images: [],
  });

  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const toggleChecklistItem = (item: string) => {
    setFormData((prev) => {
      const isItemSelected = prev.checklistItems.some((i) => i.item === item);

      if (isItemSelected) {
        return {
          ...prev,
          checklistItems: prev.checklistItems.filter((i) => i.item !== item),
        };
      }

      return {
        ...prev,
        checklistItems: [...prev.checklistItems, { item, quantity: 1 }],
      };
    });
  };

  const updateChecklistQuantity = (item: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.map((i) =>
        i.item === item ? { ...i, quantity } : i
      ),
    }));
  };

  
  const handleDroneSelection = (droneName: string) => {
    setFormData({
      droneName,
      checklistItems: [],
      images: formData.images,
    });
  };
  
  
  

  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageCapture = (image: string) => {
    setCapturedImages((prevImages) => [...prevImages, image]);
  };

  const handleDeleteCapturedImage = (index: number) => {
    setCapturedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    if (!formData.droneName) {
      setError('Drone name is required.');
      toast.error('Drone name is required.');
      return;
    }
    if (formData.images.length === 0 && capturedImages.length === 0) {
      setError('At least one image is required.');
      toast.error('At least one image is required.');
      return;
    }
    if (formData.checklistItems.length === 0) {
      setError('At least one checklist item is required.');
      toast.error('At least one checklist item is required.');
      return;
    }

    setError(null);

    try {
      const base64Images = await Promise.all(
        formData.images.map((image) => convertToBase64(image))
      );

      const submissionData = {
        ...formData,
        images: [...base64Images, ...capturedImages],
        currentStep,
        managerTaskId: task._id,
        type: 'DroneDetails',
      };

      const response = await axios.post('http://localhost:5001/api/submission', submissionData);

      setFormData({
        droneName: '',
        checklistItems: [],
        images: [],
      });
      setCapturedImages([]);
      toast.success('Submission successful!');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit the form. Please try again.');
      toast.error('Failed to submit the form. Please try again.');
    }
  };
  

  return (
    <form className="space-y-6">
      <ToastContainer />
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <FormField label="Drone Name">
      <select
        value={formData.droneName}
        onChange={(e) => handleDroneSelection(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="" disabled>Select a Drone</option>
        {predefinedDroneNames
          .filter((name) => {
            console.log(name)
            if (name === "Dgps" && task.dgpsRequired === "No") {
              return false;
            }else{
              return true
            }
            
          })
          .map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
      </select>
    </FormField>


      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Pre-flight Checklist</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(droneChecklistMapping[formData.droneName] || []).map((item) => (
            <div
              key={item.item}
              className={`flex flex-col p-4 rounded-lg border ${
                formData.checklistItems.some((i) => i.item === item.item)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleChecklistItem(item.item)}
                className="flex justify-between items-center w-full"
              >
                <span className="text-sm">{item.item}</span>
                {formData.checklistItems.some((i) => i.item === item.item) && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
              </button>
              {formData.checklistItems.some((i) => i.item === item.item) && (
                <input
                  type="number"
                  min="0"
                  value={
                    formData.checklistItems.find((i) => i.item === item.item)?.quantity || 0
                  }
                  onChange={(e) =>
                    updateChecklistQuantity(item.item, parseInt(e.target.value, 10) || 0)
                  }
                  className="mt-2 w-20 rounded-md border-gray-300 text-center shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>

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

      <button
        type="button"
        onClick={handleNext}
        className="mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Submit
      </button>
    </form>
  );
};


