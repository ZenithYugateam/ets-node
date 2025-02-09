// types/Employee.ts
export interface Task {
    completed: number;
    total: number;
  }
  
  export interface Employee {
    _id: string;
    name: string;
    rate: number;
    trend: string;
    status: 'Excellent' | 'Good' | 'Outstanding' | string;
    tasks: Task;
    streak: number;
    awards: string[];
    avatar: string;
  }
  