import { Contact, Component } from './types';

export const mockEmployees: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    department: 'Engineering',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Alice Smith',
    email: 'alice@example.com',
    department: 'Marketing',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    department: 'Sales',
    created_at: new Date().toISOString()
  }
];

export const mockManagers: Contact[] = [
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    department: 'Engineering',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Mike Brown',
    email: 'mike@example.com',
    department: 'Marketing',
    created_at: new Date().toISOString()
  }
];

export const mockComponents: Record<string, Component[]> = {
  '1': [
    { id: '1', name: 'Dashboard', type: 'employee', contact_id: '1', is_visible: true, created_at: new Date().toISOString() },
    { id: '2', name: 'Reports', type: 'employee', contact_id: '1', is_visible: true, created_at: new Date().toISOString() },
    { id: '3', name: 'Analytics', type: 'employee', contact_id: '1', is_visible: false, created_at: new Date().toISOString() }
  ],
  '2': [
    { id: '4', name: 'Dashboard', type: 'employee', contact_id: '2', is_visible: true, created_at: new Date().toISOString() },
    { id: '5', name: 'Reports', type: 'employee', contact_id: '2', is_visible: false, created_at: new Date().toISOString() }
  ],
  '3': [
    { id: '6', name: 'Dashboard', type: 'employee', contact_id: '3', is_visible: true, created_at: new Date().toISOString() },
    { id: '7', name: 'Analytics', type: 'employee', contact_id: '3', is_visible: true, created_at: new Date().toISOString() }
  ],
  '4': [
    { id: '8', name: 'Admin Panel', type: 'manager', contact_id: '4', is_visible: true, created_at: new Date().toISOString() },
    { id: '9', name: 'Team Overview', type: 'manager', contact_id: '4', is_visible: true, created_at: new Date().toISOString() },
    { id: '10', name: 'Performance Metrics', type: 'manager', contact_id: '4', is_visible: false, created_at: new Date().toISOString() }
  ],
  '5': [
    { id: '11', name: 'Admin Panel', type: 'manager', contact_id: '5', is_visible: true, created_at: new Date().toISOString() },
    { id: '12', name: 'Team Overview', type: 'manager', contact_id: '5', is_visible: false, created_at: new Date().toISOString() }
  ]
};