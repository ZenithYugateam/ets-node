import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  ClipboardList, 
  UserCheck, 
  Calendar, 
  Award, 
  BookOpen, 
  Clock, 
  BriefcaseIcon, 
  Coffee 
} from 'lucide-react';

// Dummy employees data
const employees = [
  { 
    name: 'John Doe',
    rate: 92,
    trend: '+4%',
    status: 'Excellent',
    tasks: { completed: 45, total: 49 },
    streak: 12,
    awards: ['Fastest Completion', 'Top Performer'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
  },
  {
    name: 'Jane Smith',
    rate: 88,
    trend: '+2%',
    status: 'Good',
    tasks: { completed: 38, total: 43 },
    streak: 8,
    awards: ['Most Consistent'],
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
  },
  {
    name: 'Mike Johnson',
    rate: 85,
    trend: '-2%',
    status: 'Good',
    tasks: { completed: 34, total: 40 },
    streak: 5,
    awards: ['Most Improved'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces'
  },
  {
    name: 'Sarah Williams',
    rate: 95,
    trend: '+6%',
    status: 'Outstanding',
    tasks: { completed: 57, total: 60 },
    streak: 15,
    awards: ['Perfect Week', 'Quality Master'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
  },
  {
    name: 'Tom Brown',
    rate: 89,
    trend: '+1%',
    status: 'Good',
    tasks: { completed: 40, total: 45 },
    streak: 7,
    awards: ['Team Player'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
  },
];

// Define the menu items along with their icons and styling
const menuItems = [
  { icon: ClipboardList, label: 'Worksheets', color: 'from-blue-400 to-blue-600', glow: '#60A5FA' },
  { icon: UserCheck, label: 'Attendance', color: 'from-green-400 to-green-600', glow: '#4ADE80' },
  { icon: Calendar, label: 'Leave Tracker', color: 'from-purple-400 to-purple-600', glow: '#A78BFA' },
  { icon: Award, label: 'Performance', color: 'from-yellow-400 to-yellow-600', glow: '#FBBF24' },
  { icon: BookOpen, label: 'Training', color: 'from-red-400 to-red-600', glow: '#F87171' },
  { icon: Clock, label: 'Over view', color: 'from-indigo-400 to-indigo-600', glow: '#818CF8' },
  { icon: BriefcaseIcon, label: 'Projects', color: 'from-pink-400 to-pink-600', glow: '#F472B6' },
  { icon: Coffee, label: 'Breaks', color: 'from-orange-400 to-orange-600', glow: '#FB923C' },
];

interface SemiCircleMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  employee: typeof employees[0];
}

function SemiCircleMenu({ isOpen, onClose, position, employee }: SemiCircleMenuProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isOpen) return null;

  // Mapping of menu item labels to routes (update paths as needed)
  const routeMap: { [key: string]: string } = {
    'Worksheets': '/worksheets',
    'Attendance': '/attendance-view',
    'Projects': '/project-time-logs',
    'Leave Tracker': '/leave-tracker',
    'Performance': '/performance-metrics',
    'Over view': '/overview',
    'Breaks': '/break-time-analysis',
    // Training and Projects can be added later when pages are available
  };

  const handleItemClick = (label: string) => {
    if (routeMap[label]) {
      navigate(routeMap[label]);
    } else {
      console.log(`Clicked ${label} for ${employee.name}`);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center transition-all duration-500"
      onClick={onClose}
    >
      <div 
        className="absolute"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="relative">
          {/* Center circle with employee info */}
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white rounded-full shadow-xl flex items-center justify-center z-20 overflow-hidden border-4 border-white">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/20 backdrop-blur-sm z-10" />
              <img 
                src={employee.avatar} 
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-20 text-center p-3">
              <div className="text-sm font-semibold text-gray-900 truncate max-w-[90px]">
                {hoveredItem ? hoveredItem : employee.name}
              </div>
              <div className="text-xs font-medium text-gray-600 mt-0.5">
                {hoveredItem ? 'Click to view' : employee.status}
              </div>
              {!hoveredItem && (
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {employee.tasks.completed}/{employee.tasks.total} tasks
                </div>
              )}
            </div>
          </div>

          {/* Menu items in a semi-circle */}
          <div className="relative" style={{ width: '450px', height: '225px' }}>
            {menuItems.map((item, index) => {
              const totalItems = menuItems.length - 1;
              const angle = (Math.PI / totalItems) * index;
              const radius = 180;
              const x = Math.cos(angle) * radius;
              const y = -Math.sin(angle) * radius;
              const isHovered = hoveredItem === item.label;

              return (
                <button
                  key={item.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item.label);
                  }}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    absolute transform -translate-x-1/2 -translate-y-1/2
                    transition-all duration-300 ease-out
                    ${isHovered ? 'z-20' : 'z-10'}
                  `}
                  style={{
                    left: x,
                    top: y,
                  }}
                >
                  <div className="relative group">
                    {/* Laser beam effect on hover */}
                    {isHovered && (
                      <>
                        <div
                          className="absolute w-px pointer-events-none"
                          style={{
                            background: `linear-gradient(to bottom, transparent, ${item.glow})`,
                            height: '150px',
                            left: '50%',
                            top: '-150px',
                            transform: 'translateX(-50%)',
                            filter: 'blur(1px)',
                            opacity: 0.7,
                          }}
                        />
                        <div
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: '80px',
                            height: '80px',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: `radial-gradient(circle, ${item.glow}33 0%, transparent 70%)`,
                            filter: 'blur(8px)',
                          }}
                        />
                      </>
                    )}

                    {/* Icon container */}
                    <div className={`
                      bg-gradient-to-br ${item.color}
                      p-3.5 rounded-xl shadow-lg
                      transform transition-all duration-300
                      ${isHovered ? 'scale-110 ring-4 ring-white/30' : 'scale-100'}
                      relative overflow-hidden
                    `}>
                      {/* Shimmer effect */}
                      <div
                        className={`
                          absolute inset-0 opacity-0 group-hover:opacity-100
                          transition-opacity duration-300
                        `}
                        style={{
                          background: `linear-gradient(45deg, transparent 0%, ${item.glow}33 50%, transparent 100%)`,
                          animation: isHovered ? 'shimmer 1.5s infinite' : 'none',
                        }}
                      />
                      <item.icon className={`
                        h-5 w-5 text-white transform transition-transform duration-300 relative z-10
                        ${isHovered ? 'scale-110' : 'scale-100'}
                      `} />
                    </div>

                    {/* Label with employee-specific info */}
                    <div className={`
                      absolute top-full left-1/2 -translate-x-1/2 mt-2
                      transition-all duration-300 pointer-events-none
                      ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
                    `}>
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/50">
                        <div className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {(() => {
                            switch (item.label) {
                              case 'Performance':
                                return `${employee.rate}% completion rate`;
                              case 'Worksheets':
                                return `${employee.tasks.completed} tasks completed`;
                              case 'Attendance':
                                return `${employee.streak} day streak`;
                              case 'Leave Tracker':
                                return 'View leave balance';
                              case 'Training':
                                return 'View training progress';
                              case 'Time Logs':
                                return 'Check time records';
                              case 'Projects':
                                return 'View assigned projects';
                              case 'Breaks':
                                return 'Break time analysis';
                              default:
                                return `View ${employee.name}'s ${item.label.toLowerCase()}`;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeCard({ employee }: { employee: typeof employees[0] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Outstanding': return 'bg-purple-100 text-purple-700';
      case 'Excellent': return 'bg-blue-100 text-blue-700';
      case 'Good': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTrendColor = (trend: string) => {
    return trend.startsWith('+') ? 'text-green-500' : 'text-red-500';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setMenuOpen(true);
  };

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start space-x-4">
          <img
            src={employee.avatar}
            alt={employee.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
              <span className={`text-sm font-medium ${getTrendColor(employee.trend)}`}>
                {employee.trend}
              </span>
            </div>
            
            <div className="mt-2 flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                {employee.status}
              </span>
              <span className="text-sm text-gray-500">
                {employee.tasks.completed}/{employee.tasks.total} tasks
              </span>
            </div>

            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      Completion Rate
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {employee.rate}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-blue-50">
                  <div
                    style={{ width: `${employee.rate}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center text-amber-500">
                <Trophy className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">{employee.streak} day streak</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {employee.awards.map((award, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {award}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SemiCircleMenu 
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        position={menuPosition}
        employee={employee}
      />
    </>
  );
}

function PerformanceDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Employee Performance Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">Click on an employee card to view detailed metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="text-sm border-gray-200 rounded-md">
                <option>Completion Rate</option>
                <option>Name</option>
                <option>Status</option>
                <option>Trend</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employees.map((employee) => (
              <EmployeeCard key={employee.name} employee={employee} />
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Above Target</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">On Target</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Below Target</span>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Full Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceDashboard;
