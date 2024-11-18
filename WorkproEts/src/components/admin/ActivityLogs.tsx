
import { useQuery } from 'react-query';
import { Clock, User } from 'lucide-react';
import { fetchActivityLogs } from '../../api/admin';
import { format } from 'date-fns';

const ActivityLogs = () => {  
  const { data: logs, isLoading } = useQuery('activityLogs', fetchActivityLogs);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Activity Logs</h2>
        <div className="space-y-4">
          {logs?.map((log) => (
            <div
              key={log._id}
              className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg"
            >
              <div
                className={`p-2 rounded-full ${
                  log.type === 'user'
                    ? 'bg-blue-100'
                    : log.type === 'task'
                    ? 'bg-purple-100'
                    : 'bg-green-100'
                }`}
              >
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{log.description}</p>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                  <span className="mx-2">•</span>
                  <span className="font-medium">{log.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;