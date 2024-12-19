export interface User {
    id: string;
    empId: string;
    name: string;
    email: string;
    password?: string;
    role: Role;
    department: string;
    manager?: string;
    joinedDate: string;
    phone:number;
    company:string;
  }
  
  export type Role = 'Employee' | 'Manager' | 'HR' | 'Accountant';
  
  export interface Department {
    id: string;
    name: string;
  }
  
  export interface FormError {
    field: string;
    message: string;
  }