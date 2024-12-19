import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from "./ui/Modal";
import FormInput from "./ui/FormInput";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Task {
  name: string;
  department: string;
  company: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose }) => {
  const [department, setDepartment] = useState('');
  const [taskName, setTaskName] = useState('');
  const [company, setCompany] = useState('IDA'); // Default selected company
  const [departments, setDepartments] = useState<{ name: string; departmentId: string }[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Departments Based on Selected Company
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        if (!company) return; // Skip fetching if no company is selected
        const response = await fetch(`http://localhost:5000/api/getdepartments/hr?company=${company}`);
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const { data } = await response.json();
        setDepartments(data || []); // Set departments or an empty array
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]); // Reset departments on error
      }
    };

    fetchDepartments();
  }, [company]); // Re-fetch whenever the company changes

  const addTask = () => {
    if (!department) {
      setError('Please select a department first');
      return;
    }

    if (!taskName.trim()) {
      setError('Task name is required');
      return;
    }

    if (!company) {
      setError('Please select a company');
      return;
    }

    setTasks((prevTasks) => [
      ...prevTasks,
      { name: taskName.trim(), department, company },
    ]);
    setTaskName('');
    setError('');
  };

  const removeTask = (index: number) => {
    setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tasks.length === 0) {
      setError('Please add at least one task before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/multitasks/hr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company, tasks }), // Include company at the root level
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add tasks');
      }

      const result = await response.json();
      toast.success(result.message || 'Tasks added successfully!');
      setTasks([]);
      setDepartment('');
      setTaskName('');
      setCompany('IDA'); // Reset to default
      setError('');
      onClose();
    } catch (error: any) {
      console.error('Error adding tasks:', error.message);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Add New Tasks</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                value="IDA"
                checked={company === 'IDA'}
                onChange={(e) => setCompany(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>IDA</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="company"
                value="IPU"
                checked={company === 'IPU'}
                onChange={(e) => setCompany(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>IPU</span>
            </label>
          </div>
        </div>

        {/* Department Selection */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Select Department
          </label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Choose a department
            </option>
            {departments.map((dept) => (
              <option key={dept.departmentId} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Task Name Input */}
        <FormInput
          label="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          error={error}
          placeholder="Enter task name"
        />

        {/* Add Task Button */}
        <button
          type="button"
          onClick={addTask}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Task
        </button>

        {/* Task List */}
        {tasks.length > 0 && (
          <ul>
            {tasks.map((task, index) => (
              <li key={index}>
                {task.name} ({task.department}) - {task.company}
                <button onClick={() => removeTask(index)} className="text-red-600 hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2.5 rounded-lg ${isSubmitting ? 'bg-gray-400' : 'bg-green-600'}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Tasks'}
        </button>
      </form>
    </Modal>
  );
};

export default TaskForm;
