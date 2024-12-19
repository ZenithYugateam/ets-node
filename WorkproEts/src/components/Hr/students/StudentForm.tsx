import React from 'react';
import Input from '../shared/Input';
import Select from '../shared/Select';
import Button from '../shared/Button';

interface StudentFormProps {
  initialData?: StudentFormData;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onCancel }) => {
  const [formData, setFormData] = React.useState<StudeormData>(
    initialData || {
      name: '',
      age: '',
      hasPassport: false,
      highestQualification: '',
      status: 'enrolled',
    }
  );
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add student');
      }

      const result = await response.json();
      console.log('Student added:', result.data);
      alert('Student added successfully!');
      setFormData({
        name: '',
        age: '',
        hasPassport: false,
        highestQualification: '',
        status: 'enrolled',
      });
    } catch (error) {
      console.error('Error submitting form:', error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        label="Age"
        type="number"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        required
      />
      <div>
        <p className="text-sm font-medium text-gray-700">Passport</p>
        <div className="flex space-x-4 mt-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="passport"
              value="true"
              checked={formData.hasPassport === true}
              onChange={() => setFormData({ ...formData, hasPassport: true })}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="passport"
              value="false"
              checked={formData.hasPassport === false}
              onChange={() => setFormData({ ...formData, hasPassport: false })}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span>No</span>
          </label>
        </div>
      </div>
      <Select
        label="Highest Qualification"
        value={formData.highestQualification}
        onChange={(e) =>
          setFormData({ ...formData, highestQualification: e.target.value })
        }
        options={[
          { value: 'High School', label: 'High School' },
          { value: 'Diploma', label: 'Diploma' },
          { value: 'Bachelor\'s Degree', label: 'Bachelor\'s Degree' },
          { value: 'Master\'s Degree', label: 'Master\'s Degree' },
          { value: 'PhD', label: 'PhD' },
        ]}
        required
      />
      <Select
        label="Status"
        value={formData.status}
        onChange={(e) =>
          setFormData({ ...formData, status: e.target.value as 'enrolled' | 'not enrolled' })
        }
        options={[
          { value: 'enrolled', label: 'Enrolled' },
          { value: 'not enrolled', label: 'Not Enrolled' },
        ]}
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Submitting...' : initialData ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
