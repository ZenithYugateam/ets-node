import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Briefcase } from 'lucide-react';

const data = [
  { name: 'Project A', value: 25 },
  { name: 'Project B', value: 35 },
  { name: 'Project C', value: 20 },
  { name: 'Project D', value: 20 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const ProjectTimeLogs = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Project Time Distribution</h2>
      </div>
      <div className="w-full">
        <PieChart width={500} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};