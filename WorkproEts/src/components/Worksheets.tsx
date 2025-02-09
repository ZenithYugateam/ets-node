import React from 'react';
import { format } from 'date-fns';
import { FileSpreadsheet } from 'lucide-react';

const worksheetData = [
  { date: new Date(), project: 'Project A', hours: 6, tasks: 'Frontend Development' },
  { date: new Date(), project: 'Project B', hours: 2, tasks: 'Code Review' },
  { date: new Date(Date.now() - 86400000), project: 'Project C', hours: 4, tasks: 'Testing' },
  { date: new Date(Date.now() - 86400000), project: 'Project A', hours: 4, tasks: 'Bug Fixes' },
];

export const Worksheets = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Recent Worksheets</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Project</th>
              <th className="px-4 py-2">Hours</th>
              <th className="px-4 py-2">Tasks</th>
            </tr>
          </thead>
          <tbody>
            {worksheetData.map((entry, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{format(entry.date, 'MMM dd, yyyy')}</td>
                <td className="px-4 py-2">{entry.project}</td>
                <td className="px-4 py-2">{entry.hours}</td>
                <td className="px-4 py-2">{entry.tasks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};