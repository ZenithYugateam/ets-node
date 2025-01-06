// Frontend Code
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
  publicTransportDetails?: {
    mode: string;
    billAmount: number;
  };
  privateVehicleDetails?: string;
  privateVehicleNumber?: string;
};

type Vehicle = {
  vehicleNumber: string;
  vehicleName: string;
  endReading: number;
};

interface TravellingDetailsFormProps {
  currentStep: number;
  task: Task;
  setCurrentStep: (step: number) => void;
}

export const TravellingDetailsForm = ({ currentStep,setCurrentStep,  task }: TravellingDetailsFormProps) => {
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
  const [initialReading, setInitialReading] = useState<number>(0);
  const [variant, setVariant] = useState<number>(0);
  const [transportMode, setTransportMode] = useState<string>('');

  // Fetch company vehicles
  useEffect(() => {
    if (transportMode === 'Company') {
      const fetchVehicles = async () => {
        setLoading(true);
        try {
          const response = await axios.get('https://ets-node-1.onrender.com/api/getAllVechileData');
          console.log(response.data)
          setVehicleList(response.data);
        } catch (err) {
          setError(err.message || 'Error fetching vehicles');
        } finally {
          setLoading(false);
        }
      };
      fetchVehicles();
    }
  }, [transportMode]);

  const handleReadingChange = (newReading: number) => {
    setFormData((prev) => ({ ...prev, readings: newReading }));
    setVariant(newReading - initialReading);
  };

  const toggleVehicleSelection = (vehicleNumber: string) => {
    const selectedVehicle = vehicleList.find((vehicle) => vehicle.vehicleNumber === vehicleNumber);

    if (!selectedVehicle) return;

    setFormData((prev) => ({
      ...prev,
      selectedVehicles: prev.selectedVehicles.includes(vehicleNumber)
        ? []
        : [vehicleNumber],
      readings: selectedVehicle.endReading || 0,
    }));

    setInitialReading(selectedVehicle.endReading || 0);
    setVariant(0);
  };

  const handleImageCapture = (image: string) => {
    setCapturedImages((prevImages) => [...prevImages, image]);
  };

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

  const handleDeleteCapturedImage = (index: number) => {
    setCapturedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
  
    // Validation
    if (!transportMode) {
      toast.error('Please select a transport mode!');
      setLoading(false);
      return;
    }
  
    if (!formData.date || !formData.time) {
      toast.error('Please select date and time!');
      setLoading(false);
      return;
    }
  
    if (transportMode === 'Company' && formData.selectedVehicles.length === 0) {
      toast.error('Please select a company vehicle!');
      setLoading(false);
      return;
    }
  
    if (transportMode === 'Public' && (!formData.publicTransportDetails?.mode || !formData.publicTransportDetails?.billAmount)) {
      toast.error('Please provide public transport details!');
      setLoading(false);
      return;
    }
  
    if (
      transportMode === 'Private' &&
      (!formData.privateVehicleDetails || !formData.privateVehicleNumber || formData.readings <= 0)
    ) {
      toast.error('Please provide private vehicle details!');
      setLoading(false);
      return;
    }
  
    if (formData.images.length === 0 && capturedImages.length === 0) {
      toast.error('Please upload or capture at least one image!');
      setLoading(false);
      return;
    }
  
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
        transportMode,
        publicTransportDetails: formData.publicTransportDetails,
        privateVehicleDetails: formData.privateVehicleDetails,
        privateVehicleNumber: formData.privateVehicleNumber,
      };
  
      const response = await axios.post('https://ets-node-1.onrender.com/api/submission', submissionData);
  
      console.log('Submission successful:', response.data);
      toast.success('Travelling details submitted successfully!');
      if (currentStep < 10) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error submitting travelling details:', error);
      setError(error.response?.data?.error || 'Failed to submit travelling details.');
      toast.error('Error submitting travelling details.');
    } finally {
      setLoading(false);
    }
  };
 

  const handleAddVehicle = async () => {
    if (formData.privateVehicleDetails && formData.privateVehicleNumber && formData.readings) {
      try {
        const newVehicle = {
          type: 'Private',
          name: sessionStorage.getItem('userName'),
          role: sessionStorage.getItem('role')?.slice(1, -1),
          vehicleName: formData.privateVehicleDetails,
          vehicleNumber: formData.privateVehicleNumber,
          startReading: 0,
          endReading: formData.readings,
        };

        const response = await axios.post('https://ets-node-1.onrender.com/api/vehicles', newVehicle);

        setVehicleList((prev) => [...prev, response.data.vehicle]);
        setFormData((prev) => ({ ...prev, privateVehicleDetails: '', privateVehicleNumber: '', readings: 0 }));
        toast.success('Vehicle added successfully!');
      } catch (error) {
        console.error('Error adding vehicle:', error);
        toast.error(error.response?.data?.error || 'Failed to add vehicle.');
      }
    } else {
      toast.error('Please fill in all fields!');
    }
  };

  const [privateVehicles, setPrivateVehicles] = useState<Vehicle[]>([]);
  const [fetchingPrivateVehicles, setFetchingPrivateVehicles] = useState(false);
          
    const fetchPrivateVehicles = async () => {
      try {
        setFetchingPrivateVehicles(true);
        const response = await axios.post(
          "https://ets-node-1.onrender.com/api/getPrivateVehiclesByName",{
            name : sessionStorage.getItem('userName'),
          }
        );
        setPrivateVehicles(response.data);
      } catch (error) {
        console.error('Error fetching private vehicles:', error);
        toast.info('F');
      } finally {
        setFetchingPrivateVehicles(false);
      }
    };
  
  const [selectedPrivateVehicle, setSelectedPrivateVehicle] = useState<string | null>(null);

  const handlePrivateVehicleSelection = (vehicle: Vehicle) => {
    // Toggle selection of a vehicle
    setSelectedPrivateVehicle((prev) =>
      prev === vehicle.vehicleNumber ? null : vehicle.vehicleNumber
    );

    // Set readings and vehicle number in the form data
    setFormData((prev) => ({
      ...prev,
      selectedVehicles: [vehicle.vehicleNumber],
      readings: vehicle.endReading || 0,
    }));

    setInitialReading(vehicle.endReading || 0);
    setVariant(0);
  };

  const renderTransportOptions = () => {
    switch (transportMode) {
      case 'Company':
        return (
          <div>
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

            {formData.selectedVehicles.length > 0 && (
              <div className="mt-4 p-4 rounded-lg border bg-gray-50">
                <FormField label="Vehicle Reading (Editable)">
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={formData.readings}
                      onChange={(e) => handleReadingChange(Number(e.target.value))}
                      className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {variant !== 0 && (
                      <span className="text-blue-600 font-medium">
                        Variant: {variant > 0 ? `+${variant} km` : `${variant} km`}
                      </span>
                    )}
                  </div>
                </FormField>
              </div>
            )}
          </div>
        );

        case 'Public':
          return (
            <div>
              <FormField label="Public Transport Mode">
                <select
                  value={formData.publicTransportDetails?.mode || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publicTransportDetails: {
                        ...prev.publicTransportDetails,
                        mode: e.target.value,
                      },
                    }))
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Mode</option>
                  <option value="Bus">Bus</option>
                  <option value="Train">Train</option>
                  <option value="Taxi">Taxi</option>
                  <option value="Metro">Metro</option>
                </select>
              </FormField>
        
              <FormField label="Bill Amount">
                <input
                  type="number"
                  value={formData.publicTransportDetails?.billAmount || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publicTransportDetails: {
                        ...prev.publicTransportDetails,
                        billAmount: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </FormField>
            </div>
          );
        
          case 'Private':    
          return (
            <div>
              <FormField label="Add Private Vehicle">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={formData.privateVehicleDetails || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        privateVehicleDetails: e.target.value,
                      }))
                    }
                    placeholder="Enter vehicle name (e.g., Honda Civic)"
                    className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    value={formData.privateVehicleNumber || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        privateVehicleNumber: e.target.value,
                      }))
                    }
                    placeholder="Enter vehicle number (e.g., ABC-1234)"
                    className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <input
                    type="number"
                    value={formData.readings || ''}
                    onChange={(e) => handleReadingChange(Number(e.target.value))}
                    placeholder="Enter initial reading"
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={handleAddVehicle}
                    className="rounded-md bg-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Add Vehicle
                  </button>
                </div>
              </FormField>
        
              {/* Show Private Vehicles */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Your Private Vehicles</h3>
                {fetchingPrivateVehicles ? (
                  <p>Loading...</p>
                ) : privateVehicles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {privateVehicles.map((vehicle) => (
                      <div
                        key={vehicle.vehicleNumber}
                        onClick={() => handlePrivateVehicleSelection(vehicle)}
                        className={`cursor-pointer rounded-lg border-2 p-4 shadow-sm ${
                          selectedPrivateVehicle === vehicle.vehicleNumber
                            ? 'border-green-500 bg-green-100'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <p className="font-medium">{vehicle.vehicleName}</p>
                        <p className="text-sm text-gray-500">Number: {vehicle.vehicleNumber}</p>
                        <p className="text-sm">Start Reading: {vehicle.startReading}</p>
                        <p className="text-sm">End Reading: {vehicle.endReading}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No private vehicles found.</p>
                )}
              </div>
            </div>
          );
          

      default:
        return null;
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <ToastContainer />
      <div className="grid grid-cols-3 gap-6">
        {['Company', 'Public', 'Private'].map((mode) => (
          <div
            key={mode}
            onClick={() => {
              if(mode === "Private"){
                fetchPrivateVehicles();
              }
              setTransportMode(mode)
            }
            }
            className={`cursor-pointer rounded-lg border-2 p-4 text-center ${
              transportMode === mode ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
            }`}
          >
            <p className="font-medium">{mode} Vehicle</p>
          </div>
        ))}
      </div>

      {renderTransportOptions()}

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
        type="submit"
        className="mt-4 w-full rounded-md bg-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Submit
      </button>
    </form>
  );
};

