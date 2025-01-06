
export interface Break {
  start: string;
  end: string;
  reason?: string;
}


export interface Employee {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  role: string;
  breaks?: Break[]; 
}

  
  export interface DayDetails {
    date: Date;
    employees: Employee[];
    managers: Employee[];
  }