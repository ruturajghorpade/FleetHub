// FleetHub – Delivery List & Management Page (Food Delivery Logistics)
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineBolt,
  HiOutlineEye,
  HiOutlineNoSymbol,
  HiOutlineCheck,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/context/AuthContext';
import deliveryService from '@/services/deliveryService';
import clientService from '@/services/clientService';
import { showError, showSuccess } from '@/utils/toastUtils';
import { MOCK_DELIVERIES, MOCK_CLIENTS } from '@/data/mockData';

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
  const [deliveries, setDeliveries] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  // Modals
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // New Delivery Request Form
  const [newOrder, setNewOrder] = useState({
    clientId: '',
    clientName: "Domino's Pizza",
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    items: '',
    totalAmount: '',
  });

  // Fetch Deliveries from backend
  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getDeliveries({ limit: 100 });
      if (data?.deliveries && data.deliveries.length > 0) {
        setDeliveries(data.deliveries);
      } else {
        setDeliveries(MOCK_DELIVERIES);
      }
    } catch {
      setDeliveries(MOCK_DELIVERIES);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Clients for dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await clientService.getClients({ limit: 50 });
        if (data?.clients && data.clients.length > 0) {
          setClients(data.clients);
          setNewOrder((prev) => ({
            ...prev,
            clientId: data.clients[0]._id,
            clientName: data.clients[0].companyName,
          }));
        } else {
          setClients(MOCK_CLIENTS);
        }
      } catch {
        setClients(MOCK_CLIENTS);
      }
    };

    fetchClients();
    loadDeliveries();
  }, [loadDeliveries]);

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const clientName = d.client?.companyName || d.client || '';
      const driverName = d.assignedDriver?.firstName
        ? `${d.assignedDriver.firstName} ${d.assignedDriver.lastName || ''}`
        : d.driver || '';

      // Role-based visibility
      if (activeRole === 'client_admin') {
        const userClientName = user?.client?.companyName || user?.client?.name || 'domino';
        if (!clientName.toLowerCase().includes(userClientName.toLowerCase().slice(0, 5))) {
          return false;
        }
      }

      if (activeRole === 'driver') {
        if (driverName !== user?.name && d.assignedDriver?._id !== user?._id) {
          return false;
        }
      }

      // Status tab filter
      if (selectedStatusTab !== 'all' && d.status?.toLowerCase() !== selectedStatusTab.toLowerCase()) {
        return false;
      }

      // Restaurant filter
      if (selectedClient !== 'all' && clientName !== selectedClient) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesOrder = d.orderId?.toLowerCase().includes(query);
        const matchesCustomer = d.customerName?.toLowerCase().includes(query);
        const matchesRestaurant = clientName.toLowerCase().includes(query);
        const matchesPhone = d.customerPhone?.toLowerCase().includes(query);
        if (!matchesOrder && !matchesCustomer && !matchesRestaurant && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [deliveries, activeRole, user, selectedStatusTab, selectedClient, searchQuery]);

  // 1-Click Auto Assign
  const handleAutoAssign = async (deliveryId) => {
    setActionLoading(deliveryId);
    try {
      await deliveryService.autoAssign(deliveryId);
      showSuccess('Delivery auto-assigned to nearest available rider and bike!');
      await loadDeliveries();
    } catch (err) {
      showError(err.response?.data?.message || 'Auto-assignment failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Open Cancel Modal
  const openCancel = (delivery) => {
    const nonCancellable = ['picked_up', 'out_for_delivery', 'delivered'];
    if (nonCancellable.includes(delivery.status?.toLowerCase())) {
      showError(
        `Cannot cancel delivery once status is "${delivery.status.toUpperCase()}". Cancellations allowed only before pickup.`
      );
      return;
    }

    setSelectedDelivery(delivery);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  // Submit Cancel
  const handleConfirmCancel = async () => {
    if (!selectedDelivery) return;

    setActionLoading(selectedDelivery._id);
    try {
      await deliveryService.cancelDelivery(selectedDelivery._id, {
        reason: cancelReason || 'Order cancelled before pickup',
      });
      showSuccess(`Order #${selectedDelivery.orderId} cancelled and fleet released!`);
      setCancelModalOpen(false);
      await loadDeliveries();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel delivery');
    } finally {
      setActionLoading(null);
    }
  };

  // Advance delivery status (Driver/Dispatcher actions: picked_up, out_for_delivery, delivered)
  const handleUpdateStatus = async (deliveryId, newStatus) => {
    setActionLoading(deliveryId);
    try {
      await deliveryService.updateStatus(deliveryId, {
        status: newStatus,
        note: `Status updated to ${newStatus.replace(/_/g, ' ')}`,
      });
      showSuccess(`Status updated to ${newStatus.toUpperCase()}`);
      await loadDeliveries();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  // Create Request Form Submit
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const orderId = `ORD-REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const selectedClientObj = clients.find((c) => c._id === newOrder.clientId) || clients[0];

    try {
      await deliveryService.createDelivery({
        orderId,
        client: selectedClientObj?._id || newOrder.clientId,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        pickupLocation: {
          name: selectedClientObj?.companyName || newOrder.clientName,
          address: selectedClientObj?.address || 'Indiranagar Outlet',
        },
        deliveryLocation: {
          address: newOrder.deliveryAddress,
          city: 'Bengaluru',
        },
        items: [
          {
            name: newOrder.items || 'Food Items',
            quantity: 1,
            price: parseFloat(newOrder.totalAmount) || 450,
          },
        ],
        totalAmount: parseFloat(newOrder.totalAmount) || 450,
        paymentMethod: 'PREPAID',
      });

      showSuccess(`Delivery request #${orderId} created successfully!`);
      setCreateModalOpen(false);
      setNewOrder({
        clientId: clients[0]?._id || '',
        clientName: clients[0]?.companyName || "Domino's Pizza",
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        items: '',
        totalAmount: '',
      });
      await loadDeliveries();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create delivery request');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-[#2E2E2E]">
        {STATUS_TABS.map((tab) => {
          const isActive = selectedStatusTab === tab.id;
          const count =
            tab.id === 'all'
              ? deliveries.length
              : deliveries.filter((d) => d.status?.toLowerCase() === tab.id.toLowerCase()).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A1A1A]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-2xs ${
                  isActive
                    ? 'bg-black/20 text-black font-bold'
                    : 'bg-slate-200 dark:bg-[#242424] text-slate-700 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Restaurant Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-[#2E2E2E] shadow-card">
        <div className="relative w-full sm:w-80">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Restaurants</option>
              {clients.map((c) => (
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
              <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Order ID</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Restaurant</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Customer & Items</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Assigned Driver</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Vehicle</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                    Loading live deliveries from FleetHub backend...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                    No deliveries found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => {
                  const status = delivery.status?.toLowerCase() || 'pending';
                  const canCancel = status === 'pending' || status === 'assigned';
                  const canAutoAssign =
                    status === 'pending' &&
                    (activeRole === 'dispatcher' || activeRole === 'super_admin');

                  const driverName =
                    delivery.assignedDriver?.firstName
                      ? `${delivery.assignedDriver.firstName} ${delivery.assignedDriver.lastName || ''}`
                      : delivery.driver || null;

                  const vehicleNum =
                    delivery.assignedVehicle?.vehicleNumber || delivery.vehicle || null;

                  const vehicleModel =
                    delivery.assignedVehicle?.model || delivery.vehicleType || '';

                  const clientName =
                    delivery.client?.companyName || delivery.client || "Domino's Pizza";

                  const itemsList = Array.isArray(delivery.items)
                    ? delivery.items.map((it) => it.name).join(', ')
                    : delivery.items || 'Food items';

                  const dropAddress =
                    delivery.deliveryLocation?.address || delivery.deliveryAddress || 'Customer Address';

                  return (
                    <tr
                      key={delivery._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {delivery.orderId || delivery.trackingId}
                        <span className="block text-2xs font-normal text-slate-400 font-sans">
                          ₹{delivery.totalAmount || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {clientName}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {delivery.customerName}
                        </p>
                        <p className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {itemsList}
                        </p>
                        <p className="text-2xs text-slate-400 line-clamp-1 mt-0.5">
                          📍 {dropAddress}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {driverName ? (
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {driverName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {vehicleNum ? (
                          <div>
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {vehicleNum}
                            </span>
                            <span className="block text-2xs text-slate-400">{vehicleModel}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <StatusBadge status={delivery.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Auto-Assign Action for Dispatchers */}
                          {canAutoAssign && (
                            <button
                              disabled={actionLoading === delivery._id}
                              onClick={() => handleAutoAssign(delivery._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-black text-2xs font-bold transition-all shadow-sm disabled:opacity-50"
                              title="Auto-Assign Available Rider & Bike"
                            >
                              <HiOutlineBolt className="w-3.5 h-3.5 text-black" />
                              Auto Assign
                            </button>
                          )}

                          {/* Driver progression buttons */}
                          {status === 'assigned' && (activeRole === 'driver' || activeRole === 'dispatcher') && (
                            <button
                              onClick={() => handleUpdateStatus(delivery._id, 'picked_up')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 text-black text-2xs font-bold hover:bg-amber-600 shadow-sm"
                            >
                              <HiOutlineCheck className="w-3 h-3" />
                              Picked Up
                            </button>
                          )}
                          {status === 'picked_up' && (activeRole === 'driver' || activeRole === 'dispatcher') && (
                            <button
                              onClick={() => handleUpdateStatus(delivery._id, 'out_for_delivery')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 text-white text-2xs font-bold hover:bg-blue-700 shadow-sm"
                            >
                              Out for Delivery
                            </button>
                          )}
                          {status === 'out_for_delivery' && (activeRole === 'driver' || activeRole === 'dispatcher') && (
                            <button
                              onClick={() => handleUpdateStatus(delivery._id, 'delivered')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-600 text-white text-2xs font-bold hover:bg-green-700 shadow-sm"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {/* Track Timeline */}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setTrackModalOpen(true);
                            }}
                            title="Track Timeline"
                          >
                            <HiOutlineEye className="w-4 h-4 text-amber-500" />
                            Track
                          </Button>

                          {/* Pre-pickup Cancellation */}
                          {canCancel && (
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
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
              value={newOrder.clientId}
              onChange={(e) => {
                const c = clients.find((item) => item._id === e.target.value);
                setNewOrder({
                  ...newOrder,
                  clientId: e.target.value,
                  clientName: c?.companyName || "Domino's Pizza",
                });
              }}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName} ({c.businessType || 'RESTAURANT'})
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
              Delivery Dropoff Address *
            </label>
            <input
              type="text"
              required
              placeholder="Flat 101, Prestige Tech Park, Marathahalli"
              value={newOrder.deliveryAddress}
              onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
          title={`Delivery Tracking: ${selectedDelivery.orderId || selectedDelivery.trackingId}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Status</span>
                <StatusBadge status={selectedDelivery.status} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Restaurant</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedDelivery.client?.companyName || selectedDelivery.client || "Domino's"}
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
                  {selectedDelivery.deliveryLocation?.address || selectedDelivery.deliveryAddress}
                </span>
              </div>
              {(selectedDelivery.assignedDriver || selectedDelivery.driver) && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-[#2E2E2E]">
                  <span className="font-semibold text-slate-500">Assigned Rider</span>
                  <span className="font-bold text-amber-500">
                    {selectedDelivery.assignedDriver?.firstName
                      ? `${selectedDelivery.assignedDriver.firstName} ${selectedDelivery.assignedDriver.lastName || ''}`
                      : selectedDelivery.driver}{' '}
                    (
                    {selectedDelivery.assignedVehicle?.vehicleNumber ||
                      selectedDelivery.vehicle ||
                      'Fleet Bike'}
                    )
                  </span>
                </div>
              )}
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Delivery Timeline
            </h4>
            <div className="relative pl-6 space-y-4 border-l-2 border-amber-500/40 ml-2 max-h-60 overflow-y-auto">
              {selectedDelivery.timeline?.map((step, idx) => {
                const timeStr = step.timestamp
                  ? new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : step.time || 'Recent';

                return (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-[#111111]" />
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">
                      {step.status?.replace(/_/g, ' ')}
                      <span className="text-2xs font-normal text-slate-400 ml-2 font-mono">
                        {timeStr}
                      </span>
                    </p>
                    <p className="text-2xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {step.note}
                    </p>
                  </div>
                );
              })}
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
          title={`Cancel Order #${selectedDelivery.orderId || selectedDelivery.trackingId}`}
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
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-red-500"
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
