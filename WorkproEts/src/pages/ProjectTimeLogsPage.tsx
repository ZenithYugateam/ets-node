import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Briefcase, Clock, Target, TrendingUp } from 'lucide-react';

const projectData = [
  { name: 'Project A', hours: 45, tasks: 15, completion: 75 },
  { name: 'Project B', hours: 35, tasks: 12, completion: 60 },
  { name: 'Project C', hours: 25, tasks: 8, completion: 40 },
  { name: 'Project D', hours: 15, tasks: 5, completion: 25 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#6366F1'];

const calculateProjectMetrics = () => {
  const totalHours = projectData.reduce((acc, curr) => acc + curr.hours, 0);
  const totalTasks = projectData.reduce((acc, curr) => acc + curr.tasks, 0);
  const averageCompletion =
    projectData.reduce((acc, curr) => acc + curr.completion, 0) /
    projectData.length;

  return { totalHours, totalTasks, averageCompletion };
};

const ProjectTimeLogsPage = () => {
  const metrics = calculateProjectMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Project Time Analysis</h2>
        <div className="flex items-center gap-2">
          <Briefcase className="text-blue-600 w-6 h-6" />
          <span className="text-gray-600">Active Projects: {projectData.length}</span>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Total Hours Logged</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalHours} hours</p>
          <p className="text-sm text-gray-500 mt-1">across all projects</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-indigo-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Total Tasks</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalTasks}</p>
          <p className="text-sm text-gray-500 mt-1">in progress</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-600 w-5 h-5" />
            <h3 className="text-sm font-medium text-gray-600">Average Completion</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.averageCompletion.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">across projects</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Time Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="hours"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Project Completion Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion" name="Completion %" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project Details Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Project Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectData.map((project, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.hours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.tasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.completion}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.completion >= 75
                          ? 'bg-green-100 text-green-800'
                          : project.completion >= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {project.completion >= 75
                        ? 'On Track'
                        : project.completion >= 50
                        ? 'In Progress'
                        : 'Behind Schedule'}
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

export default ProjectTimeLogsPage;
