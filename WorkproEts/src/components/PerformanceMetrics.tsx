import React from 'react';
import { TrendingUp, Target, Clock } from 'lucide-react';

const metrics = [
  { id: 1, label: 'Tasks Completed', value: '23', trend: '+15%' },
  { id: 2, label: 'Productivity Score', value: '92%', trend: '+5%' },
  { id: 3, label: 'Attendance Rate', value: '96%', trend: '+2%' },
];

const PerformanceMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <div key={metric.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{metric.value}</p>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              {metric.trend}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetrics;