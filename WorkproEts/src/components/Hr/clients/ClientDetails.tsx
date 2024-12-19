import React, { useEffect, useState } from 'react';
import { Client } from '../Types/client';

interface ClientDetailsProps {
  clientId: string; // Pass client ID as a prop
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ clientId }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/getclients/${clientId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch client: ${response.statusText}`);
        }

        const data = await response.json();
        setClient(data.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching client:', err.message);
        setError('Failed to fetch client details.');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  if (loading) {
    return <p>Loading client details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!client) {
    return <p>No client found.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p className="mt-1">{client.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="mt-1">{client.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Phone</p>
          <p className="mt-1">{client.phone}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Company</p>
          <p className="mt-1">{client.company}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Status</p>
          <p className="mt-1 capitalize">{client.status}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Join Date</p>
          <p className="mt-1">{new Date(client.joinDate).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
