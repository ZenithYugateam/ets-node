export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
}