
type Priority = 'Low' | 'Medium' | 'High';
type Status = 'Completed' | 'In Progress' | 'Pending';

export interface Task {
  _id: string;
  projectName: string;
  taskName: string;
  employeeName: string;
  priority: Priority;
  deadline: string | null;
  description: string;
  managerName: string;
  status: Status;
  remarks: string[];
  droneRequired: string; 
  selectedEmployees: string[];
  managerTaskId : string;
}

  
  export interface DroneDetails {
    droneName: string;
    checklistItems: string[];
    images: File[];
  }
  
  export interface TravellingDetails {
    vehicleNumbers: string[];
    date: Date;
    time: string;
    readings: number;
    images: File[];
  }
  
  export interface FlightNotes {
    crew: string[];
    method: string;
    sightName: string;
    date: Date;
    flightNo: string;
    takeoffTime: string;
    landingTime?: string;
    images: File[];
    currentStep  : number;
    managerTaskId : string;
  }