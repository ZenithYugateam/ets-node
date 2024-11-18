import { Users, CheckCircle2, AlertCircle } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Wilson',
    role: 'Frontend Developer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    tasks: { completed: 12, pending: 3 }
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Backend Developer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    tasks: { completed: 15, pending: 2 }
  },
  {
    id: 3,
    name: 'Emma Garcia',
    role: 'UI Designer',
    status: 'away',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    tasks: { completed: 8, pending: 4 }
  }
];

const TeamOverview = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Team Overview</h2>
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-start space-x-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.name}
                </p>
                <p className="text-sm text-gray-500 truncate">{member.role}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {member.tasks.completed}
                  </div>
                  <div className="flex items-center text-sm text-orange-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {member.tasks.pending}
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {member.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamOverview;