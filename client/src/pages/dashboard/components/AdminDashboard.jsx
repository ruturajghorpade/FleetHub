// FleetHub – Super Admin Dashboard (Food Delivery Logistics HQ)
import { useState, useEffect } from 'react';
import {
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUserGroup,
  HiOutlineTruck,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import RevenueChart from './RevenueChart';
import FleetOverview from './FleetOverview';
import RecentDeliveries from './RecentDeliveries';
import dashboardService from '@/services/dashboardService';
import {
  DASHBOARD_STATS,
  RESTAURANT_ORDERS_DATA,
  DRIVER_PERFORMANCE_DATA,
} from '@/data/mockData';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch {
        // Fallback to default stats if offline
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const kpiData = stats?.kpis || DASHBOARD_STATS;

  const kpis = [
    {
      id: 'today-orders',
      label: "Today's Orders",
      value: kpiData.todayOrders ?? DASHBOARD_STATS.todayOrders,
      icon: HiOutlineShoppingBag,
      change: '+14% vs avg',
      isUp: true,
    },
    {
      id: 'pending-orders',
      label: 'Pending Orders',
      value: kpiData.pendingOrders ?? DASHBOARD_STATS.pendingOrders,
      icon: HiOutlineClock,
      change: 'Awaiting dispatch',
      isUp: false,
    },
    {
      id: 'completed-orders',
      label: 'Completed Orders',
      value: kpiData.completedOrders ?? DASHBOARD_STATS.completedOrders,
      icon: HiOutlineCheckCircle,
      change: `${kpiData.onTimeDeliveryRate || '98%'} on-time`,
      isUp: true,
    },
    {
      id: 'cancelled-orders',
      label: 'Cancelled Orders',
      value: kpiData.cancelledOrders ?? DASHBOARD_STATS.cancelledOrders,
      icon: HiOutlineXCircle,
      change: 'Pre-pickup',
      isUp: false,
    },
    {
      id: 'available-drivers',
      label: 'Available Drivers',
      value: kpiData.availableDrivers ?? DASHBOARD_STATS.availableDrivers,
      icon: HiOutlineUserGroup,
      change: 'Ready for orders',
      isUp: true,
    },
    {
      id: 'busy-drivers',
      label: 'Active Deliveries',
      value: kpiData.activeDeliveries ?? DASHBOARD_STATS.busyDrivers,
      icon: HiOutlineArrowTrendingUp,
      change: 'On delivery route',
      isUp: true,
    },
    {
      id: 'available-bikes',
      label: 'Available Vehicles',
      value: kpiData.availableVehicles ?? DASHBOARD_STATS.availableVehicles,
      icon: HiOutlineTruck,
      change: 'Bikes & EV Bikes',
      isUp: true,
    },
    {
      id: 'maintenance-alerts',
      label: 'Maintenance Alerts',
      value: kpiData.maintenanceAlerts ?? 1,
      icon: HiOutlineTruck,
      change: 'Fleet Service',
      isUp: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-neutral-200 dark:border-[#2E2E2E] p-4 relative overflow-hidden group hover:border-amber-500/50 transition-all duration-200"
            >
              {/* Subtle amber accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500/80" />

              <div className="flex items-start justify-between mb-2.5">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1A1A1A] text-slate-600 dark:text-[#A3A3A3] border border-slate-200 dark:border-[#2E2E2E]">
                  {kpi.change}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#FAFAFA] mb-0.5">
                {kpi.value}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-[#A3A3A3]">
                {kpi.label}
              </p>
            </div>
          );
        })}
      </section>

      {/* Charts & Analytics Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <FleetOverview />
        </div>
      </section>

      {/* Restaurant Wise Deliveries & Driver Performance */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurant Wise Deliveries */}
        <Card padding="p-0" className="overflow-hidden">
          <Card.Header className="px-5 pt-5 pb-3">
            <div>
              <Card.Title>Restaurant Wise Deliveries</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Client order distribution and fulfillment</p>
            </div>
            <Badge variant="primary" size="sm">
              Today
            </Badge>
          </Card.Header>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-y border-[#E5E5E5] dark:border-[#2E2E2E] bg-[#F5F5F5] dark:bg-[#1A1A1A]">
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 dark:text-[#A3A3A3]">Restaurant</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 dark:text-[#A3A3A3] text-center">Orders</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 dark:text-[#A3A3A3] text-right">Revenue</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 dark:text-[#A3A3A3] text-center">On-Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#2E2E2E] bg-white dark:bg-[#111111]">
                {RESTAURANT_ORDERS_DATA.map((rest) => (
                  <tr key={rest.name} className="hover:bg-[#FFFBEB] dark:hover:bg-[#1A1A1A] transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {rest.name}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-slate-900 dark:text-[#FAFAFA]">
                      {rest.orders}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      ₹{rest.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-500/20">
                        {rest.onTime}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Driver Performance */}
        <Card padding="p-0" className="overflow-hidden">
          <Card.Header className="px-5 pt-5 pb-3">
            <div>
              <Card.Title>Top Driver Performance</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top delivery partners by completed orders & speed</p>
            </div>
            <Badge variant="success" size="sm">
              Live Ranking
            </Badge>
          </Card.Header>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-y border-[#E5E5E5] dark:border-[#2E2E2E] bg-[#F5F5F5] dark:bg-[#1A1A1A]">
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 dark:text-[#A3A3A3]">Partner</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 dark:text-[#A3A3A3] text-center">Delivered</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 dark:text-[#A3A3A3] text-center">Avg Time</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 dark:text-[#A3A3A3] text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#2E2E2E] bg-white dark:bg-[#111111]">
                {DRIVER_PERFORMANCE_DATA.map((driver) => (
                  <tr key={driver.name} className="hover:bg-[#FFFBEB] dark:hover:bg-[#1A1A1A] transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {driver.name}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-slate-900 dark:text-[#FAFAFA]">
                      {driver.completed}
                    </td>
                    <td className="px-5 py-3 text-center text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {driver.avgTime}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                        ★ {driver.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Live Recent Deliveries */}
      <RecentDeliveries deliveries={stats?.recentDeliveries} />
    </div>
  );
};

export default AdminDashboard;
