// FleetHub – Client Dashboard (Restaurant / Store Admin View)
// e.g. Domino's Pizza Store Manager — Only sees own restaurant deliveries.
import { useState } from 'react';
import {
  HiOutlinePlus,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTruck,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineEye,
  HiOutlineNoSymbol,
} from 'react-icons/hi2';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { MOCK_DELIVERIES } from '@/data/mockData';

const ClientDashboard = () => {
  const { user } = useAuth();
  const clientName = user?.client?.name || "Domino's Pizza";

  // Filter deliveries so Client ONLY sees their own deliveries!
  const [deliveries, setDeliveries] = useState(() =>
    MOCK_DELIVERIES.filter((d) => d.client.toLowerCase().includes('domino'))
  );

  const [notification, setNotification] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Create Request Form State
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    items: '',
    totalAmount: '',
  });

  // Derived KPIs
  const todayTotal = deliveries.length;
  const pendingCount = deliveries.filter((d) => d.status === 'pending').length;
  const deliveredCount = deliveries.filter((d) => d.status === 'delivered').length;
  const cancelledCount = deliveries.filter((d) => d.status === 'cancelled').length;

  // Handle Create Request
  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!newOrder.customerName || !newOrder.customerPhone || !newOrder.deliveryAddress) {
      alert('Please fill out all required fields');
      return;
    }

    const orderNum = Math.floor(8930 + Math.random() * 100);
    const orderId = `ORD-DOM-${orderNum}`;

    const created = {
      _id: `del_custom_${Date.now()}`,
      orderId,
      trackingId: orderId,
      client: clientName,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      pickupLocation: {
        name: "Domino's Indiranagar",
        address: '100ft Road, Indiranagar',
      },
      deliveryLocation: {
        address: newOrder.deliveryAddress,
        city: 'Bengaluru',
      },
      status: 'pending',
      driver: null,
      driverId: null,
      vehicle: null,
      vehicleType: null,
      estimatedDeliveryTime: 'Awaiting Rider Dispatch',
      scheduledDate: new Date().toISOString().split('T')[0],
      items: newOrder.items || '1x Margherita Pizza, 1x Coke',
      totalAmount: parseFloat(newOrder.totalAmount) || 399,
      timeline: [
        {
          status: 'pending',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: 'Delivery request created by restaurant. Waiting for dispatch.',
        },
      ],
    };

    setDeliveries([created, ...deliveries]);
    setCreateModalOpen(false);
    setNewOrder({ customerName: '', customerPhone: '', deliveryAddress: '', items: '', totalAmount: '' });
    setNotification({
      type: 'success',
      message: `Delivery request #${orderId} submitted successfully! Central dispatch has been notified.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // Open Tracking Timeline Modal
  const openTrack = (delivery) => {
    setSelectedDelivery(delivery);
    setTrackModalOpen(true);
  };

  // Open Cancellation Modal with validation
  const openCancel = (delivery) => {
    const nonCancellable = ['picked_up', 'out_for_delivery', 'delivered'];
    if (nonCancellable.includes(delivery.status.toLowerCase())) {
      setNotification({
        type: 'error',
        message: `Cannot cancel delivery once it has reached "${delivery.status.toUpperCase()}". Orders can only be cancelled prior to rider pickup.`,
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    setSelectedDelivery(delivery);
    setCancellationReason('');
    setCancelModalOpen(true);
  };

  // Submit Cancellation
  const handleConfirmCancel = () => {
    if (!selectedDelivery) return;

    setDeliveries((prev) =>
      prev.map((d) =>
        d._id === selectedDelivery._id
          ? {
            ...d,
            status: 'cancelled',
            cancelledBy: 'Client Admin (Domino\'s)',
            cancellationReason: cancellationReason || 'Customer cancelled prior to pickup',
            cancelledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            driver: null,
            vehicle: null,
            timeline: [
              ...d.timeline,
              {
                status: 'cancelled',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                note: `Order cancelled by restaurant. Reason: ${cancellationReason || 'Pre-pickup cancellation'}. Rider and vehicle released.`,
              },
            ],
          }
          : d
      )
    );

    setCancelModalOpen(false);
    setNotification({
      type: 'info',
      message: `Order #${selectedDelivery.orderId} cancelled. Assigned rider and vehicle released.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`px-4 py-3 rounded-xl shadow-md border flex items-center justify-between text-sm font-medium transition-all ${notification.type === 'error'
            ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
            : notification.type === 'info'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
              : 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900 text-green-800 dark:text-green-200'
            }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-xs font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner & New Request Action */}
      <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#2E2E2E] rounded-xl p-5 text-slate-900 dark:text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="h-1 bg-amber-500 absolute top-0 left-0 right-0" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-2xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Restaurant Portal
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">FastFleet Partner</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{clientName} — Delivery Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your store's live food orders, rider assignments, and dispatch requests
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          className="self-start sm:self-auto shadow-sm"
          onClick={() => setCreateModalOpen(true)}
        >
          <HiOutlinePlus className="w-5 h-5 text-black" />
          Request Delivery
        </Button>
      </div>

      {/* KPI Cards (Client Specific) */}
      <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-card border border-slate-200 dark:border-[#2E2E2E] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <HiOutlineTruck className="w-5 h-5" />
            </div>
            <Badge variant="primary" size="sm">Store Orders</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{todayTotal}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Today's Deliveries</p>
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-card border border-slate-200 dark:border-[#2E2E2E] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <HiOutlineClock className="w-5 h-5" />
            </div>
            <Badge variant="warning" size="sm">Waiting</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{pendingCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pending Deliveries</p>
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-card border border-slate-200 dark:border-[#2E2E2E] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
            <Badge variant="success" size="sm">Completed</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{deliveredCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Delivered Orders</p>
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-card border border-slate-200 dark:border-[#2E2E2E] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <HiOutlineXCircle className="w-5 h-5" />
            </div>
            <Badge variant="danger" size="sm">Pre-pickup</Badge>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{cancelledCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cancelled Orders</p>
        </div>
      </section>

      {/* Deliveries Table with Assigned Driver, Vehicle, Tracking, and Cancellation */}
      <Card padding="p-0" className="overflow-hidden">
        <Card.Header className="px-5 pt-5 pb-3">
          <div>
            <Card.Title>Live Orders & Assigned Fleet</Card.Title>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing all deliveries for {clientName}. Track progress or cancel before partner pickup.
            </p>
          </div>
        </Card.Header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Order ID</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Customer & Items</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Assigned Driver</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Assigned Vehicle</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
              {deliveries.map((delivery) => {
                const canCancel = delivery.status === 'pending' || delivery.status === 'assigned';
                return (
                  <tr key={delivery._id} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {delivery.orderId}
                      <span className="block text-2xs font-normal text-slate-400 font-sans">
                        ₹{delivery.totalAmount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {delivery.customerName}
                      </p>
                      <p className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {delivery.items}
                      </p>
                      <p className="text-2xs text-slate-400 line-clamp-1 mt-0.5">
                        📍 {delivery.deliveryLocation.address}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {delivery.driver ? (
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {delivery.driver}
                          </p>
                          <span className="inline-block text-2xs text-green-600 dark:text-green-400 font-medium">
                            Assigned
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {delivery.vehicle ? (
                        <div>
                          <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {delivery.vehicle}
                          </p>
                          <span className="text-2xs text-slate-400">{delivery.vehicleType}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={delivery.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => openTrack(delivery)}
                          title="View Delivery Timeline"
                        >
                          <HiOutlineEye className="w-4 h-4 text-amber-500" />
                          Track
                        </Button>
                        {canCancel && (
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                            onClick={() => openCancel(delivery)}
                            title="Cancel Order (only allowed before pickup)"
                          >
                            <HiOutlineNoSymbol className="w-4 h-4 text-red-500" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Delivery Request Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Delivery Request"
        size="md"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200 border border-amber-500/30">
            <p className="font-bold">Pickup Location: {clientName} (Indiranagar Outlet)</p>
            <p className="text-2xs opacity-80 mt-0.5">FastFleet dispatchers will receive this request immediately.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sen"
                value={newOrder.customerName}
                onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98XXX XXXXX"
                value={newOrder.customerPhone}
                onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Delivery Address *
            </label>
            <input
              type="text"
              required
              placeholder="Flat / Building, Street, Landmark, Area"
              value={newOrder.deliveryAddress}
              onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Order Items Summary
              </label>
              <input
                type="text"
                placeholder="e.g. 2x Farmhouse Pizza, 1x Choco Lava"
                value={newOrder.items}
                onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Order Bill Amount (₹)
              </label>
              <input
                type="number"
                placeholder="499"
                value={newOrder.totalAmount}
                onChange={(e) => setNewOrder({ ...newOrder, totalAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Delivery Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delivery Tracking & Timeline Modal */}
      {selectedDelivery && (
        <Modal
          isOpen={trackModalOpen}
          onClose={() => setTrackModalOpen(false)}
          title={`Delivery Tracking: ${selectedDelivery.orderId}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Current Status</span>
                <StatusBadge status={selectedDelivery.status} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Customer</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedDelivery.customerName} ({selectedDelivery.customerPhone})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Drop Address</span>
                <span className="text-slate-700 dark:text-slate-300 text-right max-w-[240px]">
                  {selectedDelivery.deliveryLocation.address}
                </span>
              </div>
              {selectedDelivery.driver && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-[#2E2E2E]">
                  <span className="font-semibold text-slate-500">Assigned Partner</span>
                  <span className="font-bold text-amber-500">
                    {selectedDelivery.driver} ({selectedDelivery.vehicle})
                  </span>
                </div>
              )}
            </div>

            {/* Timeline View */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Order Fulfillment Timeline
              </h4>
              <div className="relative pl-6 space-y-4 border-l-2 border-amber-500/40 ml-2">
                {selectedDelivery.timeline?.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-[#111111]" />
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">
                      {step.status.replace(/_/g, ' ')}
                      <span className="text-2xs font-normal text-slate-400 ml-2 font-mono">
                        {step.time}
                      </span>
                    </p>
                    <p className="text-2xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {step.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setTrackModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancellation Modal with Reason */}
      {selectedDelivery && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title={`Cancel Order #${selectedDelivery.orderId}`}
          size="sm"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to cancel this delivery request? Any assigned driver and bike will be immediately released back to the available dispatch pool.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cancellation Reason
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Customer requested cancellation / Kitchen stock shortage"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
                Go Back
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmCancel}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientDashboard;
