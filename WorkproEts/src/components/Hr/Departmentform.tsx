import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from "./ui/Modal";
import FormInput from "./ui/FormInput";

interface DepartmentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('IPU'); // Default selected company
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Department name is required');
      return;
    }

    if (!selectedCompany) {
      setError('Please select a company');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/departments/hr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, company: selectedCompany }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add department');
      }

      const result = await response.json();
      toast.success(result.message || 'Department added successfully!');
      setName('');
      setSelectedCompany('IPU'); // Reset to default
      setError('');
      onClose();
    } catch (error: any) {
      console.error('Error adding department:', error.message);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Add New Department</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Department Name Input */}
        <FormInput
          label="Department Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          placeholder="Enter department name"
        />

        {/* Company Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Company
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="company"
                value="IPU"
                checked={selectedCompany === 'IPU'}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>IPU</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="company"
                value="IDA"
                checked={selectedCompany === 'IDA'}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>IDA</span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100
                     hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Add Department'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentForm;
