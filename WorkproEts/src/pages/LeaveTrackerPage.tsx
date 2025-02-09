import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calendar } from 'lucide-react';

const data = [
  { month: 'Jan', sick: 2, vacation: 0, personal: 1 },
  { month: 'Feb', sick: 1, vacation: 3, personal: 0 },
  { month: 'Mar', sick: 0, vacation: 5, personal: 1 },
  { month: 'Apr', sick: 1, vacation: 0, personal: 2 },
  { month: 'May', sick: 3, vacation: 0, personal: 1 },
];

const LeaveTrackerPage = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Leave Tracker</h2>
      </div>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="sick"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
            />
            <Area
              type="monotone"
              dataKey="vacation"
              stackId="1"
              stroke="#82ca9d"
              fill="#82ca9d"
            />
            <Area
              type="monotone"
              dataKey="personal"
              stackId="1"
              stroke="#ffc658"
              fill="#ffc658"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LeaveTrackerPage;
