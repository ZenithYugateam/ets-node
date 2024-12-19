import DashboardLayout from '../Hr/layouts/DashboardLayout';
import { WelcomeSection } from '../Hr/dashboard/components/WelcomeSection';
import { AttendanceSection } from '../Hr/dashboard/components/AttendanceSection';
import { MetricsSection } from '../Hr/dashboard/components/MetricsSection';
import Side from '../Hr/Side'; // Import the sidebar component

export default function HRDashboard() {
  return (
    <div className="flex">
      <Side /> {/* Include the sidebar */}
      <div className="flex-1">
        <DashboardLayout>
          <div className="space-y-8">
            <WelcomeSection />
            <AttendanceSection />
            <MetricsSection />
          </div>
        </DashboardLayout>
      </div>
    </div>
  );
}
