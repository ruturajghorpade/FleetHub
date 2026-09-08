// FleetHub – Delivery Operations Management Page (Food Delivery Logistics)
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineBolt,
  HiOutlineEye,
  HiOutlineNoSymbol,
  HiOutlineCheck,
  HiOutlineUserPlus,
  HiOutlineTruck,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/context/AuthContext';
import deliveryService from '@/services/deliveryService';
import clientService from '@/services/clientService';
import branchService from '@/services/branchService';
import driverService from '@/services/driverService';
import vehicleService from '@/services/vehicleService';
import { showError, showSuccess } from '@/utils/toastUtils';

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
  const [branches, setBranches] = useState([]);
  const [createBranches, setCreateBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  // Modals
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Assign Modal State
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Create Delivery Form State
  const [newOrder, setNewOrder] = useState({
    clientId: '',
    branchId: '',
    customerName: '',
    customerPhone: '',
    pickupName: '',
    pickupAddress: '',
    deliveryAddress: '',
    city: 'Pune',
    items: '',
    totalAmount: '450',
    paymentMethod: 'PREPAID',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Fetch Deliveries from backend
  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const data = activeRole === 'driver'
        ? await deliveryService.getMyDeliveries({ limit: 200 })
        : await deliveryService.getDeliveries({ limit: 200 });
      setDeliveries(data?.deliveries || []);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
      showError(err.response?.data?.message || 'Failed to load deliveries from database');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }, [activeRole]);

  // Fetch Clients & Branches (only for roles that manage or filter by client/branch)
  useEffect(() => {
    const fetchInitialData = async () => {
      if (activeRole === 'driver') return;
      try {
        const [clientRes, branchRes] = await Promise.all([
          clientService.getClients({ limit: 100 }),
          branchService.getBranches({ limit: 100 }),
        ]);

        const fetchedClients = clientRes?.clients || [];
        const fetchedBranches = branchRes?.branches || [];
        setClients(fetchedClients);
        setBranches(fetchedBranches);

        // Pre-configure client/branch for create modal
        if (activeRole === 'client_admin' && user?.client) {
          const userClientId = typeof user.client === 'object' ? user.client._id : user.client;
          const userClient = fetchedClients.find((c) => c._id === userClientId);
          const clientBranches = fetchedBranches.filter(
            (b) => (b.client?._id || b.client) === userClientId
          );
          setCreateBranches(clientBranches);
          setNewOrder((prev) => ({
            ...prev,
            clientId: userClientId,
            branchId: clientBranches[0]?._id || '',
            pickupName: userClient?.companyName || "Client Outlet",
            pickupAddress: clientBranches[0]?.address || userClient?.address || "Main Branch",
          }));
        } else if (fetchedClients.length > 0) {
          const firstClient = fetchedClients[0];
          const clientBranches = fetchedBranches.filter(
            (b) => (b.client?._id || b.client) === firstClient._id
          );
          setCreateBranches(clientBranches);
          setNewOrder((prev) => ({
            ...prev,
            clientId: firstClient._id,
            branchId: clientBranches[0]?._id || '',
            pickupName: firstClient.companyName,
            pickupAddress: clientBranches[0]?.address || firstClient.address || "Main Outlet",
          }));
        }
      } catch (err) {
        console.error('Failed to fetch initial client/branch data:', err);
      }
    };

    fetchInitialData();
    loadDeliveries();
  }, [loadDeliveries, activeRole, user]);

  // When Client changes in Create Delivery Form, refresh available branches
  const handleClientChange = async (clientId) => {
    const clientObj = clients.find((c) => c._id === clientId);
    try {
      const res = await branchService.getBranches({ client: clientId });
      const clientBranches = res?.branches || [];
      setCreateBranches(clientBranches);
      const firstBranch = clientBranches[0];
      setNewOrder((prev) => ({
        ...prev,
        clientId,
        branchId: firstBranch?._id || '',
        pickupName: clientObj?.companyName || 'Restaurant Outlet',
        pickupAddress: firstBranch?.address || clientObj?.address || 'Outlet Address',
      }));
    } catch {
      setCreateBranches([]);
    }
  };

  // When Branch changes in Create Delivery Form, update pickup location
  const handleBranchChange = (branchId) => {
    const branchObj = createBranches.find((b) => b._id === branchId);
    setNewOrder((prev) => ({
      ...prev,
      branchId,
      pickupAddress: branchObj?.address || prev.pickupAddress,
    }));
  };

  // Open Manual Assign Modal
  const openAssignModal = async (delivery) => {
    setSelectedDelivery(delivery);
    setSelectedDriverId('');
    setSelectedVehicleId('');
    setAssignModalOpen(true);
    setAssignLoading(true);

    try {
      const clientId = delivery.client?._id || delivery.client;
      const branchId = delivery.branch?._id || delivery.branch;

      const [driverRes, vehicleRes] = await Promise.all([
        driverService.getDrivers({ client: clientId, limit: 50 }),
        vehicleService.getVehicles({ client: clientId, limit: 50 }),
      ]);

      // Filter available drivers for this client
      const allDrivers = driverRes?.drivers || [];
      const availDrivers = allDrivers.filter(
        (d) =>
          d.availability?.toUpperCase() === 'AVAILABLE' &&
          d.status !== 'inactive' &&
          d.status !== 'suspended'
      );
      setAvailableDrivers(availDrivers);
      if (availDrivers.length > 0) {
        const branchDriver = availDrivers.find(
          (d) => (d.branch?._id || d.branch) === branchId
        );
        setSelectedDriverId(branchDriver ? branchDriver._id : availDrivers[0]._id);
      }

      // Filter available bikes/scooters for this client
      const allVehicles = vehicleRes?.vehicles || [];
      const availVehicles = allVehicles.filter(
        (v) =>
          v.availability?.toUpperCase() === 'AVAILABLE' &&
          v.status !== 'maintenance' &&
          v.status !== 'retired' &&
          v.status !== 'inactive'
      );
      setAvailableVehicles(availVehicles);
      if (availVehicles.length > 0) {
        const branchVehicle = availVehicles.find(
          (v) => (v.branch?._id || v.branch) === branchId
        );
        setSelectedVehicleId(branchVehicle ? branchVehicle._id : availVehicles[0]._id);
      }
    } catch (err) {
      console.error('Failed to load fleet resources:', err);
      showError('Failed to fetch available drivers and vehicles');
    } finally {
      setAssignLoading(false);
    }
  };

  // Submit Manual Assignment
  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!selectedDelivery || !selectedDriverId || !selectedVehicleId) {
      showError('Please select both a driver and a vehicle');
      return;
    }

    setAssignSubmitting(true);
    try {
      await deliveryService.manualAssign(selectedDelivery._id, {
        driverId: selectedDriverId,
        vehicleId: selectedVehicleId,
      });
      showSuccess(`Order #${selectedDelivery.orderId} assigned to rider and vehicle!`);
      setAssignModalOpen(false);
      await loadDeliveries();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to assign delivery');
    } finally {
      setAssignSubmitting(false);
    }
  };

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
    const nonCancellable = ['picked_up', 'out_for_delivery', 'delivered', 'cancelled'];
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
    if (!cancelReason.trim()) {
      showError('Please enter a reason for cancellation');
      return;
    }

    setActionLoading(selectedDelivery._id);
    try {
      await deliveryService.cancelDelivery(selectedDelivery._id, {
        reason: cancelReason.trim(),
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

  // Advance delivery status
  const handleUpdateStatus = async (deliveryId, newStatus) => {
    setActionLoading(deliveryId);
    try {
      await deliveryService.updateStatus(deliveryId, {
        status: newStatus,
        note: `Status advanced to ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
      });
      showSuccess(`Status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
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
    if (!newOrder.customerName || !newOrder.customerPhone || !newOrder.deliveryAddress) {
      showError('Please fill in customer details and delivery dropoff address');
      return;
    }

    setCreateSubmitting(true);
    const orderId = `ORD-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const selectedClientObj = clients.find((c) => c._id === newOrder.clientId) || clients[0];

    try {
      await deliveryService.createDelivery({
        orderId,
        client: newOrder.clientId || selectedClientObj?._id,
        branch: newOrder.branchId || null,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        pickupLocation: {
          name: newOrder.pickupName || selectedClientObj?.companyName || 'Main Outlet',
          address: newOrder.pickupAddress || selectedClientObj?.address || 'Outlet Address',
        },
        deliveryLocation: {
          address: newOrder.deliveryAddress,
          city: newOrder.city || 'Pune',
        },
        items: [
          {
            name: newOrder.items || 'Standard Food Items',
            quantity: 1,
            price: parseFloat(newOrder.totalAmount) || 450,
          },
        ],
        totalAmount: parseFloat(newOrder.totalAmount) || 450,
        paymentMethod: newOrder.paymentMethod || 'PREPAID',
      });

      showSuccess(`Delivery request #${orderId} created successfully!`);
      setCreateModalOpen(false);
      setNewOrder((prev) => ({
        ...prev,
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        items: '',
        totalAmount: '450',
      }));
      await loadDeliveries();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create delivery request');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const clientName = d.client?.companyName || '';
      const branchName = d.branch?.branchName || '';

      // Status tab filter
      if (selectedStatusTab !== 'all' && d.status?.toLowerCase() !== selectedStatusTab.toLowerCase()) {
        return false;
      }

      // Restaurant filter
      if (selectedClient !== 'all' && d.client?._id !== selectedClient && clientName !== selectedClient) {
        return false;
      }

      // Branch filter
      if (selectedBranch !== 'all' && d.branch?._id !== selectedBranch && branchName !== selectedBranch) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesOrder = d.orderId?.toLowerCase().includes(query) || d.trackingId?.toLowerCase().includes(query);
        const matchesCustomer = d.customerName?.toLowerCase().includes(query);
        const matchesRestaurant = clientName.toLowerCase().includes(query);
        const matchesPhone = d.customerPhone?.toLowerCase().includes(query);
        const matchesDriver = d.assignedDriver?.firstName?.toLowerCase().includes(query) || d.assignedDriver?.lastName?.toLowerCase().includes(query);
        const matchesVehicle = d.assignedVehicle?.vehicleNumber?.toLowerCase().includes(query);

        if (!matchesOrder && !matchesCustomer && !matchesRestaurant && !matchesPhone && !matchesDriver && !matchesVehicle) {
          return false;
        }
      }

      return true;
    });
  }, [deliveries, selectedStatusTab, selectedClient, selectedBranch, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with Action Button via actions prop */}
      <PageHeader
        title={activeRole === 'driver' ? 'My Assigned Deliveries' : 'Delivery Operations'}
        subtitle={
          activeRole === 'driver'
            ? 'View, track, and update your assigned food delivery orders in real time'
            : 'Manage end-to-end food delivery requests, dispatch riders & vehicles, track live status, and monitor fleet utilization'
        }
        actions={
          (activeRole === 'super_admin' || activeRole === 'client_admin') && (
            <Button variant="primary" size="md" onClick={() => setCreateModalOpen(true)}>
              <HiOutlinePlus className="w-5 h-5" />
              New Delivery Request
            </Button>
          )
        }
      />

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
            placeholder="Search order ID, rider, vehicle, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {activeRole !== 'client_admin' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <HiOutlineFunnel className="w-3.5 h-3.5" />
                Restaurant:
              </span>
              <select
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  setSelectedBranch('all');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Restaurants</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <HiOutlineBuildingOffice2 className="w-3.5 h-3.5" />
              Branch:
            </span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Branches</option>
              {branches
                .filter((b) => selectedClient === 'all' || (b.client?._id || b.client) === selectedClient)
                .map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.branchName}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Deliveries Table */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Order ID</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Restaurant & Branch</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Customer & Items</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Assigned Driver</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Assigned Vehicle</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      Loading live deliveries from MongoDB...
                    </div>
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    <HiOutlineInformationCircle className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
                    <p className="font-semibold text-slate-300">No deliveries found</p>
                    <p className="text-2xs text-slate-500 mt-0.5">
                      {deliveries.length === 0
                        ? 'No delivery requests have been submitted yet. Create one to begin!'
                        : 'No deliveries match your active filter criteria.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => {
                  const status = (delivery.status || 'pending').toLowerCase();
                  const canCancel = status === 'pending' || status === 'assigned';
                  const canAssign =
                    (status === 'pending' || status === 'assigned') &&
                    (activeRole === 'super_admin' || activeRole === 'client_admin' || activeRole === 'dispatcher');

                  const driverName = delivery.assignedDriver
                    ? `${delivery.assignedDriver.firstName} ${delivery.assignedDriver.lastName || ''}`
                    : null;

                  const vehicleNum = delivery.assignedVehicle?.vehicleNumber || null;
                  const vehicleModel = delivery.assignedVehicle?.model || delivery.assignedVehicle?.vehicleType || '';
                  const clientName = delivery.client?.companyName || 'Restaurant Client';
                  const branchName = delivery.branch?.branchName || 'Main Hub';

                  const itemsList = Array.isArray(delivery.items) && delivery.items.length > 0
                    ? delivery.items.map((it) => it.name).join(', ')
                    : 'Food items';

                  const dropAddress = delivery.deliveryLocation?.address || 'Customer Drop Location';

                  return (
                    <tr
                      key={delivery._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {delivery.orderId}
                        <span className="block text-2xs font-normal text-amber-500 font-sans mt-0.5">
                          ₹{delivery.totalAmount || 0} • {delivery.paymentMethod || 'PREPAID'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <span className="font-semibold text-amber-600 dark:text-amber-400 block">
                          {clientName}
                        </span>
                        <span className="text-2xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <HiOutlineBuildingOffice2 className="w-3 h-3 text-slate-500" />
                          {branchName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs max-w-xs">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {delivery.customerName}
                        </p>
                        <p className="text-2xs text-slate-500 dark:text-slate-400 truncate">
                          {itemsList}
                        </p>
                        <p className="text-2xs text-slate-400 truncate mt-0.5">
                          📍 {dropAddress}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {driverName ? (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {driverName}
                            </span>
                            {delivery.assignedDriver?.phone && (
                              <span className="block text-2xs text-slate-400">
                                📞 {delivery.assignedDriver.phone}
                              </span>
                            )}
                          </div>
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
                            <span className="block text-2xs text-slate-400 uppercase">
                              {vehicleModel}
                            </span>
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
                          {/* Manual Assign Button */}
                          {canAssign && (
                            <button
                              disabled={actionLoading === delivery._id}
                              onClick={() => openAssignModal(delivery)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-black text-2xs font-bold transition-all shadow-sm disabled:opacity-50"
                              title="Assign Driver & Vehicle"
                            >
                              <HiOutlineUserPlus className="w-3.5 h-3.5 text-black" />
                              {status === 'assigned' ? 'Reassign' : 'Assign'}
                            </button>
                          )}

                          {/* 1-Click Auto Assign */}
                          {status === 'pending' && (activeRole === 'super_admin' || activeRole === 'dispatcher') && (
                            <button
                              disabled={actionLoading === delivery._id}
                              onClick={() => handleAutoAssign(delivery._id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-200 dark:bg-[#2A2A2A] hover:bg-slate-300 dark:hover:bg-[#333333] text-slate-800 dark:text-slate-200 text-2xs font-semibold transition-all"
                              title="Auto-Assign Available Rider & Bike"
                            >
                              <HiOutlineBolt className="w-3.5 h-3.5 text-amber-500" />
                              Auto
                            </button>
                          )}

                          {/* Driver progression buttons */}
                          {status === 'assigned' && (activeRole === 'driver' || activeRole === 'dispatcher' || activeRole === 'super_admin') && (
                            <button
                              disabled={actionLoading === delivery._id}
                              onClick={() => handleUpdateStatus(delivery._id, 'picked_up')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 text-black text-2xs font-bold hover:bg-amber-600 shadow-sm"
                            >
                              <HiOutlineCheck className="w-3 h-3" />
                              Picked Up
                            </button>
                          )}
                          {status === 'picked_up' && (activeRole === 'driver' || activeRole === 'dispatcher' || activeRole === 'super_admin') && (
                            <button
                              disabled={actionLoading === delivery._id}
                              onClick={() => handleUpdateStatus(delivery._id, 'out_for_delivery')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 text-white text-2xs font-bold hover:bg-blue-700 shadow-sm"
                            >
                              Out for Delivery
                            </button>
                          )}
                          {status === 'out_for_delivery' && (activeRole === 'driver' || activeRole === 'dispatcher' || activeRole === 'super_admin') && (
                            <button
                              disabled={actionLoading === delivery._id}
                              onClick={() => handleUpdateStatus(delivery._id, 'delivered')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-600 text-white text-2xs font-bold hover:bg-green-700 shadow-sm"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {/* Quick Details Modal */}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setTrackModalOpen(true);
                            }}
                            title="Quick Details"
                          >
                            <HiOutlineEye className="w-3.5 h-3.5 text-slate-400" />
                            Preview
                          </Button>

                          {/* Full Tracking Page Link */}
                          <Link
                            to={`/deliveries/${delivery._id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-2xs font-bold border border-amber-500/30 transition-all"
                            title="Open Live Tracking & Status History"
                          >
                            <HiOutlineEye className="w-3.5 h-3.5" />
                            Track
                          </Link>

                          {/* Pre-pickup Cancellation */}
                          {canCancel && (activeRole === 'client_admin' || activeRole === 'dispatcher' || activeRole === 'super_admin') && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Client Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Restaurant Client *
              </label>
              {activeRole === 'client_admin' ? (
                <input
                  type="text"
                  disabled
                  value={user?.client?.companyName || user?.name || "Your Restaurant"}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#222222] border border-slate-300 dark:border-[#404040] text-xs font-semibold text-amber-500 cursor-not-allowed"
                />
              ) : (
                <select
                  value={newOrder.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.companyName} ({c.businessType || 'RESTAURANT'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Branch Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Outlet *
              </label>
              <select
                required
                value={newOrder.branchId}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                {createBranches.length === 0 ? (
                  <option value="">No branches registered</option>
                ) : (
                  createBranches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.branchName} ({b.branchCode})
                    </option>
                  ))
                )}
              </select>
            </div>
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
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pickup Address (Outlet) *
            </label>
            <input
              type="text"
              required
              value={newOrder.pickupAddress}
              onChange={(e) => setNewOrder({ ...newOrder, pickupAddress: e.target.value })}
              placeholder="Outlet pickup address"
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Delivery Address *
              </label>
              <input
                type="text"
                required
                placeholder="Flat 101, Prestige Tech Park, Pune"
                value={newOrder.deliveryAddress}
                onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={newOrder.city}
                onChange={(e) => setNewOrder({ ...newOrder, city: e.target.value })}
                placeholder="City"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Order Items
              </label>
              <input
                type="text"
                placeholder="2x Pizza, 1x Coke"
                value={newOrder.items}
                onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bill Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="499"
                value={newOrder.totalAmount}
                onChange={(e) => setNewOrder({ ...newOrder, totalAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Mode
              </label>
              <select
                value={newOrder.paymentMethod}
                onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="PREPAID">Prepaid</option>
                <option value="COD">Cash on Delivery</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={createSubmitting}>
              {createSubmitting ? 'Creating...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manual Driver & Vehicle Assignment Modal */}
      {selectedDelivery && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Fleet: Order #${selectedDelivery.orderId}`}
          size="md"
        >
          <form onSubmit={handleConfirmAssign} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Restaurant:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedDelivery.client?.companyName || 'Restaurant'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Branch:</span>
                <span className="font-bold text-amber-500">
                  {selectedDelivery.branch?.branchName || 'Main Outlet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {selectedDelivery.customerName} ({selectedDelivery.customerPhone})
                </span>
              </div>
            </div>

            {assignLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block mr-2" />
                Scanning available drivers & vehicles in this fleet...
              </div>
            ) : (
              <>
                {/* Driver Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Available Driver *
                  </label>
                  {availableDrivers.length === 0 ? (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs">
                      No available drivers found for this restaurant fleet. Drivers must be active and not on delivery.
                    </div>
                  ) : (
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      {availableDrivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.firstName} {d.lastName} ({d.phone}) — {d.branch?.branchName || 'Branch'} [
                          {d.availability}]
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Available Vehicle (Bike / Scooter) *
                  </label>
                  {availableVehicles.length === 0 ? (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs">
                      No available vehicles found for this restaurant fleet. Vehicles must be available and not under maintenance.
                    </div>
                  ) : (
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      {availableVehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.vehicleNumber} ({v.brand} {v.model || v.vehicleType}) — {v.branch?.branchName || 'Branch'} [
                          {v.availability}]
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={assignLoading || assignSubmitting || availableDrivers.length === 0 || availableVehicles.length === 0}
              >
                {assignSubmitting ? 'Assigning...' : 'Confirm Assignment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Comprehensive Details & Tracking Modal */}
      {selectedDelivery && (
        <Modal
          isOpen={trackModalOpen}
          onClose={() => setTrackModalOpen(false)}
          title={`Delivery Details: #${selectedDelivery.orderId}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Status & Highlights */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E]">
              <div>
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold block">
                  Current Lifecycle Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={selectedDelivery.status} size="md" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold block">
                  Total Bill Amount
                </span>
                <span className="text-base font-bold text-amber-500">
                  ₹{selectedDelivery.totalAmount || 0}
                </span>
                <span className="text-2xs text-slate-400 block">
                  {selectedDelivery.paymentMethod || 'PREPAID'}
                </span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Restaurant & Customer */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] space-y-2">
                <h4 className="text-2xs uppercase font-bold text-amber-500 flex items-center gap-1">
                  <HiOutlineBuildingOffice2 className="w-3.5 h-3.5" />
                  Restaurant & Outlet
                </h4>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedDelivery.client?.companyName || 'Restaurant Client'}
                  </p>
                  <p className="text-slate-500 text-2xs">
                    Branch: {selectedDelivery.branch?.branchName || 'Main Outlet'} (
                    {selectedDelivery.branch?.branchCode || 'N/A'})
                  </p>
                  <p className="text-slate-400 text-2xs mt-0.5">
                    Pickup: {selectedDelivery.pickupLocation?.address || selectedDelivery.branch?.address || 'Outlet Address'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-[#2E2E2E]">
                  <span className="text-2xs font-semibold text-slate-500">Customer Dropoff:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedDelivery.customerName} ({selectedDelivery.customerPhone})
                  </p>
                  <p className="text-slate-400 text-2xs">
                    📍 {selectedDelivery.deliveryLocation?.address}
                  </p>
                </div>
              </div>

              {/* Fleet Assignment */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] space-y-2">
                <h4 className="text-2xs uppercase font-bold text-amber-500 flex items-center gap-1">
                  <HiOutlineTruck className="w-3.5 h-3.5" />
                  Assigned Fleet Resources
                </h4>
                {selectedDelivery.assignedDriver ? (
                  <div>
                    <span className="text-2xs text-slate-500">Rider:</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {selectedDelivery.assignedDriver.firstName} {selectedDelivery.assignedDriver.lastName}
                    </p>
                    <p className="text-2xs text-slate-400">
                      Phone: {selectedDelivery.assignedDriver.phone} | Emp ID: {selectedDelivery.assignedDriver.employeeId || 'N/A'}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xs text-slate-400 italic">No driver assigned yet.</p>
                )}

                {selectedDelivery.assignedVehicle ? (
                  <div className="pt-1 border-t border-slate-200 dark:border-[#2E2E2E]">
                    <span className="text-2xs text-slate-500">Vehicle:</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {selectedDelivery.assignedVehicle.vehicleNumber}
                    </p>
                    <p className="text-2xs text-slate-400">
                      {selectedDelivery.assignedVehicle.brand} {selectedDelivery.assignedVehicle.model} ({selectedDelivery.assignedVehicle.vehicleType})
                    </p>
                  </div>
                ) : (
                  <p className="text-2xs text-slate-400 italic">No vehicle assigned yet.</p>
                )}

                {selectedDelivery.deliveredAt && (
                  <div className="pt-1 border-t border-slate-200 dark:border-[#2E2E2E] text-green-500 font-semibold text-2xs">
                    ✅ Delivered At: {new Date(selectedDelivery.deliveredAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Cancellation Details if Cancelled */}
            {selectedDelivery.status === 'cancelled' && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs space-y-1">
                <span className="font-bold text-red-500 block">Delivery Cancelled</span>
                <p className="text-slate-300 text-2xs">
                  <span className="font-semibold text-slate-400">Reason: </span>
                  {selectedDelivery.cancellationReason || 'No reason provided'}
                </p>
                {selectedDelivery.cancelledAt && (
                  <p className="text-slate-400 text-2xs">
                    <span className="font-semibold">Cancelled At: </span>
                    {new Date(selectedDelivery.cancelledAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Interactive Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Order Timeline & Event Log
              </h4>
              <div className="relative pl-6 space-y-4 border-l-2 border-amber-500/40 ml-2 max-h-52 overflow-y-auto">
                {selectedDelivery.timeline?.map((step, idx) => {
                  const timeStr = step.timestamp
                    ? new Date(step.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                    : 'Recent';

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
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#262626]">
              <Link
                to={`/deliveries/${selectedDelivery._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-all shadow-sm"
              >
                <HiOutlineEye className="w-4 h-4 text-black" />
                Open Full Tracking Page
              </Link>
              <Button variant="secondary" size="sm" onClick={() => setTrackModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancellation Reason Modal */}
      {selectedDelivery && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title={`Cancel Order #${selectedDelivery.orderId}`}
          size="sm"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to cancel this delivery request? Any assigned driver and vehicle will be immediately released back to the available pool.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cancellation Reason *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Reason for cancellation (e.g. Customer cancelled order)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
                Go Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmCancel}
                disabled={actionLoading === selectedDelivery._id || !cancelReason.trim()}
              >
                {actionLoading === selectedDelivery._id ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DeliveryListPage;
