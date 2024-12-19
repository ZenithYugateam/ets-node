import { Users, UserCog, Building2, GraduationCap, CalendarClock } from 'lucide-react';
import { MetricData } from '../../types/metrics';

export const metricsData: MetricData[] = [
  {
    title: 'Employees',
    count: 248,
    icon: Users,
    gradient: 'hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50',
  },
  {
    title: 'Managers',
    count: 12,
    icon: UserCog,
    gradient: 'hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50',
  },
  {
    title: 'Clients',
    count: 64,
    icon: Building2,
    gradient: 'hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50',
  },
  {
    title: 'Students',
    count: 35,
    icon: GraduationCap,
    gradient: 'hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50',
  },
  {
    title: 'Leave Requests',
    count: 8,
    icon: CalendarClock,
    gradient: 'hover:bg-gradient-to-br hover:from-red-50 hover:to-rose-50',
  },
];