import React from 'react';
import { Edit2, Eye } from 'lucide-react';
import Button from './Button';

interface Column {
  field: string;
  header: string;
  width?: string;
  render?: (value: any) => React.ReactNode;
}

interface DataGridProps {
  columns: Column[];
  data: any[];
  onEdit: (item: any) => void;
  onView: (item: any) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ columns, data, onEdit, onView }) => {
  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.field}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              <th scope="col" className="relative px-6 py-3 w-24">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td key={column.field} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? (
                      column.render(item[column.field])
                    ) : (
                      <span className="text-sm text-gray-900">{item[column.field]}</span>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <Button
                    variant="outline"
                    icon={Eye}
                    onClick={() => onView(item)}
                    className="mr-2"
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    icon={Edit2}
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataGrid;