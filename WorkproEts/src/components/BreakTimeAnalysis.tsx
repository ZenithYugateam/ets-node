import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Clock } from 'lucide-react';

const data = [
  { name: 'Monday', scheduled: 60, actual: 75 },
  { name: 'Tuesday', scheduled: 60, actual: 55 },
  { name: 'Wednesday', scheduled: 60, actual: 65 },
  { name: 'Thursday', scheduled: 60, actual: 58 },
  { name: 'Friday', scheduled: 60, actual: 70 },
];

export const BreakTimeAnalysis = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Break Time Analysis</h2>
      </div>
      <div className="w-full">
        <BarChart width={500} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="scheduled" fill="#8884d8" name="Scheduled Break" />
          <Bar dataKey="actual" fill="#82ca9d" name="Actual Break" />
        </BarChart>
      </div>
    </div>
  );
};