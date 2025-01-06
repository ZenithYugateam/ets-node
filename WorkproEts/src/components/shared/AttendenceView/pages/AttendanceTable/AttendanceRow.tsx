import { Employee } from '../types';
import { Badge } from '../ui/Badge';

interface AttendanceRowProps {
  employee: Employee;
}

export function AttendanceRow({ employee }: AttendanceRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {employee.name.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
            <div className="text-xs text-gray-500">{employee.role}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">{employee.checkIn}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">{employee.checkOut}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="success">Present</Badge>
      </td>
    </tr>
  );
}