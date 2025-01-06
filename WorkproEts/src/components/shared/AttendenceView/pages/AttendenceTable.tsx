import React from 'react';
import { Employee } from '../pages/types';
import { Clock, Search } from 'lucide-react';

interface AttendanceTableProps {
  title: string;
  data: Employee[];
}

export default function AttendanceTable({ title, data }: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredData = data.filter((person) =>
    person.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatToIST = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const calculateDuration = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 'N/A';

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return 'Invalid Time';
    }

    const durationMs = checkOutDate.getTime() - checkInDate.getTime();

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const calculateBreakDuration = (breaks: Array<{ start: string; end: string }>) => {
    if (!breaks || breaks.length === 0) return 0;

    return breaks.reduce((total, current) => {
      const start = new Date(current.start).getTime();
      const end = new Date(current.end).getTime();
      if (!isNaN(start) && !isNaN(end)) {
        return total + (end - start);
      }
      return total;
    }, 0);
  };

  const formatBreakDuration = (breakDurationMs: number) => {
    const hours = Math.floor(breakDurationMs / (1000 * 60 * 60));
    const minutes = Math.floor((breakDurationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table
          className="min-w-full divide-y divide-gray-200 text-sm sm:text-base"
          role="table"
          aria-label={`${title} Table`}
        >
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In (IST)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out (IST)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Break Duration
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No data found.
                </td>
              </tr>
            ) : (
              filteredData.map((person) => {
                const breakDurationMs = calculateBreakDuration(person.breaks);
                const breakDurationFormatted = formatBreakDuration(breakDurationMs);
                const isExcessiveBreak = breakDurationMs > 3600000; // 1 hour in milliseconds
                return (
                  <tr
                    key={person.id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      isExcessiveBreak ? 'bg-red-100 animate-pulse' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{person.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatToIST(person.checkIn)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatToIST(person.checkOut)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {calculateDuration(person.checkIn, person.checkOut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isExcessiveBreak ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {breakDurationFormatted}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
