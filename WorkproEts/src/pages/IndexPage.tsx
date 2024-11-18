import { Link } from 'react-router-dom';
import { 
  Users, 
  ClipboardList, 
  Settings, 
  Clock,
  TrendingUp,
  Calendar,
  MessageSquare
} from 'lucide-react';

const IndexPage = () => {
  const stats = [
    { label: 'Total Employees', value: '156', change: '+12%', trend: 'up' },
    { label: 'Active Projects', value: '23', change: '+5%', trend: 'up' },
    { label: 'Tasks Completed', value: '1,429', change: '+18%', trend: 'up' },
    { label: 'Avg. Attendance', value: '94%', change: '+2%', trend: 'up' },
  ];

  const quickLinks = [
    { to: '/employee', icon: Users, label: 'Employee Dashboard', color: 'bg-blue-500' },
    { to: '/manager', icon: ClipboardList, label: 'Manager Dashboard', color: 'bg-purple-500' },
    { to: '/admin', icon: Settings, label: 'Admin Dashboard', color: 'bg-green-500' },
    { to: '/timesheets', icon: Clock, label: 'Timesheets', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, John</h1>
        <div className="flex space-x-4">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <span>Schedule</span>
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700">
            <MessageSquare className="h-5 w-5 mr-2" />
            <span>Messages</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex items-center text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-4 w-4 mr-1" />
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${link.color}`}>
                <link.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{link.label}</h3>
                <p className="mt-1 text-sm text-gray-500">View dashboard</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <p className="ml-4 text-sm text-gray-600">New task assigned to Development team</p>
                <span className="ml-auto text-sm text-gray-400">2h ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="ml-4 text-sm text-gray-600">Project milestone due</p>
                <span className="ml-auto text-sm text-gray-400">Tomorrow</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;