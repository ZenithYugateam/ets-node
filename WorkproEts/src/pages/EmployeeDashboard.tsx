import TimeCard from '../components/TimeCard';
import TaskList from '../components/TaskList';
import PerformanceMetrics from '../components/PerformanceMetrics';

const EmployeeDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeCard />
        <TaskList />
      </div>

      <PerformanceMetrics />
    </div>
  );
};

export default EmployeeDashboard;