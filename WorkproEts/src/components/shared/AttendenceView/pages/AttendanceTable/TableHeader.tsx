import { Clock } from 'lucide-react';
import { SearchInput } from '../ui/SearchInput';

interface TableHeaderProps {
  title: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function TableHeader({ title, searchTerm, onSearchChange }: TableHeaderProps) {
  return (
    <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full sm:w-64"
        />
      </div>
    </div>
  );
}