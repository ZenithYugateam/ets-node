import { Modal } from './Modal';
import { BugReportForm } from './BugReportForm';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useState } from 'react';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [loading, setLoading] = useState(false); // State to track loading
  const userName = sessionStorage.getItem('userName') || 'Anonymous'; // Default value
  let role = sessionStorage.getItem('role') || 'Guest';
  role = role.slice(1, -1);

  const submitBugReport = async (formData: any) => {
    try {
      const response = await axios.post('http://localhost:5001/api/bug-report', formData);

      if (response.status === 201 || response.status === 200) {
        toast.success('Bug report submitted successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast.error('Failed to submit bug report. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true); // Start loading

    const base64Images: string[] = [];
    for (let pair of formData.entries()) {
      if (pair[0].startsWith('screenshot_')) {
        const file = pair[1] as File;
        const base64 = await convertFileToBase64(file);
        base64Images.push(base64); // Collect all Base64 strings in an array
      }
    }

    // Build the structured data object
    const formDataObject = {
      username: userName,
      role: role,
      img: base64Images,
      description: formData.get('description') as string,
    };

    console.log('Structured JSON:', formDataObject);

    await submitBugReport(formDataObject); // Wait for the report submission to complete
    onClose(); // Close the modal
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result.toString().split(',')[1]); // Extract Base64 string only
        } else {
          reject('Failed to convert file to Base64');
        }
      };
      reader.onerror = () => reject('Failed to read file');
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Report Issue</h2>
          </div>
          <BugReportForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={loading} // Pass loading state to the form
          />
        </div>
      </Modal>
      <ToastContainer />
    </>
  );
}
