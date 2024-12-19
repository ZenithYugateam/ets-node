import React from 'react';
import { ClientFormData } from '../Types/client';
import Input from '../shared/Input';
import Select from '../shared/Select';
import Button from '../shared/Button';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ClientFormProps {
  initialData?: ClientFormData;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ initialData, onCancel }) => {
  const [formData, setFormData] = React.useState<ClientFormData>(
    initialData || {
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'active',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add client');
      }

      const data = await response.json();
      toast.success('Client added successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'active',
      });
      onCancel(); // Close the form on success
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Error adding client. Please try again.');
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
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <Input
        label="Company"
        value={formData.company}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        required
      />
      <Select
        label="Status"
        value={formData.status}
        onChange={(e) =>
          setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
        }
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Update Client' : 'Add Client'}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
