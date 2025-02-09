import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  ArrowUp,
  ArrowDown,
  Users,
  TrendingUp,
  Award,
  Target,
  Clock,
  Calendar,
  Briefcase,
  FileSpreadsheet
} from 'lucide-react';

const employees = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' },
  { id: 4, name: 'Sarah Williams' },
];

const employeePerformance = [
  { name: 'John Doe', productivity: 92, quality: 88, timeliness: 85, overall: 88 },
  { name: 'Jane Smith', productivity: 88, quality: 90, timeliness: 87, overall: 88 },
  { name: 'Mike Johnson', productivity: 85, quality: 87, timeliness: 90, overall: 87 },
  { name: 'Sarah Williams', productivity: 90, quality: 85, timeliness: 88, overall: 88 },
];

const breakTimeData = [
  { name: 'John Doe', scheduled: 60, actual: 65 },
  { name: 'Jane Smith', scheduled: 60, actual: 58 },
  { name: 'Mike Johnson', scheduled: 60, actual: 62 },
  { name: 'Sarah Williams', scheduled: 60, actual: 57 },
];

const projectAllocation = [
  { name: 'Project A', John: 40, Jane: 30, Mike: 20, Sarah: 35 },
  { name: 'Project B', John: 25, Jane: 40, Mike: 35, Sarah: 25 },
  { name: 'Project C', John: 20, Jane: 15, Mike: 30, Sarah: 25 },
  { name: 'Project D', John: 15, Jane: 15, Mike: 15, Sarah: 15 },
];

const leaveData = [
  { month: 'Jan', sick: 2, vacation: 0, personal: 1 },
  { month: 'Feb', sick: 1, vacation: 3, personal: 0 },
  { month: 'Mar', sick: 0, vacation: 5, personal: 1 },
  { month: 'Apr', sick: 1, vacation: 0, personal: 2 },
  { month: 'May', sick: 3, vacation: 0, personal: 1 },
  { month: 'Jun', sick: 1, vacation: 2, personal: 0 },
];

const skillsData = [
  { subject: 'Technical', John: 90, Jane: 85, Mike: 88, Sarah: 92 },
  { subject: 'Communication', John: 85, Jane: 92, Mike: 85, Sarah: 88 },
  { subject: 'Leadership', John: 82, Jane: 88, Mike: 90, Sarah: 85 },
  { subject: 'Problem Solving', John: 88, Jane: 85, Mike: 87, Sarah: 90 },
  { subject: 'Teamwork', John: 90, Jane: 90, Mike: 88, Sarah: 92 },
];

const workloadTrend = [
  { week: 'W1', Team: 85, Individual: 82 },
  { week: 'W2', Team: 88, Individual: 85 },
  { week: 'W3', Team: 86, Individual: 88 },
  { week: 'W4', Team: 90, Individual: 87 },
  { week: 'W5', Team: 87, Individual: 89 },
  { week: 'W6', Team: 89, Individual: 86 },
];

const Overview = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);
  const [viewMode, setViewMode] = useState('team'); // 'team' or 'individual'

  const getPerformanceStatus = (value: number) => {
    if (value >= 90) return { color: 'text-green-500', text: 'Excellent' };
    if (value >= 85) return { color: 'text-blue-500', text: 'Good' };
    return { color: 'text-yellow-500', text: 'Average' };
  };

  return (
    <div className="space-y-6">
      {/* Header & View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analytics Hub</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive overview of {viewMode === 'team' ? 'team' : 'individual'} performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setViewMode('team')}
              className={`px-4 py-2 ${viewMode === 'team' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              Team View
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`px-4 py-2 ${viewMode === 'individual' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              Individual View
            </button>
          </div>
          {viewMode === 'individual' && (
            <select
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedEmployee.id}
              onChange={(e) =>
                setSelectedEmployee(
                  employees.find((emp) => emp.id === Number(e.target.value)) || employees[0]
                )
              }
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Performance Score</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {viewMode === 'team'
              ? `${Math.round(
                  employeePerformance.reduce((acc, curr) => acc + curr.overall, 0) /
                    employeePerformance.length
                )}%`
              : `${employeePerformance.find((emp) => emp.name === selectedEmployee.name)?.overall}%`}
          </p>
          <p className="text-sm text-green-500 mt-1">↑ 2% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-indigo-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Break Time Compliance</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {viewMode === 'team'
              ? '92%'
              : `${Math.round(
                  ((breakTimeData.find((emp) => emp.name === selectedEmployee.name)?.actual || 0) /
                    60) *
                    100
                )}%`}
          </p>
          <p className="text-sm text-blue-500 mt-1">Within scheduled limits</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="text-green-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Project Load</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {viewMode === 'team' ? '4' : '3'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Active projects</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-purple-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Leave Balance</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">15 days</p>
          <p className="text-sm text-gray-500 mt-1">Available</p>
        </div>
      </div>

      {/* Performance & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Metrics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillsData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                {viewMode === 'team' ? (
                  employees.map((emp, index) => (
                    <Radar
                      key={emp.id}
                      name={emp.name}
                      dataKey={emp.name.split(' ')[0]}
                      stroke={['#4F46E5', '#10B981', '#F59E0B', '#6366F1'][index]}
                      fill={['#4F46E5', '#10B981', '#F59E0B', '#6366F1'][index]}
                      fillOpacity={0.3}
                    />
                  ))
                ) : (
                  <Radar
                    name={selectedEmployee.name}
                    dataKey={selectedEmployee.name.split(' ')[0]}
                    stroke="#4F46E5"
                    fill="#4F46E5"
                    fillOpacity={0.3}
                  />
                )}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Workload Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={workloadTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Team"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5' }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="Individual"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project Allocation & Leave Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Project Allocation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectAllocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {viewMode === 'team' ? (
                  employees.map((emp, index) => (
                    <Bar
                      key={emp.id}
                      dataKey={emp.name.split(' ')[0]}
                      fill={['#4F46E5', '#10B981', '#F59E0B', '#6366F1'][index]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))
                ) : (
                  <Bar
                    dataKey={selectedEmployee.name.split(' ')[0]}
                    fill="#4F46E5"
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Leave Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leaveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sick"
                  stackId="1"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="vacation"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="personal"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Break Time Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Break Time Analysis</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="scheduled" name="Scheduled Break" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual Break" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;
