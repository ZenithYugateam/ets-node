import { DroneDetailsDisplay } from "../../Displays/DroneDetailsDisplay";
import { DroneSubmissionDisplay } from "../../Displays/DroneSubmissionDisplay";
import { TravellingDetailsDisplay } from "../../Displays/TravellingDetailsDisplay";
import { ReturnToOfficeDisplay } from "../../Displays/ReturnToOfficeDisplay";
import { OnFieldDetailsDisplay } from "../../Displays/OnFieldDetailsDisplay";
import { GettingOffFieldDisplay } from "../../Displays/GettingOffFieldDisplay";
import { FlightNotesDisplay } from "../../Displays/FlightNotesDisplay";
import { DataSubmissionDisplay } from "../../Displays/DataSubmissionDisplay";
import { TaskProgressDisplay } from "../../Displays/TaskProgressDisplay";

interface ReportViewProps {
  managerTaskId: string;
  type: string;
}

export const ReportView = ({ managerTaskId, type }: ReportViewProps) => {
    console.log("Rendering ReportView for managerTaskId:", managerTaskId); // Debugging
  
    return (
      <div className="p-8 bg-white rounded-lg shadow-md space-y-12">
        <header className="border-b pb-4">
          <h1 className="text-2xl font-bold">Task Submission Report</h1>
        </header>
  
        {/* Drone Details Section */}
        <section key={`drone-${managerTaskId}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DroneDetailsDisplay managerTaskId={managerTaskId} />
            <DroneSubmissionDisplay managerTaskId={managerTaskId} />
          </div>
        </section>
  
        {/* Travelling Details Section */}
        <section key={`travel-${managerTaskId}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TravellingDetailsDisplay managerTaskId={managerTaskId} userName={""} />
            <ReturnToOfficeDisplay managerTaskId={managerTaskId} />
          </div>
        </section>
  
        {/* On-Field Details Section */}
        <section key={`field-${managerTaskId}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OnFieldDetailsDisplay managerTaskId={managerTaskId} />
            <GettingOffFieldDisplay managerTaskId={managerTaskId} />
          </div>
        </section>
  
        {/* Flight Notes Section */}
        <section key={`flight-${managerTaskId}`}>
          <FlightNotesDisplay managerTaskId={managerTaskId} />
        </section>
  
        {/* Data Submission Section */}
        <section key={`data-${managerTaskId}`}>
          <DataSubmissionDisplay managerTaskId={managerTaskId} />
        </section>
  
        {/* Task Progress Section */}
        <section key={`progress-${managerTaskId}`}>
          <TaskProgressDisplay managerTaskId={managerTaskId} type={""} />
        </section>
      </div>
    );
  };
  