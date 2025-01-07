export interface Contact {
    id: string;
    name: string;
    email: string;
    department: string;
    created_at: string;
  }
  
  export interface Component {
    id: string;
    name: string;
    type: 'employee' | 'manager';
    contact_id: string;
    is_visible: boolean;
    created_at: string;
  }
  
  export type ContactType = 'employee' | 'manager';