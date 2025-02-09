import React, { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Target, TrendingUp, Award } from 'lucide-react';

const employees = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' },
  { id: 4, name: 'Sarah Williams' },
];

const performanceData = {
  current: [
    { subject: 'Technical Skills', value: 85 },
    { subject: 'Communication', value: 90 },
    { subject: 'Problem Solving', value: 88 },
    { subject: 'Leadership', value: 82 },
    { subject: 'Innovation', value: 87 },
    { subject: 'Teamwork', value: 92 },
  ],
  historical: [
    { month: 'Jan', performance: 82 },
    { month: 'Feb', performance: 84 },
    { month: 'Mar', performance: 86 },
    { month: 'Apr', performance: 85 },
    { month: 'May', performance: 88 },
    { month: 'Jun', performance: 87 },
  ]
};

const skillsBreakdown = [
  { skill: 'JavaScript', level: 90 },
  { skill: 'React', level: 85 },
  { skill: 'Node.js', level: 82 },
  { skill: 'SQL', level: 88 },
  { skill: 'UI/UX', level: 86 },
];

const PerformanceMetricsPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);

  return (
    <div className="space-y-6">
      {/* Header & Employee Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Individual Performance Analysis
          </h2>
          <p className="text-gray-600 mt-1">
            Detailed performance metrics and skill assessment
          </p>
        </div>
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
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Overall Score</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">87%</p>
          <p className="text-sm text-green-500 mt-1">↑ 2% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-green-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Top Skill</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">Teamwork</p>
          <p className="text-sm text-gray-500 mt-1">92% proficiency</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-purple-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Growth Area</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">Leadership</p>
          <p className="text-sm text-blue-500 mt-1">↑ 5% improvement potential</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart for Skill Assessment */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Skill Assessment</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceData.current}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart for Performance Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData.historical}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                <YAxis domain={[70, 100]} tick={{ fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="performance"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Technical Skills Breakdown</h3>
        <div className="space-y-4">
          {skillsBreakdown.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">{skill.skill}</span>
                <span className="text-gray-600">{skill.level}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsPage;
