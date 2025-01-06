import { useState } from "react";
import { DroneDetailsDisplay } from "../Displays/DroneDetailsDisplay";
import { TravellingDetailsDisplay } from "../Displays/TravellingDetailsDisplay";
import { OnFieldDetailsDisplay } from "../Displays/OnFieldDetailsDisplay";
import { BeforeFlightDisplay } from "../Displays/BeforeFlightDisplay";
import { AfterFlightDisplay } from "../Displays/AfterFlightDisplay";
import { GettingOffFieldDisplay } from "../Displays/GettingOffFieldDisplay";
import { ReturnToOfficeDisplay } from "../Displays/ReturnToOfficeDisplay";
import { DroneSubmissionDisplay } from "../Displays/DroneSubmissionDisplay";
import { DataSubmissionDisplay } from "../Displays/DataSubmissionDisplay";
import { TaskProgressDisplay } from "../Displays/TaskProgressDisplay";

interface TaskStepperProps {
  managerTaskId: string;
}

export const TaskStepperDisplay = ({ managerTaskId }: TaskStepperProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const steps = [
    {
      label: "Drone Details",
      component: <DroneDetailsDisplay managerTaskId={managerTaskId} />,
    },
    {
      label: "Travelling Details",
      component: <TravellingDetailsDisplay managerTaskId={managerTaskId} userName={""} />,
    },
    { label: "On-Field Details", component: <OnFieldDetailsDisplay managerTaskId={managerTaskId} /> },
    { label: "Before Flight Notes", component: <BeforeFlightDisplay managerTaskId={managerTaskId} /> },
    { label: "After Flight Notes", component: <AfterFlightDisplay managerTaskId={managerTaskId} /> },
    { label: "Getting Off Field", component: <GettingOffFieldDisplay managerTaskId={managerTaskId} /> },
    { label: "Return to Office", component: <ReturnToOfficeDisplay managerTaskId={managerTaskId} /> },
    { label: "Drone Submission", component: <DroneSubmissionDisplay managerTaskId={managerTaskId} /> },
    { label: "Data Submission", component: <DataSubmissionDisplay managerTaskId={managerTaskId} /> },
    { label: "Task Progress", component: <TaskProgressDisplay managerTaskId={managerTaskId} /> },
  ];

  const handleStepClick = (index: number) => setCurrentStep(index);
  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleImageClick = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
  };

  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };

  return (
    <div className="flex flex-col space-y-4 bg-white shadow-md rounded-lg p-4 h-full max-h-full overflow-hidden">
      {/* Stepper Header */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleStepClick(index)}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold transition-all ${
                index < currentStep
                  ? "bg-green-500"
                  : index === currentStep
                  ? "bg-indigo-600"
                  : "bg-gray-300"
              }`}
            >
              {index + 1}
            </div>
            <p
              className={`text-xs font-medium mt-1 ${
                index === currentStep ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-1 bg-gray-200 rounded-full mt-2">
        <div
          className="absolute h-1 bg-indigo-600 rounded-full transition-all"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="flex-grow bg-gray-50 rounded-md p-4 border border-gray-200 shadow-inner overflow-auto">
        {/* Passing click handler to components */}
        {steps[currentStep].component &&
          React.cloneElement(steps[currentStep].component as JSX.Element, {
            onImageClick: handleImageClick, // Pass the click handler to child components
          })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 transition-all"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          Next
        </button>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <img
            src={fullscreenImage}
            alt="Fullscreen View"
            className="max-w-full max-h-full"
          />
          <button
            onClick={closeFullscreenImage}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
