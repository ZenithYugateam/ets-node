import { Modal } from './Modal';
import { BugReportForm } from './BugReportForm';
import axios from 'axios';
import { toast, ToastContainer} from 'react-toastify';
import { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [loading, setLoading] = useState(false); // State to track loading
  const userName = sessionStorage.getItem('userName') || 'Anonymous';
  let role = sessionStorage.getItem('role') || 'Guest';
  role = role.slice(1, -1);

  const submitBugReport = async (formData: any) => {
    try {
      const response = await axios.post('http://localhost:5001/api/bug-report', formData);

      if (response.status === 201 || response.status === 200) {
        toast.success('Bug reported successfully, sended Maintenance Team!', {
          position: 'top-right',
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast.error('Failed Bug-report. Please try again.', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    const base64Images: string[] = [];
    for (let pair of formData.entries()) {
      if (pair[0].startsWith('screenshot_')) {
        const file = pair[1] as File;
        const base64 = await convertFileToBase64(file);
        base64Images.push(base64);
      }
    }

    const formDataObject = {
      username: userName,
      role: role,
      img: base64Images,
      description: formData.get('description') as string,
    };

    console.log('Structured JSON:', formDataObject);

    await submitBugReport(formDataObject);
    onClose(); 
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result.toString().split(',')[1]);
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
          <BugReportForm onSubmit={handleSubmit} onCancel={onClose} isLoading={loading} />
        </div>
      </Modal>
    </>
  );
}
