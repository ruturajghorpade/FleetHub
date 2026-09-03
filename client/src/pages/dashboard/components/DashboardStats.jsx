// FleetHub – Dashboard Stats Component (Enterprise KPI Cards)
import {
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineWrenchScrewdriver,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
} from 'react-icons/hi2';
import { DASHBOARD_STATS } from '@/data/mockData';

const stats = [
  {
    id: 'total-vehicles',
    label: 'Total Vehicles',
    value: DASHBOARD_STATS.totalVehicles,
    icon: HiOutlineTruck,
    change: '+3 this month',
    trend: 'up',
    iconBg: 'bg-primary-50 dark:bg-primary-950/40',
    iconColor: 'text-primary-600 dark:text-primary-400',
  },
  {
    id: 'active-vehicles',
    label: 'Active Vehicles',
    value: DASHBOARD_STATS.activeVehicles,
    icon: HiOutlineTruck,
    change: '+5 vs last week',
    trend: 'up',
    iconBg: 'bg-green-50 dark:bg-green-950/40',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'total-drivers',
    label: 'Total Drivers',
    value: DASHBOARD_STATS.totalDrivers,
    icon: HiOutlineUserGroup,
    change: '+2 onboarded',
    trend: 'up',
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'active-drivers',
    label: 'Active Drivers',
    value: DASHBOARD_STATS.activeDrivers,
    icon: HiOutlineUserGroup,
    change: '-1 on leave',
    trend: 'down',
    iconBg: 'bg-teal-50 dark:bg-teal-950/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'todays-deliveries',
    label: "Today's Deliveries",
    value: DASHBOARD_STATS.todaysDeliveries,
    icon: HiOutlineCube,
    change: '+12% vs avg',
    trend: 'up',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'completed-deliveries',
    label: 'Completed Deliveries',
    value: DASHBOARD_STATS.completedDeliveries,
    icon: HiOutlineCube,
    change: '+8 delivered',
    trend: 'up',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'pending-deliveries',
    label: 'Pending Deliveries',
    value: DASHBOARD_STATS.pendingDeliveries,
    icon: HiOutlineCube,
    change: '-3 backlog',
    trend: 'down',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'maintenance-due',
    label: 'Maintenance Due',
    value: DASHBOARD_STATS.maintenanceDue,
    icon: HiOutlineWrenchScrewdriver,
    change: '+1 requires check',
    trend: 'down',
    iconBg: 'bg-red-50 dark:bg-red-950/40',
    iconColor: 'text-red-600 dark:text-red-400',
  },
];

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? HiOutlineArrowTrendingUp : HiOutlineArrowTrendingDown;
        const isPositive = stat.trend === 'up';

        return (
          <div
            key={stat.id}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 p-4 sm:p-5 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${stat.iconBg} transition-transform duration-200 group-hover:scale-105`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold ${
                  isPositive
                    ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10'
                    : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <TrendIcon className="w-3 h-3" />
                <span>{stat.change}</span>
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-0.5">
              {stat.value.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
