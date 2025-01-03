import { useState } from "react";
import { Check, X } from "lucide-react";
import { FormField } from "../ui/FormField";
import { ImageUpload } from "../ui/ImageUpload";
import Camera from "../ui/Camera";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

interface Task {
  _id: string;
  selectedEmployees: string[];
}

interface TaskStepperProps {
  currentStep: number;
  task: Task;
  setCurrentStep: (step: number) => void;
}

export const DataSubmissionForm = ({ currentStep,setCurrentStep, task }: TaskStepperProps) => {
  const [projectSubmitted, setProjectSubmitted] = useState<boolean | null>(null);
  const [submissions, setSubmissions] = useState({
    droneSurveyData: { submitted: null, systemName: "", media: [] as File[], capturedImages: [] as string[] },
    dgpsStaticData: { submitted: null, systemName: "", media: [] as File[], capturedImages: [] as string[] },
    dgpsRtkData: { submitted: null, systemName: "", media: [] as File[], capturedImages: [] as string[] },
    droneVideoData: { submitted: null, systemName: "", media: [] as File[], capturedImages: [] as string[] },
    dronePanosData: { submitted: null, systemName: "", media: [] as File[], capturedImages: [] as string[] },
    dronePhotos: { submitted: null, systemName: "", media: [] as File[], capturedImages: [] as string[] },
  });

  // Handle media file uploads
  const handleMediaChange = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSubmissions((prev) => ({
      ...prev,
      [key]: { ...prev[key], media: [...prev[key].media, ...files] },
    }));
  };

  // Handle system name changes
  const handleSystemNameChange = (key: string, event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSubmissions((prev) => ({
      ...prev,
      [key]: { ...prev[key], systemName: value },
    }));
  };

  // Handle image capture
  const handleImageCapture = (key: string, image: string) => {
    setSubmissions((prev) => ({
      ...prev,
      [key]: { ...prev[key], capturedImages: [...prev[key].capturedImages, image] },
    }));
  };

  // Handle deleting captured images
  const handleDeleteCapturedImage = (key: string, index: number) => {
    setSubmissions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        capturedImages: prev[key].capturedImages.filter((_, i) => i !== index),
      },
    }));
  };

  // Submit the form data
  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        type: "DataSubmission",
        projectSubmitted,
        submissions,
        currentStep,
        managerTaskId: task._id,
      };

      console.log("Form Data to Submit:", JSON.stringify(dataToSubmit, null, 2));

      // Send the data to the backend API
      const response = await axios.post("http://localhost:5001/api/submission", dataToSubmit);

      
      console.log("Response:", response.data);
      if (projectSubmitted === null) {
        toast.error("Please indicate if the project is submitted.");
        return;
      }

      toast.success("Form submitted successfully!");
    

      if(currentStep < 10){
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error submitting form. Please try again.");
    }
  };

  // Render individual data submissions
  const renderDataSubmission = (key: string, label: string) => (
    <div key={key}>
      <h3 className="text-sm font-medium text-gray-700 mb-4">{label}</h3>
      <div className="flex items-center space-x-4 mb-4">
        <button
          type="button"
          onClick={() =>
            setSubmissions((prev) => ({ ...prev, [key]: { ...prev[key], submitted: true } }))
          }
          className={`flex items-center px-4 py-2 rounded-md ${
            submissions[key].submitted
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-gray-50 text-gray-700 border-gray-200"
          } border`}
        >
          <Check className="h-4 w-4 mr-2" />
          Yes
        </button>
        <button
          type="button"
          onClick={() =>
            setSubmissions((prev) => ({ ...prev, [key]: { ...prev[key], submitted: false } }))
          }
          className={`flex items-center px-4 py-2 rounded-md ${
            submissions[key].submitted === false
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-gray-50 text-gray-700 border-gray-200"
          } border`}
        >
          <X className="h-4 w-4 mr-2" />
          No
        </button>
      </div>
      {submissions[key].submitted && (
        <div className="space-y-4">
          <FormField label="System Name">
            <select
              value={submissions[key].systemName}
              onChange={(e) => handleSystemNameChange(key, e)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="" disabled>
                Select System
              </option>
              {Array.from({ length: 16 }, (_, i) => (
                <option key={`PC-${i + 1}`} value={`PC-${i + 1}`}>
                  PC-{i + 1}
                </option>
              ))}
              <option value="PC-MAC">PC-MAC</option>
            </select>
          </FormField>
          <FormField label="Upload Images">
            <ImageUpload
              images={submissions[key].media}
              onChange={(images) => handleMediaChange(key, { target: { files: images } })}
            />
          </FormField>
          <FormField label="Capture Images">
            <Camera onImageCapture={(image) => handleImageCapture(key, image)} />
            {submissions[key].capturedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {submissions[key].capturedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Captured ${index}`}
                      className="w-full h-auto rounded-md shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteCapturedImage(key, index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormField>
        </div>
      )}
    </div>
  );

  return (
    <form className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold">Project Submitted:</h2>
        <div className="flex items-center space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setProjectSubmitted(true)}
            className={`flex items-center px-4 py-2 rounded-md ${
              projectSubmitted === true ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"
            } border`}
          >
            <Check className="h-4 w-4 mr-2" />
            Yes
          </button>
          <button
            type="button"
            onClick={() => setProjectSubmitted(false)}
            className={`flex items-center px-4 py-2 rounded-md ${
              projectSubmitted === false ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-50 text-gray-700 border-gray-200"
            } border`}
          >
            <X className="h-4 w-4 mr-2" />
            No
          </button>
        </div>
      </div>

      {renderDataSubmission("droneSurveyData", "Drone Survey Data")}
      {renderDataSubmission("dgpsStaticData", "DGPS Static Data")}
      {renderDataSubmission("dgpsRtkData", "DGPS RTK Data")}
      {renderDataSubmission("droneVideoData", "Drone Video Data")}
      {renderDataSubmission("dronePanosData", "Drone Panos Data")}
      {renderDataSubmission("dronePhotos", "Drone Photos")}

      <div>
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-6 inline-flex items-center px-6 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </div>

      <ToastContainer />
    </form>
  );
};
