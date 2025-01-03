import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { FaCamera, FaUpload } from "react-icons/fa";
import { FormField } from "../ui/FormField";
import Camera from "../ui/Camera";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import type { Task } from "../types/index";

interface FlightNotesFormProps {
  task: Task;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const FlightNotesForm = ({ task, setCurrentStep, currentStep }: FlightNotesFormProps) => {
  const [formData, setFormData] = useState({
    crew: [],
    method: "",
    sightName: "",
    date: new Date(),
    flights: [],
    images: [],
    currentStep,
    managerTaskId: task._id,
  });

  const [newFlight, setNewFlight] = useState<{
    flightNo: string;
    takeoffTime: string;
    landingTime: string;
    flightImages: File[];
  }>({
    flightNo: "",
    takeoffTime: "",
    landingTime: "",
    flightImages: [],
  });

  const [showFlightInput, setShowFlightInput] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    setFormData((prevData) => ({ ...prevData, crew: task.selectedEmployees }));
  }, [task.selectedEmployees]);

  const handleAddFlight = () => {
    setShowFlightInput(true);
  };

  const saveFlightDetails = () => {
    if (newFlight.flightNo && newFlight.takeoffTime && newFlight.landingTime) {
      setFormData((prevData) => ({
        ...prevData,
        flights: [...prevData.flights, { ...newFlight }],
      }));
      setNewFlight({ flightNo: "", takeoffTime: "", landingTime: "", flightImages: [] });
      setShowFlightInput(false);
    } else {
      toast.error("Please fill in all flight details.");
    }
  };

  const handleImageCapture = (image: string) => {
    const byteString = atob(image.split(",")[1]);
    const mimeString = image.split(",")[0].split(":")[1].split(";")[0];
    const buffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(buffer);
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    const file = new File([buffer], `captured-image-${Date.now()}.jpg`, { type: mimeString });

    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, file], // Update the images array in formData
    }));
  };

  const handleImageUpload = (files: File[]) => {
    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...files], // Add uploaded files to the images array in formData
    }));
  };

  const convertImagesToBase64 = async (images: File[]): Promise<string[]> => {
    const base64Images = await Promise.all(
      images.map(
        (image) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(image);
          })
      )
    );
    return base64Images;
  };

  const handleSubmit = async () => {
    
  
    if (!formData.method) {
      toast.error("Please specify the method of survey.");
      return;
    }
  
    if (!formData.sightName) {
      toast.error("Please specify the site name.");
      return;
    }
  
    if (!formData.date) {
      toast.error("Please select a date.");
      return;
    }
  
    if (!formData.flights || formData.flights.length === 0) {
      toast.error("Please add at least one flight.");
      return;
    }
  
    if (!formData.images || formData.images.length === 0) {
      toast.error("Please upload or capture at least one image.");
      return;
    }
  
    try {
      const flightData = await Promise.all(
        formData.flights.map(async (flight) => ({
          flightNo: flight.flightNo,
          takeoffTime: flight.takeoffTime,
          landingTime: flight.landingTime,
          flightImages: await convertImagesToBase64(flight.flightImages),
        }))
      );
  
      const dataToSubmit = {
        type: "combinedFlightForm",
        projectSubmitted: false,
        crew: formData.crew,
        method: formData.method,
        sightName: formData.sightName,
        date: formData.date.toISOString(),
        flights: flightData,
        images: await convertImagesToBase64(formData.images), // Convert and include images
        currentStep: formData.currentStep,
        managerTaskId: formData.managerTaskId,
      };
  
      console.log("Submitting data:", dataToSubmit);
  
      await axios.post("http://localhost:5001/api/submission", dataToSubmit);
      toast.success("Form submitted successfully!");
  
      if (currentStep < 10) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form. Please try again.");
    }
  };
  

  const startCamera = () => {
    setShowCamera(true);
  };

  return (
    <form className="space-y-6">
      <ToastContainer />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Crew">
          <div className="flex flex-wrap gap-2">
            {formData.crew.map((employee) => (
              <span
                key={employee}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500 text-white"
              >
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

      <FormField label="Site Name">
        <input
          type="text"
          value={formData.sightName}
          onChange={(e) => setFormData({ ...formData, sightName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </FormField>

      <FormField label="Date">
        <DatePicker
          selected={formData.date}
          onChange={(date) => setFormData({ ...formData, date: date || new Date() })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </FormField>

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
        <>
          <div className="mt-4 grid grid-cols-4 gap-4 items-end">
            <FormField label="Flight Number">
              <input
                type="text"
                value={newFlight.flightNo}
                onChange={(e) => setNewFlight({ ...newFlight, flightNo: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </FormField>

            <FormField label="Take-off Time">
              <input
                type="time"
                value={newFlight.takeoffTime}
                onChange={(e) => setNewFlight({ ...newFlight, takeoffTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </FormField>

            <FormField label="Landing Time">
              <input
                type="time"
                value={newFlight.landingTime}
                onChange={(e) => setNewFlight({ ...newFlight, landingTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </FormField>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={startCamera}
                className="w-full h-10 flex items-center justify-center bg-indigo-500 text-white rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaCamera size={20} />
              </button>

              <label
                htmlFor="file-upload"
                className="w-full h-10 flex items-center justify-center bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
              >
                <FaUpload size={20} />
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageUpload(Array.from(e.target.files || []))
                  }
                />
              </label>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={saveFlightDetails}
              className="mt-4 inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Save Flight
            </button>
          </div>
        </>
      )}

      {showCamera && (
        <Camera
          onImageCapture={(image) => {
            handleImageCapture(image);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {formData.flights.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Saved Flights:</h3>
          {formData.flights.map((flight, index) => (
            <div
              key={index}
              className="border rounded-md p-4 bg-gray-50 shadow-sm"
            >
              <p>
                <strong>Flight Number:</strong> {flight.flightNo}
              </p>
              <p>
                <strong>Take-off Time:</strong> {flight.takeoffTime}
              </p>
              <p>
                <strong>Landing Time:</strong> {flight.landingTime}
              </p>
              {flight.flightImages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {flight.flightImages.map((image, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(image)}
                      alt={`Flight ${index} Image ${idx}`}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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