import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const breakTimeData = [
  { name: 'Monday', scheduled: 60, actual: 75 },
  { name: 'Tuesday', scheduled: 60, actual: 55 },
  { name: 'Wednesday', scheduled: 60, actual: 65 },
  { name: 'Thursday', scheduled: 60, actual: 58 },
  { name: 'Friday', scheduled: 60, actual: 70 },
];

const calculateStats = () => {
  const totalScheduled = breakTimeData.reduce(
    (acc, curr) => acc + curr.scheduled,
    0
  );
  const totalActual = breakTimeData.reduce(
    (acc, curr) => acc + curr.actual,
    0
  );
  const averageDeviation =
    Math.abs(totalActual - totalScheduled) / breakTimeData.length;

  return {
    totalScheduled,
    totalActual,
    averageDeviation,
    complianceRate:
      (breakTimeData.filter(
        (d) => Math.abs(d.actual - d.scheduled) <= 10
      ).length /
        breakTimeData.length) *
      100,
  };
};

const BreakTimeAnalysisPage = () => {
  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Break Time Analysis</h2>
        <div className="flex items-center gap-2">
          <Clock className="text-blue-600 w-6 h-6" />
          <span className="text-gray-600">Weekly Overview</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">
              Total Break Time
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalActual} minutes
          </p>
          <p className="text-sm text-gray-500 mt-1">
            vs {stats.totalScheduled} scheduled
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-yellow-500 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">
              Average Deviation
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.averageDeviation.toFixed(1)} minutes
          </p>
          <p className="text-sm text-gray-500 mt-1">from scheduled breaks</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-500 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">
              Compliance Rate
            </h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.complianceRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            within 10-minute threshold
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-6">
          Daily Break Time Distribution
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="scheduled" name="Scheduled Break" fill="#4F46E5" />
              <Bar dataKey="actual" name="Actual Break" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analysis and Recommendations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Analysis & Recommendations
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2">
              Key Observations
            </h4>
            <ul className="list-disc list-inside text-blue-600 space-y-1">
              <li>Longest breaks typically occur on Mondays and Fridays</li>
              <li>Mid-week breaks are more consistent with scheduled times</li>
              <li>
                Average deviation suggests reasonable break time management
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">
              Recommendations
            </h4>
            <ul className="list-disc list-inside text-green-600 space-y-1">
              <li>
                Consider adjusting Monday schedules to account for longer breaks
              </li>
              <li>Maintain current mid-week break patterns</li>
              <li>Monitor Friday breaks to ensure productivity levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakTimeAnalysisPage;
