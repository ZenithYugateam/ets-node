import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

const tasks = [
  { id: 1, title: 'Complete project documentation', deadline: '2h', status: 'in-progress' },
  { id: 2, title: 'Review pull requests', deadline: '4h', status: 'in-progress' },
  { id: 3, title: 'Update weekly report', deadline: 'Tomorrow', status: 'pending' },
  { id: 4, title: 'Team meeting preparation', deadline: '3h', status: 'in-progress' },
];

const TaskList = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Current Tasks</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between">
            <div className="flex items-center">
              {task.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <span className="ml-3 text-sm text-gray-900">{task.title}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {task.deadline}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;