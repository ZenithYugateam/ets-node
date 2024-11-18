import { TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';

const metrics = [
  {
    id: 1,
    label: 'Team Productivity',
    value: '87%',
    change: '+5%',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    id: 2,
    label: 'Active Members',
    value: '12/15',
    change: '+2',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    id: 3,
    label: 'Tasks Completed',
    value: '45',
    change: '+12',
    icon: CheckCircle2,
    color: 'text-indigo-600'
  },
  {
    id: 4,
    label: 'Avg. Completion Time',
    value: '3.2 days',
    change: '-0.5 days',
    icon: Clock,
    color: 'text-purple-600'
  }
];

const PerformanceOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon className={`h-5 w-5 ${metric.color}`} />
                <p className="ml-2 text-sm font-medium text-gray-600">
                  {metric.label}
                </p>
              </div>
              <span className="text-sm text-green-600">{metric.change}</span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">
              {metric.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceOverview;