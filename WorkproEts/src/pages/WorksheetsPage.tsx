import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  FileSpreadsheet,
  Clock,
  BarChart2,
  Calendar,
  Filter,
  Download,
  Plus
} from 'lucide-react';
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
  Line
} from 'recharts';
import WorksheetManagement from '../components/employee/WorksheetManagement';

const employees = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' },
  { id: 4, name: 'Sarah Williams' },
];

const worksheetData = [
  {
    date: new Date(),
    project: 'Project A',
    hours: 6,
    tasks: 'Frontend Development',
    employee: 'John Doe'
  },
  {
    date: new Date(),
    project: 'Project B',
    hours: 2,
    tasks: 'Code Review',
    employee: 'John Doe'
  },
  {
    date: new Date(Date.now() - 86400000),
    project: 'Project C',
    hours: 4,
    tasks: 'Testing',
    employee: 'John Doe'
  },
  {
    date: new Date(Date.now() - 86400000),
    project: 'Project A',
    hours: 4,
    tasks: 'Bug Fixes',
    employee: 'John Doe'
  },
];

const weeklyHoursData = [
  { day: 'Mon', hours: 8.5, expected: 8 },
  { day: 'Tue', hours: 7.8, expected: 8 },
  { day: 'Wed', hours: 8.2, expected: 8 },
  { day: 'Thu', hours: 8.7, expected: 8 },
  { day: 'Fri', hours: 7.9, expected: 8 },
];

const projectDistribution = [
  { name: 'Project A', hours: 45, color: '#4F46E5' },
  { name: 'Project B', hours: 25, color: '#10B981' },
  { name: 'Project C', hours: 20, color: '#F59E0B' },
  { name: 'Project D', hours: 10, color: '#6366F1' },
];

const monthlyTrendData = [
  { month: 'Jan', hours: 168 },
  { month: 'Feb', hours: 160 },
  { month: 'Mar', hours: 176 },
  { month: 'Apr', hours: 165 },
  { month: 'May', hours: 170 },
  { month: 'Jun', hours: 168 },
];

const WorksheetsPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);
  const [selectedView, setSelectedView] = useState('table');

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Timesheet Analytics</h2>
          <p className="text-gray-600 mt-1">
            Track and analyze employee work hours and project distribution
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEmployee.id}
            onChange={(e) =>
              setSelectedEmployee(
                employees.find((emp) => emp.id === Number(e.target.value)) ||
                  employees[0]
              )
            }
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Total Hours</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">168</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="text-green-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Utilization</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">92%</p>
          <p className="text-sm text-green-500 mt-1">↑ 3% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-purple-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Projects</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">4</p>
          <p className="text-sm text-gray-500 mt-1">Active projects</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="text-indigo-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Entries</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">24</p>
          <p className="text-sm text-gray-500 mt-1">This week</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Hours Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Weekly Hours Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar
                  dataKey="hours"
                  name="Actual Hours"
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expected"
                  name="Expected Hours"
                  fill="#E5E7EB"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Time Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Project Time Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="hours"
                  >
                    {projectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center">
              <div className="space-y-4">
                {projectDistribution.map((project, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <span className="text-gray-700">{project.name}</span>
                    <span className="text-gray-500 ml-auto">{project.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Monthly Hours Trend
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis domain={[150, 180]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <WorksheetManagement />
      {/* Recent Entries Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Entries</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {worksheetData.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(entry.date, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.project}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.hours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.tasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorksheetsPage;
