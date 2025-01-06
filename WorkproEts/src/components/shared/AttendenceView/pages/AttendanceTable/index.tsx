import React from 'react';
import { Employee } from '../types';
import { TableHeader } from './TableHeader';
import { AttendanceRow } from './AttendanceRow';
import {Badge} from '../ui/Badge';

interface AttendanceTableProps {
  title: string;
  data: Employee[];
}

export default function AttendanceTable({ title, data }: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredData = data.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <TableHeader
        title={title}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {person.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{person.name}</div>
                      <div className="text-xs text-gray-500">{person.role}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{person.checkIn}</div>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{person.checkOut}</div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <Badge variant="success">Present</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}