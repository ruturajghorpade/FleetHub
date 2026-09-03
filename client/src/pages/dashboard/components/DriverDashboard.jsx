// FleetHub – Driver Dashboard (Food Delivery Partner View)
// e.g. Rajesh Kumar — Delivery Partner on Ather 450X (EV Bike)
import { useState } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineMapPin,
  HiOutlineBuildingStorefront,
  HiOutlinePhone,
  HiOutlineCurrencyRupee,
  HiOutlineStar,
  HiOutlineArrowRight,
  HiOutlineClock,
} from 'react-icons/hi2';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { MOCK_DELIVERIES } from '@/data/mockData';

const DriverDashboard = () => {
  const { user } = useAuth();
  const driverName = user?.name || 'Rajesh Kumar';
  const assignedBike = user?.vehicle || 'KA01EF1010';
  const bikeModel = user?.vehicleModel || 'Ather 450X (EV Bike)';

  // Initial deliveries assigned to this driver
  const [deliveries, setDeliveries] = useState(() =>
    MOCK_DELIVERIES.map((d, index) => {
      // Make sure 1 delivery is active/assigned for immediate testing
      if (index === 0) {
        return {
          ...d,
          driver: driverName,
          vehicle: assignedBike,
          status: 'assigned',
        };
      }
      return d;
    }).filter((d) => d.driver === driverName || d.status === 'delivered')
  );

  const [notification, setNotification] = useState(null);

  // Status Progression Workflow
  const handleStatusChange = (deliveryId, newStatus) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d._id === deliveryId) {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          let note = '';
          if (newStatus === 'picked_up') note = 'Order hot-bagged & picked up from restaurant';
          if (newStatus === 'out_for_delivery') note = 'Partner is en route to customer destination';
          if (newStatus === 'delivered') note = 'Successfully delivered to customer';

          return {
            ...d,
            status: newStatus,
            timeline: [...d.timeline, { status: newStatus, time: timestamp, note }],
          };
        }
        return d;
      })
    );

    const statusLabels = {
      picked_up: 'PICKED UP',
      out_for_delivery: 'OUT FOR DELIVERY',
      delivered: 'DELIVERED',
    };

    setNotification({
      type: 'success',
      message: `Order status successfully updated to ${statusLabels[newStatus] || newStatus}!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const activeDeliveries = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'cancelled');
  const completedDeliveries = deliveries.filter((d) => d.status === 'delivered');

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div className="px-4 py-3 rounded-xl shadow-md border bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900 text-green-800 dark:text-green-200 text-sm font-medium flex items-center justify-between">
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-xs font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Driver Identity Card & Vehicle Badge */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-teal-600 rounded-xl p-5 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-2xs font-bold uppercase tracking-wider">
              Delivery Partner
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-bold">
              ★ 4.8 Rating
            </span>
          </div>
          <h1 className="text-xl font-bold">{driverName}</h1>
          <p className="text-xs text-primary-100 mt-0.5">
            Shift: Active & Available • Central Dispatch Hub
          </p>
        </div>

        {/* Assigned Vehicle Details */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2.5 text-right flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/20">
            <HiOutlineTruck className="w-5 h-5 text-teal-200" />
          </div>
          <div className="text-left">
            <p className="text-2xs uppercase tracking-wider text-teal-200 font-bold">
              Assigned Fleet Vehicle
            </p>
            <p className="text-sm font-mono font-bold">{assignedBike}</p>
            <p className="text-2xs text-primary-100">{bikeModel}</p>
          </div>
        </div>
      </div>

      {/* Partner KPIs */}
      <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
              <HiOutlineTruck className="w-5 h-5" />
            </div>
            <Badge variant="primary" size="sm">Active</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{activeDeliveries.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current Assigned Trips</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400">
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
            <Badge variant="success" size="sm">Done</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{completedDeliveries.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Today's Completed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <HiOutlineCurrencyRupee className="w-5 h-5" />
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
              ₹70/trip
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            ₹{completedDeliveries.length * 70 + 450}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Today's Payout</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <HiOutlineClock className="w-5 h-5" />
            </div>
            <Badge variant="info" size="sm">Avg Speed</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">21m</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Avg Delivery Time</p>
        </div>
      </section>

      {/* Active Assigned Deliveries (with Action Buttons) */}
      <Card padding="p-0" className="overflow-hidden border-2 border-primary-500 shadow-md">
        <div className="px-5 py-4 bg-primary-50 dark:bg-primary-950/30 border-b border-primary-200 dark:border-primary-900/40 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Your Current Assigned Deliveries
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pick up food promptly and advance status as you reach each step
            </p>
          </div>
          <Badge variant="primary" size="md">
            {activeDeliveries.length} Active Trip
          </Badge>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            <HiOutlineCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 dark:text-slate-200 text-base">
              No active delivery assignments
            </p>
            <p className="text-xs text-slate-400 mt-1">
              You are marked AVAILABLE. Dispatcher will ping you when a nearby order is assigned!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {activeDeliveries.map((delivery) => (
              <div key={delivery._id} className="p-5 space-y-4">
                {/* Header bar of delivery card */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                      {delivery.orderId}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                      {delivery.client}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={delivery.status} size="md" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Bill: ₹{delivery.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Pickup & Dropoff Routing Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs">
                  {/* Pickup */}
                  <div className="space-y-1">
                    <p className="text-2xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <HiOutlineBuildingStorefront className="w-3.5 h-3.5" />
                      1. Pickup Address (Restaurant)
                    </p>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {delivery.pickupLocation.name}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {delivery.pickupLocation.address}
                    </p>
                  </div>

                  {/* Dropoff */}
                  <div className="space-y-1">
                    <p className="text-2xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 flex items-center gap-1">
                      <HiOutlineMapPin className="w-3.5 h-3.5" />
                      2. Delivery Address (Customer)
                    </p>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {delivery.customerName} • {delivery.customerPhone}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {delivery.deliveryLocation.address}
                    </p>
                    {delivery.deliveryLocation.landmark && (
                      <p className="text-2xs text-slate-400 italic">
                        Landmark: {delivery.deliveryLocation.landmark}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Food Items: </span>
                  {delivery.items}
                </div>

                {/* Driver Action Progression Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {delivery.status === 'assigned' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        onClick={() => handleStatusChange(delivery._id, 'picked_up')}
                      >
                        ✓ Picked Up From Restaurant
                      </Button>
                    </>
                  )}

                  {delivery.status === 'picked_up' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                      onClick={() => handleStatusChange(delivery._id, 'out_for_delivery')}
                    >
                      🛵 Start Ride (Out For Delivery)
                    </Button>
                  )}

                  {delivery.status === 'out_for_delivery' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold"
                      onClick={() => handleStatusChange(delivery._id, 'delivered')}
                    >
                      🎉 Delivered To Customer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Completed Deliveries History */}
      <Card padding="p-0" className="overflow-hidden">
        <Card.Header className="px-5 pt-5 pb-3">
          <div>
            <Card.Title>Today's Completed Trips</Card.Title>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              History of orders delivered by you today
            </p>
          </div>
        </Card.Header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Order</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Restaurant</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Customer</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Completed Time</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {completedDeliveries.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3 font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                    {d.orderId}
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {d.client}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-300">
                    {d.customerName}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {d.deliveredDate || '21:42'}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-xs text-green-600 dark:text-green-400">
                    +₹70.00
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DriverDashboard;
