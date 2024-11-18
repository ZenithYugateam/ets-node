import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const timesheets = [
  {
    id: 1,
    employee: {
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    week: 'Mar 11 - Mar 17, 2024',
    totalHours: 38,
    status: 'pending'
  },
  {
    id: 2,
    employee: {
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    week: 'Mar 11 - Mar 17, 2024',
    totalHours: 40,
    status: 'approved'
  }
];

const TimesheetApprovals = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Timesheet Approvals
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timesheets.map((timesheet) => (
                <tr key={timesheet.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={timesheet.employee.avatar}
                        alt={timesheet.employee.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {timesheet.employee.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{timesheet.week}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {timesheet.totalHours} Date
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        timesheet.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : timesheet.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {timesheet.status === 'approved' && (
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                      )}
                      {timesheet.status === 'rejected' && (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      {timesheet.status === 'pending' && (
                        <Clock className="h-4 w-4 mr-1" />
                      )}
                      {timesheet.status.charAt(0).toUpperCase() +
                        timesheet.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timesheet.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                          Approve
                        </button>
                        <button className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                          Reject
                        </button>
                      </div>
                    )}
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

export default TimesheetApprovals;