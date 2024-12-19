import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { Client, ClientFormData } from '../Types/client';
import DataGrid from '../shared/DataGrid';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import ClientForm from '../clients/ClientForm';
import ClientDetails from '../clients/ClientDetails';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Side from '../../Hr/Side';

const columns = [
  { field: 'name', header: 'Name' },
  { field: 'email', header: 'Email' },
  { field: 'company', header: 'Company' },
  {
    field: 'status',
    header: 'Status',
    render: (value: string) => (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    ),
  },
  {
    field: 'joinDate',
    header: 'Join Date',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
];

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');

  // Fetch clients from the database on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/getclients');
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const data = await response.json();
        setClients(data.data); // Assuming the response has a `data` field containing clients
      } catch (error: any) {
        console.error('Error fetching clients:', error.message);
        toast.error('Failed to fetch clients. Please try again later.');
      }
    };

    fetchClients();
  }, []);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setModalMode('edit');
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleView = (client: Client) => {
    setModalMode('view');
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: ClientFormData) => {
    try {
      if (modalMode === 'add') {
        const response = await fetch('http://localhost:5000/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to add client');
        }

        const newClient = await response.json();
        setClients([...clients, newClient.data]); // Assuming the response has a `data` field containing the new client
        toast.success('Client added successfully!');
      } else if (modalMode === 'edit' && selectedClient) {
        const response = await fetch(
          `http://localhost:5000/api/clients/${selectedClient._id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update client');
        }

        const updatedClient = await response.json();
        setClients(
          clients.map((client) =>
            client._id === selectedClient._id
              ? { ...client, ...updatedClient.data }
              : client
          )
        );
        toast.success('Client updated successfully!');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving client:', error.message);
      toast.error('Failed to save client. Please try again.');
    }
  };

  const handleDelete = async (clientId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      setClients(clients.filter((client) => client._id !== clientId));
      toast.success('Client deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting client:', error.message);
      toast.error('Failed to delete client. Please try again.');
    }
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'add':
        return 'Add New Client';
      case 'edit':
        return 'Edit Client';
      case 'view':
        return 'Client Details';
      default:
        return '';
    }
  };

  return (
    <div className="flex">
      <Side /> {/* Include the sidebar here */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 mt-14 lg:mt-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <Button variant="primary" icon={UserPlus} onClick={handleAdd}>
            Add Client
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <DataGrid
            columns={columns}
            data={clients}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete} // Add delete functionality
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={getModalTitle()}
        >
          {modalMode === 'view' && selectedClient ? (
            <ClientDetails client={selectedClient} />
          ) : (
            <ClientForm
              initialData={selectedClient || undefined}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ClientsPage;
