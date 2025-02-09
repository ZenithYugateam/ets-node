import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Target } from 'lucide-react';

const data = [
  { subject: 'Productivity', A: 120, fullMark: 150 },
  { subject: 'Quality', A: 98, fullMark: 150 },
  { subject: 'Timeliness', A: 86, fullMark: 150 },
  { subject: 'Communication', A: 99, fullMark: 150 },
  { subject: 'Initiative', A: 85, fullMark: 150 },
  { subject: 'Teamwork', A: 65, fullMark: 150 },
];

export const PerformanceMetrics = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Target className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Performance Metrics</h2>
      </div>
      <div className="w-full">
        <RadarChart outerRadius={90} width={500} height={300} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 150]} />
          <Radar name="Employee" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </div>
    </div>
  );
};