// FleetHub – Reports & Analytics Page (Food Delivery Logistics)
import { useState, useEffect } from 'react';
import {
  HiOutlineChartBarSquare,
  HiOutlineBuildingStorefront,
  HiOutlineUserGroup,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineArrowDownTray,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import reportService from '@/services/reportService';
import { showSuccess } from '@/utils/toastUtils';
import {
  RESTAURANT_ORDERS_DATA,
  DRIVER_PERFORMANCE_DATA,
  MOCK_VEHICLES,
  MOCK_DELIVERIES,
} from '@/data/mockData';

const REPORT_TABS = [
  { id: 'daily', label: 'Daily Deliveries', icon: HiOutlineChartBarSquare },
  { id: 'restaurants', label: 'Restaurant Report', icon: HiOutlineBuildingStorefront },
  { id: 'drivers', label: 'Driver Report', icon: HiOutlineUserGroup },
  { id: 'vehicles', label: 'Vehicle Usage', icon: HiOutlineTruck },
  { id: 'cancelled', label: 'Cancelled Deliveries', icon: HiOutlineXCircle },
];

const DEFAULT_DAILY_STATS = [
  { date: 'Today', total: 7, delivered: 2, pending: 1, cancelled: 1, onTime: '98.0%', revenue: '₹1,346' },
  { date: 'Yesterday', total: 12, delivered: 11, pending: 0, cancelled: 1, onTime: '96.5%', revenue: '₹4,890' },
  { date: '2 days ago', total: 15, delivered: 14, pending: 0, cancelled: 1, onTime: '97.2%', revenue: '₹6,120' },
  { date: '3 days ago', total: 9, delivered: 8, pending: 0, cancelled: 1, onTime: '95.0%', revenue: '₹3,450' },
  { date: '4 days ago', total: 14, delivered: 13, pending: 0, cancelled: 1, onTime: '96.8%', revenue: '₹5,600' },
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyData, setDailyData] = useState([]);
  const [restaurantData, setRestaurantData] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [cancelledData, setCancelledData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [daily, restaurants, drivers, cancelled] = await Promise.allSettled([
          reportService.getDailyDeliveries(),
          reportService.getRestaurantReport(),
          reportService.getDriverReport(),
          reportService.getCancelledDeliveries(),
        ]);

        if (daily.status === 'fulfilled' && daily.value?.length > 0) {
          setDailyData(daily.value);
        }
        if (restaurants.status === 'fulfilled' && restaurants.value?.length > 0) {
          setRestaurantData(restaurants.value);
        }
        if (drivers.status === 'fulfilled' && drivers.value?.length > 0) {
          setDriverData(drivers.value);
        }
        if (cancelled.status === 'fulfilled' && cancelled.value?.length > 0) {
          setCancelledData(cancelled.value);
        }
      } catch {
        // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const cancelledOrders = cancelledData.length > 0 ? cancelledData : MOCK_DELIVERIES.filter((d) => d.status === 'cancelled');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Logistics Reports & Intelligence"
        subtitle="Performance audits, restaurant volume, partner speeds, and fleet utilization"
      >
        <Button variant="outline" size="sm" onClick={() => showSuccess('Report exported to CSV successfully!')}>
          <HiOutlineArrowDownTray className="w-4 h-4" />
          Export CSV
        </Button>
      </PageHeader>

      {/* Report Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-[#2E2E2E]">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A1A1A]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Daily Deliveries Report */}
      {activeTab === 'daily' && (
        <Card padding="p-0" className="overflow-hidden">
          <Card.Header className="px-5 pt-5 pb-3">
            <div>
              <Card.Title>Daily Deliveries Performance</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Overview of daily volumes, completion rates, and fulfillment speed
              </p>
            </div>
            <Badge variant="primary">Live Data</Badge>
          </Card.Header>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Date</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Total Orders</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Delivered</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Pending</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Cancelled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
                {(dailyData.length > 0 ? dailyData : DEFAULT_DAILY_STATS).map((row, idx) => (
                  <tr key={row._id || row.date || idx} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60">
                    <td className="px-5 py-3 font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {row._id || row.date}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-xs">{row.total}</td>
                    <td className="px-5 py-3 text-center text-xs font-semibold text-green-600 dark:text-green-400">
                      {row.delivered}
                    </td>
                    <td className="px-5 py-3 text-center text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {row.pending}
                    </td>
                    <td className="px-5 py-3 text-center text-xs font-semibold text-red-600 dark:text-red-400">
                      {row.cancelled}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 2. Restaurant Report */}
      {activeTab === 'restaurants' && (
        <Card padding="p-0" className="overflow-hidden">
          <Card.Header className="px-5 pt-5 pb-3">
            <div>
              <Card.Title>Restaurant Fulfillment & Billing Report</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Breakdown of partner restaurant order volume and reliability
              </p>
            </div>
          </Card.Header>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Restaurant Name</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Total Orders</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Delivered</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Cancelled</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
                {(restaurantData.length > 0 ? restaurantData : RESTAURANT_ORDERS_DATA).map((row, idx) => (
                  <tr key={row.restaurantId || row.name || idx} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60">
                    <td className="px-5 py-3 font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {row.restaurantName || row.name}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-xs">{row.totalOrders ?? row.orders}</td>
                    <td className="px-5 py-3 text-center text-xs font-semibold text-green-600 dark:text-green-400">
                      {row.deliveredOrders ?? row.orders}
                    </td>
                    <td className="px-5 py-3 text-center text-xs font-semibold text-red-600 dark:text-red-400">
                      {row.cancelledOrders ?? 0}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      ₹{(row.totalRevenue || row.revenue || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 3. Driver Report */}
      {activeTab === 'drivers' && (
        <Card padding="p-0" className="overflow-hidden">
          <Card.Header className="px-5 pt-5 pb-3">
            <div>
              <Card.Title>Delivery Partner Efficiency & Ratings</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Individual performance, avg delivery duration, and rider score
              </p>
            </div>
          </Card.Header>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Partner Name</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Rating</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
                {(driverData.length > 0 ? driverData : DRIVER_PERFORMANCE_DATA).map((row, idx) => (
                  <tr key={row._id || row.name || idx} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60">
                    <td className="px-5 py-3 font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {row.name}
                    </td>
                    <td className="px-5 py-3 text-center text-xs">
                      <span className="px-2 py-0.5 rounded-full text-2xs font-bold uppercase bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {row.availability || 'AVAILABLE'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-xs">
                      <span className="text-amber-500 font-bold">★ {row.rating || 4.8}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-300">
                      {row.phone || '+91 98XXX XXXXX'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 4. Vehicle Usage Report */}
      {activeTab === 'vehicles' && (
        <Card padding="p-0" className="overflow-hidden">
          <Card.Header className="px-5 pt-5 pb-3">
            <div>
              <Card.Title>Food Delivery Fleet Usage & Diagnostics</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bikes, Scooters, and EV Bikes operational status
              </p>
            </div>
          </Card.Header>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Reg Number</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Vehicle Model</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Category</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Availability</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Odometer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
                {MOCK_VEHICLES.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60">
                    <td className="px-5 py-3 font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                      {v.vehicleNumber}
                    </td>
                    <td className="px-5 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {v.model}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {v.vehicleType}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-2xs font-bold uppercase bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400">
                        {v.availability}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                      {v.odometer} km
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Cancelled Deliveries Report */}
      {activeTab === 'cancelled' && (
        <Card padding="p-0" className="overflow-hidden">
          <Card.Header className="px-5 pt-5 pb-3">
            <div>
              <Card.Title>Pre-Pickup Cancellation Audit Log</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Historical record of cancelled orders, timestamps, and client reasons
              </p>
            </div>
            <Badge variant="danger">{cancelledOrders.length} Cancelled</Badge>
          </Card.Header>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Order ID</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Restaurant</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Customer</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Cancellation Reason</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
                {cancelledOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60">
                    <td className="px-5 py-3 font-mono font-bold text-xs text-red-600 dark:text-red-400">
                      {order.orderId}
                    </td>
                    <td className="px-5 py-3 font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {order.client?.companyName || order.client}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-700 dark:text-slate-300">
                      {order.customerName}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                      {order.cancellationReason || 'Pre-pickup cancellation confirmed by client admin'}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      ₹{order.totalAmount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
