// FleetHub – Reports & Analytics Page (Food Delivery Logistics)
import { useState } from 'react';
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

const DAILY_STATS = [
  { date: '2026-09-03 (Today)', total: 142, delivered: 108, pending: 18, cancelled: 7, onTime: '96.4%', revenue: '₹1,84,500' },
  { date: '2026-09-02', total: 138, delivered: 126, pending: 4, cancelled: 8, onTime: '95.8%', revenue: '₹1,76,200' },
  { date: '2026-09-01', total: 154, delivered: 142, pending: 2, cancelled: 10, onTime: '97.1%', revenue: '₹1,98,400' },
  { date: '2026-08-31', total: 129, delivered: 119, pending: 3, cancelled: 7, onTime: '94.9%', revenue: '₹1,62,000' },
  { date: '2026-08-30', total: 165, delivered: 152, pending: 5, cancelled: 8, onTime: '96.8%', revenue: '₹2,12,300' },
  { date: '2026-08-29', total: 148, delivered: 139, pending: 2, cancelled: 7, onTime: '95.5%', revenue: '₹1,89,100' },
  { date: '2026-08-28', total: 132, delivered: 124, pending: 2, cancelled: 6, onTime: '96.2%', revenue: '₹1,69,800' },
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const cancelledOrders = MOCK_DELIVERIES.filter((d) => d.status === 'cancelled');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Logistics Reports & Intelligence"
        subtitle="Performance audits, restaurant volume, partner speeds, and fleet utilization"
      >
        <Button variant="outline" size="sm" onClick={() => alert('Report exported successfully!')}>
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
              <Card.Title>Daily Deliveries Performance (Last 7 Days)</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Overview of daily volumes, completion rates, and fulfillment speed
              </p>
            </div>
            <Badge variant="primary">Weekly Trend</Badge>
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
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">On-Time %</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
                {DAILY_STATS.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60">
                    <td className="px-5 py-3 font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {row.date}
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
                    <td className="px-5 py-3 text-center text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 font-bold">
                        {row.onTime}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {row.revenue}
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
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Today Orders</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">On-Time SLA</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Billed Amount</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
                {RESTAURANT_ORDERS_DATA.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60">
                    <td className="px-5 py-3 font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {row.name}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-xs">{row.orders}</td>
                    <td className="px-5 py-3 text-center text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 font-bold">
                        {row.onTime}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      ₹{row.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant="success" size="sm">Active Partner</Badge>
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
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Completed Deliveries</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Avg Trip Time</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Rating</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Today Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
                {DRIVER_PERFORMANCE_DATA.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60">
                    <td className="px-5 py-3 font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {row.name}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-xs">{row.completed}</td>
                    <td className="px-5 py-3 text-center font-mono text-xs text-slate-600 dark:text-slate-300">
                      {row.avgTime}
                    </td>
                    <td className="px-5 py-3 text-center text-xs">
                      <span className="text-amber-500 font-bold">★ {row.rating}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-bold text-green-600 dark:text-green-400">
                      {row.earnings}
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
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Power / Battery</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Odometer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
                {MOCK_VEHICLES.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60">
                    <td className="px-5 py-3 font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                      {v.vehicleNumber}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-800 dark:text-slate-200">
                      {v.brand} {v.model}
                    </td>
                    <td className="px-5 py-3 text-2xs font-semibold text-slate-600 dark:text-slate-400">
                      {v.vehicleType}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-2xs font-bold ${
                          v.availability === 'AVAILABLE'
                            ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300'
                            : v.availability === 'ON_DELIVERY'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {v.availability}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-xs">
                      {v.fuelType === 'electric' ? (
                        <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                          ⚡ {v.batteryLevel}%
                        </span>
                      ) : (
                        <span className="text-slate-500">Petrol</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                      {v.mileage.toLocaleString()} km
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
              <Card.Title>Cancelled Deliveries Log</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit log of all pre-pickup cancellations, reasons, and release verification
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
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Cancelled By</th>
                  <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
                {cancelledOrders.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60">
                    <td className="px-5 py-3 font-mono font-bold text-xs text-red-600 dark:text-red-400">
                      {row.orderId}
                    </td>
                    <td className="px-5 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {row.client}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-300">
                      {row.customerName}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-700 dark:text-slate-300 italic">
                      "{row.cancellationReason || 'Pre-pickup cancellation'}"
                    </td>
                    <td className="px-5 py-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {row.cancelledBy || 'Client Store'}
                    </td>
                    <td className="px-5 py-3 text-right text-xs font-mono text-slate-500">
                      {row.cancelledAt || '21:05'}
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
