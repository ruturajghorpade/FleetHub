// FleetHub – Delivery List & Management Page (Food Delivery Logistics)
import { useState, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineBolt,
  HiOutlineEye,
  HiOutlineNoSymbol,
  HiOutlineBuildingStorefront,
  HiOutlineTruck,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/context/AuthContext';
import { MOCK_DELIVERIES, MOCK_CLIENTS, MOCK_DRIVERS, MOCK_VEHICLES } from '@/data/mockData';

const STATUS_TABS = [
  { id: 'all', label: 'All Deliveries' },
  { id: 'pending', label: 'Pending' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'picked_up', label: 'Picked Up' },
  { id: 'out_for_delivery', label: 'Out For Delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

const DeliveryListPage = () => {
  const { user, activeRole } = useAuth();
  const [deliveries, setDeliveries] = useState(MOCK_DELIVERIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [notification, setNotification] = useState(null);

  // Modals
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // New Delivery Request Form
  const [newOrder, setNewOrder] = useState({
    client: "Domino's Pizza",
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    items: '',
    totalAmount: '',
  });

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      // Role-based visibility: if Client Admin, show only their client
      if (activeRole === 'client_admin') {
        if (!d.client.toLowerCase().includes('domino')) return false;
      }
      // If Driver, show only assigned
      if (activeRole === 'driver') {
        if (d.driver !== user?.name && d.driverId !== user?.driverId) return false;
      }

      // Status tab filter
      if (selectedStatusTab !== 'all' && d.status !== selectedStatusTab) {
        return false;
      }

      // Restaurant filter
      if (selectedClient !== 'all' && d.client !== selectedClient) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesOrder = d.orderId.toLowerCase().includes(query);
        const matchesCustomer = d.customerName.toLowerCase().includes(query);
        const matchesRestaurant = d.client.toLowerCase().includes(query);
        const matchesPhone = d.customerPhone?.toLowerCase().includes(query);
        if (!matchesOrder && !matchesCustomer && !matchesRestaurant && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [deliveries, activeRole, user, selectedStatusTab, selectedClient, searchQuery]);

  // 1-Click Auto Assign
  const handleAutoAssign = (deliveryId) => {
    const availableDriver = MOCK_DRIVERS.find((dr) => dr.availability === 'AVAILABLE');
    const availableVehicle = MOCK_VEHICLES.find((v) => v.availability === 'AVAILABLE');

    if (!availableDriver || !availableVehicle) {
      setNotification({
        type: 'error',
        message: 'No available drivers or vehicles found for automatic assignment!',
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setDeliveries((prev) =>
      prev.map((d) =>
        d._id === deliveryId
          ? {
              ...d,
              status: 'assigned',
              driver: availableDriver.name,
              driverId: availableDriver._id,
              vehicle: availableVehicle.vehicleNumber,
              vehicleType: availableVehicle.vehicleType,
              timeline: [
                ...d.timeline,
                {
                  status: 'assigned',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  note: `Auto-assigned to ${availableDriver.name} (${availableVehicle.vehicleNumber})`,
                },
              ],
            }
          : d
      )
    );

    setNotification({
      type: 'success',
      message: `Delivery #${deliveries.find((d) => d._id === deliveryId)?.orderId} auto-assigned!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Cancel Modal
  const openCancel = (delivery) => {
    const nonCancellable = ['picked_up', 'out_for_delivery', 'delivered'];
    if (nonCancellable.includes(delivery.status.toLowerCase())) {
      setNotification({
        type: 'error',
        message: `Cannot cancel delivery once status is "${delivery.status.toUpperCase()}". Cancellations allowed only before pickup.`,
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setSelectedDelivery(delivery);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  // Submit Cancel
  const handleConfirmCancel = () => {
    if (!selectedDelivery) return;

    setDeliveries((prev) =>
      prev.map((d) =>
        d._id === selectedDelivery._id
          ? {
              ...d,
              status: 'cancelled',
              cancelledBy: user?.name || 'Admin',
              cancellationReason: cancelReason || 'Order cancelled before pickup',
              cancelledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              driver: null,
              vehicle: null,
              timeline: [
                ...d.timeline,
                {
                  status: 'cancelled',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  note: `Order cancelled (${cancelReason || 'Pre-pickup cancellation'}). Driver and vehicle released.`,
                },
              ],
            }
          : d
      )
    );

    setCancelModalOpen(false);
    setNotification({
      type: 'info',
      message: `Order #${selectedDelivery.orderId} cancelled and fleet released!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Create Request Form Submit
  const handleCreateOrder = (e) => {
    e.preventDefault();
    const orderId = `ORD-REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDelivery = {
      _id: `del_${Date.now()}`,
      orderId,
      trackingId: orderId,
      client: newOrder.client,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      pickupLocation: {
        name: newOrder.client,
        address: 'Outlet Hub',
      },
      deliveryLocation: {
        address: newOrder.deliveryAddress,
        city: 'Bengaluru',
      },
      status: 'pending',
      driver: null,
      vehicle: null,
      estimatedDeliveryTime: 'Awaiting Dispatch',
      items: newOrder.items || 'Standard Food Items',
      totalAmount: parseFloat(newOrder.totalAmount) || 450,
      timeline: [
        {
          status: 'pending',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: 'Delivery request submitted to FastFleet Central Dispatch',
        },
      ],
    };

    setDeliveries([newDelivery, ...deliveries]);
    setCreateModalOpen(false);
    setNewOrder({ client: "Domino's Pizza", customerName: '', customerPhone: '', deliveryAddress: '', items: '', totalAmount: '' });
    setNotification({
      type: 'success',
      message: `Delivery request #${orderId} created successfully!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`px-4 py-3 rounded-xl shadow-md border flex items-center justify-between text-sm font-medium ${
            notification.type === 'error'
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

      {/* Page Header with Create Action */}
      <PageHeader
        title="Delivery Operations"
        subtitle="Manage food delivery requests, dispatch riders, track timelines, and handle pre-pickup cancellations"
      >
        {(activeRole === 'super_admin' || activeRole === 'client_admin') && (
          <Button variant="primary" size="md" onClick={() => setCreateModalOpen(true)}>
            <HiOutlinePlus className="w-5 h-5" />
            New Delivery Request
          </Button>
        )}
      </PageHeader>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {STATUS_TABS.map((tab) => {
          const isActive = selectedStatusTab === tab.id;
          const count =
            tab.id === 'all'
              ? deliveries.length
              : deliveries.filter((d) => d.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-2xs ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Restaurant Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="relative w-full sm:w-80">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-primary-500"
          />
        </div>

        {activeRole !== 'client_admin' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <HiOutlineFunnel className="w-3.5 h-3.5" />
              Restaurant:
            </span>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:border-primary-500 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Restaurants</option>
              {MOCK_CLIENTS.map((c) => (
                <option key={c._id} value={c.companyName}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Deliveries Table */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Order ID</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Restaurant</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Customer & Items</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Assigned Driver</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Vehicle</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                    No deliveries found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => {
                  const canCancel =
                    delivery.status === 'pending' || delivery.status === 'assigned';
                  const canAutoAssign =
                    delivery.status === 'pending' &&
                    (activeRole === 'dispatcher' || activeRole === 'super_admin');

                  return (
                    <tr
                      key={delivery._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {delivery.orderId}
                        <span className="block text-2xs font-normal text-slate-400 font-sans">
                          ₹{delivery.totalAmount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-primary-700 dark:text-primary-300">
                        {delivery.client}
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
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {delivery.driver}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {delivery.vehicle ? (
                          <div>
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {delivery.vehicle}
                            </span>
                            <span className="block text-2xs text-slate-400">{delivery.vehicleType}</span>
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
                          {canAutoAssign && (
                            <button
                              onClick={() => handleAutoAssign(delivery._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-2xs font-bold transition-all"
                              title="Auto-Assign Available Rider & Bike"
                            >
                              <HiOutlineBolt className="w-3.5 h-3.5 text-amber-300" />
                              Auto Assign
                            </button>
                          )}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setTrackModalOpen(true);
                            }}
                            title="Track Timeline"
                          >
                            <HiOutlineEye className="w-4 h-4 text-primary-600" />
                            Track
                          </Button>
                          {canCancel && (
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                              onClick={() => openCancel(delivery)}
                              title="Cancel Order"
                            >
                              <HiOutlineNoSymbol className="w-4 h-4 text-red-500" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Delivery Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Delivery Request"
        size="md"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Client / Restaurant *
            </label>
            <select
              value={newOrder.client}
              onChange={(e) => setNewOrder({ ...newOrder, client: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-primary-500"
            >
              {MOCK_CLIENTS.map((c) => (
                <option key={c._id} value={c.companyName}>
                  {c.companyName} ({c.businessType})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Varun Mehta"
                value={newOrder.customerName}
                onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-primary-500"
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
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Delivery Dropoff Address *
            </label>
            <input
              type="text"
              required
              placeholder="Flat 101, Prestige Tech Park, Marathahalli"
              value={newOrder.deliveryAddress}
              onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Order Items
              </label>
              <input
                type="text"
                placeholder="2x Whopper, 1x Fries"
                value={newOrder.items}
                onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bill Amount (₹)
              </label>
              <input
                type="number"
                placeholder="499"
                value={newOrder.totalAmount}
                onChange={(e) => setNewOrder({ ...newOrder, totalAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Tracking Modal */}
      {selectedDelivery && (
        <Modal
          isOpen={trackModalOpen}
          onClose={() => setTrackModalOpen(false)}
          title={`Delivery Tracking: ${selectedDelivery.orderId}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Status</span>
                <StatusBadge status={selectedDelivery.status} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Restaurant</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedDelivery.client}
                </span>
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
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-500">Assigned Rider</span>
                  <span className="font-bold text-primary-600 dark:text-secondary-400">
                    {selectedDelivery.driver} ({selectedDelivery.vehicle})
                  </span>
                </div>
              )}
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Delivery Timeline
            </h4>
            <div className="relative pl-6 space-y-4 border-l-2 border-primary-200 dark:border-primary-900 ml-2">
              {selectedDelivery.timeline?.map((step, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-primary-600 ring-4 ring-white dark:ring-slate-900" />
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

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setTrackModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Modal */}
      {selectedDelivery && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title={`Cancel Order #${selectedDelivery.orderId}`}
          size="sm"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to cancel this delivery request? Assigned driver and bike will be released back to the available pool.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cancellation Reason
              </label>
              <textarea
                rows={3}
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
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

export default DeliveryListPage;
