import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Task } from '../types';

interface ChecklistItem {
  item: string;
  quantity: number;
  _id: string;
}

interface Submission {
  type: string;
  droneName: string;
  checklistItems: ChecklistItem[];
  images: string[];
  currentStep: number;
  managerTaskId: string;
  selectedVehicles: any[];
  flights: any[];
  // ... other fields as needed
}

interface DroneSubmissionFormProps {
  currentStep: number;
  task: Task;
  setCurrentStep: (step: number) => void;
}

export const DroneSubmissionForm = ({ currentStep, setCurrentStep, task }: DroneSubmissionFormProps) => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const managerTaskId = task._id;
      try {
        const response = await fetch('https://ets-node-1.onrender.com/api/droneDetailsList', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ managerTaskId })
        });

        if (!response.ok) {
          const resData = await response.json();
          throw new Error(resData.error || resData.message || 'Failed to fetch submissions');
        }

        const data: Submission[] = await response.json();

        if (!data || data.length === 0) {
          setError('No submissions found for the given managerTaskId with currentStep = 0');
          return;
        }

        // Assuming we only care about the first submission
        setSubmission(data[0]);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, [task._id]);

  const toggleItem = (itemName: string) => {
    setCheckedItems((prev) =>
      prev.includes(itemName) ? prev.filter((i) => i !== itemName) : [...prev, itemName]
    );
  };

  const allItemsChecked =
    submission?.checklistItems &&
    submission.checklistItems.length > 0 &&
    submission.checklistItems.every((ci) => checkedItems.includes(ci.item));

  const handleSubmit = async () => {
    if (!submission) return;
    const payload = {
      managerTaskId: submission.managerTaskId,
      checkedItems,
      type : "DroneSubmitForm",
      currentStep : currentStep
    };

    try {
      const response = await fetch('https://ets-node-1.onrender.com/api/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || resData.message || 'Failed to submit data');
      }

      if(currentStep < 10){
        setCurrentStep(currentStep + 1);
      }

      // If successful:
      setSubmitError(null);
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message);
      setSubmitSuccess(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {submission && (
        <>
          <h2 className="text-xl font-semibold">Drone Name: {submission.droneName}</h2>
          
          {submission.checklistItems?.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {submission.checklistItems.map((checkItem) => (
                  <button
                    key={checkItem._id}
                    type="button"
                    onClick={() => toggleItem(checkItem.item)}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      checkedItems.includes(checkItem.item)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm">
                      {checkItem.item} (Qty: {checkItem.quantity})
                    </span>
                    {checkedItems.includes(checkItem.item) && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {submission.checklistItems && !allItemsChecked && (
            <p className="text-sm text-red-600">
              Please ensure all items are checked before proceeding
            </p>
          )}

          {/* Submit button */}
          <div>
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-4 py-2 mt-4 text-white rounded ${allItemsChecked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={!allItemsChecked}
            >
              Submit
            </button>
          </div>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          {submitSuccess && <p className="text-sm text-green-600">Submission successful!</p>}
        </>
      )}
    </div>
  );
};
