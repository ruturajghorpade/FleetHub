// FleetHub – Delivery Details & Status Tracking Page (Food Delivery Logistics)
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineBuildingOffice2,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineCurrencyRupee,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineNoSymbol,
  HiOutlineCheck,
  HiOutlineArrowPath,
  HiOutlineDocumentText,
  HiOutlineShoppingBag,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/context/AuthContext';
import deliveryService from '@/services/deliveryService';
import { showError, showSuccess } from '@/utils/toastUtils';
import ROUTES from '@/config/routeConfig';

// Standard forward progression steps
const PROGRESS_STEPS = [
  {
    key: 'pending',
    label: 'Order Created',
    desc: 'Delivery request submitted by restaurant',
  },
  {
    key: 'assigned',
    label: 'Fleet Assigned',
    desc: 'Rider & vehicle assigned for delivery',
  },
  {
    key: 'picked_up',
    label: 'Order Picked Up',
    desc: 'Food picked up from outlet kitchen',
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    desc: 'Rider in transit to destination',
  },
  {
    key: 'delivered',
    label: 'Order Delivered',
    desc: 'Food safely delivered to customer',
  },
];

const STEP_INDEX_MAP = {
  pending: 0,
  assigned: 1,
  picked_up: 2,
  out_for_delivery: 3,
  delivered: 4,
};

const DeliveryDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeRole } = useAuth();

  const [delivery, setDelivery] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Cancellation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch Delivery Details & History
  const fetchDeliveryData = useCallback(async (isSilent = false) => {
    if (!id) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [deliveryRes, historyRes] = await Promise.all([
        deliveryService.getDeliveryById(id),
        deliveryService.getDeliveryHistory(id).catch(() => null),
      ]);

      if (!deliveryRes) {
        throw new Error('Delivery not found');
      }

      setDelivery(deliveryRes);
      setHistoryData(historyRes);
    } catch (err) {
      console.error('Error loading delivery tracking:', err);
      setError(
        err.response?.data?.message || err.message || 'Unable to load delivery information'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeliveryData();
  }, [fetchDeliveryData]);

  // Handle Driver Status Advancement
  const handleUpdateStatus = async (nextStatus, customNote) => {
    if (!delivery) return;
    setActionLoading(true);
    try {
      const updated = await deliveryService.updateStatus(delivery._id, {
        status: nextStatus,
        note: customNote,
      });
      showSuccess(`Status updated to ${nextStatus.replace(/_/g, ' ').toUpperCase()}`);
      setDelivery(updated);
      await fetchDeliveryData(true);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Pre-pickup Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      showError('Please enter a cancellation reason');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await deliveryService.cancelDelivery(delivery._id, {
        reason: cancelReason.trim(),
      });
      showSuccess(`Order #${delivery.orderId} has been cancelled`);
      setDelivery(updated);
      setCancelModalOpen(false);
      setCancelReason('');
      await fetchDeliveryData(true);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel delivery');
    } finally {
      setActionLoading(false);
    }
  };

  // Check Permissions
  const isCancelled = delivery?.status === 'cancelled';
  const isDelivered = delivery?.status === 'delivered';
  const currentStepIndex = STEP_INDEX_MAP[delivery?.status] ?? -1;

  const canCancel =
    !isCancelled &&
    !isDelivered &&
    ['pending', 'assigned'].includes(delivery?.status) &&
    ['super_admin', 'client_admin', 'dispatcher'].includes(activeRole);

  const isAssignedDriver = useMemo(() => {
    if (activeRole !== 'driver' && activeRole !== 'super_admin' && activeRole !== 'dispatcher') {
      return false;
    }
    if (activeRole === 'super_admin' || activeRole === 'dispatcher') return true;
    // For driver, verify assignedDriver document or match
    if (!delivery?.assignedDriver) return false;
    const driverId = typeof delivery.assignedDriver === 'object'
      ? delivery.assignedDriver._id
      : delivery.assignedDriver;
    const userDriverId = user?.driverId || user?._id;
    return Boolean(driverId);
  }, [delivery, activeRole, user]);

  // Map timeline events to dictionary for fast lookup
  const timelineEventsMap = useMemo(() => {
    const map = {};
    if (!delivery?.timeline) return map;
    delivery.timeline.forEach((event) => {
      map[event.status] = event;
    });
    return map;
  }, [delivery]);

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in p-6 text-center">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading delivery tracking details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !delivery) {
    return (
      <div className="space-y-6 animate-fade-in max-w-xl mx-auto my-12 text-center">
        <Card className="p-8 border-red-500/20 bg-red-500/5">
          <HiOutlineXCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Unable to Load Delivery
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {error || 'The requested delivery does not exist or you do not have permission to view it.'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.DELIVERIES)}>
              <HiOutlineArrowLeft className="w-4 h-4" />
              Back to Deliveries
            </Button>
            <Button variant="primary" size="sm" onClick={() => fetchDeliveryData()}>
              <HiOutlineArrowPath className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title={`Delivery #${delivery.orderId}`}
        subtitle={`Tracking & Status Timeline • Created ${new Date(delivery.createdAt).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.DELIVERIES)}
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              All Deliveries
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={refreshing}
              onClick={() => fetchDeliveryData(true)}
              title="Refresh Live Status"
            >
              <HiOutlineArrowPath className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* ── 1. Status Overview Banner ─────────────────────────────────── */}
      <Card className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-[#161616] to-[#121212] border-slate-800 text-white shadow-xl relative overflow-hidden">
        {/* Ambient accent background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
                Order ID: {delivery.orderId}
              </span>
              {delivery.trackingId && (
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono">
                  Track: {delivery.trackingId}
                </span>
              )}
              <StatusBadge status={delivery.status} size="md" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {delivery.client?.companyName || 'Restaurant Client'}
              {delivery.branch && (
                <span className="text-sm font-normal text-slate-400 ml-2">
                  • {delivery.branch.branchName} ({delivery.branch.branchCode})
                </span>
              )}
            </h2>

            <p className="text-xs text-slate-300 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <HiOutlineMapPin className="w-3.5 h-3.5 text-amber-500" />
                Dropoff: <strong className="text-white font-medium">{delivery.deliveryLocation?.address}</strong>
              </span>
              <span className="flex items-center gap-1">
                <HiOutlineClock className="w-3.5 h-3.5 text-slate-400" />
                Est: {delivery.estimatedDeliveryTime || '30-40 mins'}
              </span>
            </p>
          </div>

          {/* Quick Actions for Driver & Dispatcher */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            {/* Driver advance: Assigned -> Picked Up */}
            {delivery.status === 'assigned' && isAssignedDriver && (
              <Button
                variant="primary"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('picked_up', 'Order picked up at outlet kitchen')}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-lg"
              >
                <HiOutlineCheck className="w-4 h-4" />
                Mark Picked Up
              </Button>
            )}

            {/* Driver advance: Picked Up -> Out For Delivery */}
            {delivery.status === 'picked_up' && isAssignedDriver && (
              <Button
                variant="primary"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('out_for_delivery', 'Rider departed outlet. Out for delivery')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg"
              >
                <HiOutlineTruck className="w-4 h-4" />
                Start Delivery (Out for Delivery)
              </Button>
            )}

            {/* Driver advance: Out For Delivery -> Delivered */}
            {delivery.status === 'out_for_delivery' && isAssignedDriver && (
              <Button
                variant="primary"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('delivered', 'Order delivered safely to customer')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg"
              >
                <HiOutlineCheckCircle className="w-4 h-4" />
                Complete Delivery (Mark Delivered)
              </Button>
            )}

            {/* Cancel Button */}
            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                disabled={actionLoading}
                onClick={() => setCancelModalOpen(true)}
              >
                <HiOutlineNoSymbol className="w-4 h-4" />
                Cancel Delivery
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── 2. Cancellation Banner (If Cancelled) ────────────────────── */}
      {isCancelled && (
        <Card className="p-4 sm:p-5 border-red-500/30 bg-red-500/10 dark:bg-red-950/20 text-red-400">
          <div className="flex items-start gap-3">
            <HiOutlineXCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-500">Delivery Cancelled</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Cancellation Reason: </span>
                {delivery.cancellationReason || 'Reason not recorded'}
              </p>
              <div className="flex items-center gap-4 text-2xs text-slate-500 dark:text-slate-400 pt-1">
                {delivery.cancelledAt && (
                  <span>Cancelled on: {new Date(delivery.cancelledAt).toLocaleString()}</span>
                )}
                {delivery.cancelledBy && (
                  <span>
                    Cancelled by: {delivery.cancelledBy.name} ({delivery.cancelledBy.role})
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── 3. Visual Status Stepper / Progress Timeline ─────────────── */}
      <Card className="p-5 sm:p-6 border-slate-200 dark:border-[#262626] bg-white dark:bg-[#141414]">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-[#222222]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Delivery Status Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live lifecycle state transition from kitchen preparation to doorstep delivery
            </p>
          </div>
          {delivery.deliveredAt && (
            <span className="text-2xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
              Completed {new Date(delivery.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Desktop Stepper */}
        <div className="hidden md:grid md:grid-cols-5 gap-2 relative">
          {PROGRESS_STEPS.map((step, idx) => {
            const isCompleted = !isCancelled && currentStepIndex >= idx;
            const isCurrent = !isCancelled && currentStepIndex === idx;
            const isPending = !isCancelled && currentStepIndex < idx;
            const stepEvent = timelineEventsMap[step.key];

            return (
              <div key={step.key} className="relative flex flex-col items-center text-center px-2">
                {/* Connecting connector line */}
                {idx < PROGRESS_STEPS.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 z-0 transition-colors ${
                      isCompleted && currentStepIndex > idx
                        ? 'bg-amber-500'
                        : 'bg-slate-200 dark:bg-[#282828]'
                    }`}
                  />
                )}

                {/* Node icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all ${
                    isCompleted
                      ? 'bg-amber-500 text-black shadow-md ring-4 ring-amber-500/20'
                      : isCurrent
                      ? 'bg-amber-500 text-black ring-4 ring-amber-500/30 animate-pulse'
                      : 'bg-slate-100 dark:bg-[#222222] text-slate-400 border border-slate-300 dark:border-[#333333]'
                  }`}
                >
                  {isCompleted ? <HiOutlineCheck className="w-4 h-4 text-black stroke-[3]" /> : idx + 1}
                </div>

                {/* Step Labels */}
                <div className="mt-3 space-y-1">
                  <p
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-amber-500'
                        : isCompleted
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {step.desc}
                  </p>
                  {stepEvent?.timestamp && (
                    <p className="text-2xs font-mono font-medium text-amber-600 dark:text-amber-400 pt-0.5">
                      {new Date(stepEvent.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile / Responsive Vertical Stepper */}
        <div className="md:hidden space-y-4 relative pl-6 border-l-2 border-slate-200 dark:border-[#2E2E2E] ml-3">
          {PROGRESS_STEPS.map((step, idx) => {
            const isCompleted = !isCancelled && currentStepIndex >= idx;
            const isCurrent = !isCancelled && currentStepIndex === idx;
            const stepEvent = timelineEventsMap[step.key];

            return (
              <div key={step.key} className="relative pb-2">
                {/* Node badge */}
                <span
                  className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-3xs font-bold ring-4 ring-white dark:ring-[#141414] ${
                    isCompleted
                      ? 'bg-amber-500 text-black'
                      : isCurrent
                      ? 'bg-amber-500 text-black animate-pulse'
                      : 'bg-slate-300 dark:bg-[#333333] text-transparent'
                  }`}
                />
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-amber-500'
                          : isCompleted
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {stepEvent?.timestamp && (
                      <span className="text-2xs font-mono text-amber-500">
                        {new Date(stepEvent.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-2xs text-slate-500 dark:text-slate-400">{step.desc}</p>
                  {stepEvent?.note && (
                    <p className="text-2xs text-slate-600 dark:text-slate-300 italic pt-0.5">
                      "{stepEvent.note}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Cancelled extra node if cancelled */}
          {isCancelled && (
            <div className="relative pt-2">
              <span className="absolute -left-[31px] top-2.5 w-4 h-4 rounded-full bg-red-500 ring-4 ring-white dark:ring-[#141414]" />
              <p className="text-xs font-bold text-red-500">Cancelled</p>
              <p className="text-2xs text-red-400">
                {delivery.cancellationReason || 'Order cancelled before completion'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* ── 4. Main Information Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Restaurant, Customer & Fleet Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pickup & Destination Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Restaurant Pickup Card */}
            <Card className="p-4 sm:p-5 border-slate-200 dark:border-[#262626]">
              <div className="flex items-center gap-2 mb-3 text-amber-500 font-bold text-xs uppercase tracking-wider">
                <HiOutlineBuildingOffice2 className="w-4 h-4" />
                Pickup Location (Restaurant)
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {delivery.pickupLocation?.name || delivery.client?.companyName}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  {delivery.pickupLocation?.address || delivery.branch?.address || 'Main Outlet Address'}
                </p>
                {delivery.branch && (
                  <p className="text-2xs text-slate-400">
                    Branch Code: <span className="font-mono text-amber-500 font-bold">{delivery.branch.branchCode}</span>
                  </p>
                )}
                {delivery.pickupLocation?.phone && (
                  <p className="text-2xs text-slate-400 flex items-center gap-1 pt-1">
                    <HiOutlinePhone className="w-3.5 h-3.5 text-slate-500" />
                    {delivery.pickupLocation.phone}
                  </p>
                )}
                {delivery.pickupLocation?.instructions && (
                  <div className="p-2 rounded bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-2xs mt-2">
                    <strong>Pickup Note: </strong>{delivery.pickupLocation.instructions}
                  </div>
                )}
              </div>
            </Card>

            {/* Customer Dropoff Card */}
            <Card className="p-4 sm:p-5 border-slate-200 dark:border-[#262626]">
              <div className="flex items-center gap-2 mb-3 text-amber-500 font-bold text-xs uppercase tracking-wider">
                <HiOutlineMapPin className="w-4 h-4" />
                Delivery Destination (Customer)
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {delivery.customerName}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  {delivery.deliveryLocation?.address}
                </p>
                {delivery.deliveryLocation?.landmark && (
                  <p className="text-2xs text-slate-400">
                    Landmark: {delivery.deliveryLocation.landmark}
                  </p>
                )}
                <p className="text-2xs text-slate-400 flex items-center gap-1 pt-1">
                  <HiOutlinePhone className="w-3.5 h-3.5 text-slate-500" />
                  {delivery.customerPhone}
                </p>
                {delivery.deliveryLocation?.instructions && (
                  <div className="p-2 rounded bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] text-slate-600 dark:text-slate-400 text-2xs mt-2">
                    <strong>Drop Note: </strong>{delivery.deliveryLocation.instructions}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Assigned Fleet Resources Card */}
          <Card className="p-5 border-slate-200 dark:border-[#262626]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#222222]">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                <HiOutlineTruck className="w-4 h-4" />
                Assigned Fleet Partner & Vehicle
              </div>
              <span className="text-2xs text-slate-400 font-mono">
                {delivery.assignedAt
                  ? `Assigned ${new Date(delivery.assignedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`
                  : 'Awaiting Assignment'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Driver Details */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] space-y-2">
                <span className="text-2xs uppercase tracking-wider font-semibold text-slate-400 block">
                  Delivery Partner (Rider)
                </span>
                {delivery.assignedDriver ? (
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {delivery.assignedDriver.firstName} {delivery.assignedDriver.lastName}
                    </p>
                    <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Emp ID: <span className="font-mono">{delivery.assignedDriver.employeeId || 'N/A'}</span>
                    </p>
                    {delivery.assignedDriver.phone && (
                      <p className="text-2xs text-slate-400 flex items-center gap-1 mt-1">
                        <HiOutlinePhone className="w-3.5 h-3.5 text-slate-500" />
                        {delivery.assignedDriver.phone}
                      </p>
                    )}
                    {delivery.assignedDriver.rating && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-3xs border border-amber-500/20">
                        ★ {delivery.assignedDriver.rating.toFixed(1)} Rating
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">No rider assigned yet</p>
                )}
              </div>

              {/* Vehicle Details */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] space-y-2">
                <span className="text-2xs uppercase tracking-wider font-semibold text-slate-400 block">
                  Assigned Vehicle
                </span>
                {delivery.assignedVehicle ? (
                  <div>
                    <p className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm tracking-wide">
                      {delivery.assignedVehicle.vehicleNumber}
                    </p>
                    <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                      {delivery.assignedVehicle.brand} {delivery.assignedVehicle.model} ({delivery.assignedVehicle.vehicleType})
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold text-3xs border border-blue-500/20 uppercase">
                      {delivery.assignedVehicle.availability || 'On Delivery'}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">No vehicle assigned yet</p>
                )}
              </div>
            </div>
          </Card>

          {/* ── Chronological Status History Activity Log ────────────── */}
          <Card className="p-5 border-slate-200 dark:border-[#262626]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#222222]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-wider">
                <HiOutlineClock className="w-4 h-4 text-amber-500" />
                Chronological Audit & Status History
              </div>
              <span className="text-2xs text-slate-400">
                {delivery.timeline?.length || 0} events recorded
              </span>
            </div>

            {(!delivery.timeline || delivery.timeline.length === 0) ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No status history events available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#1A1A1A] text-slate-400 font-semibold text-2xs uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5 rounded-l">Status</th>
                      <th className="px-3 py-2.5">Timestamp</th>
                      <th className="px-3 py-2.5">Updated By</th>
                      <th className="px-3 py-2.5 rounded-r">Event Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#222222]">
                    {[...delivery.timeline]
                      .reverse()
                      .map((event, idx) => {
                        const eventUser = event.updatedBy;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#171717]">
                            <td className="px-3 py-2.5">
                              <StatusBadge status={event.status} size="xs" />
                            </td>
                            <td className="px-3 py-2.5 font-mono text-2xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Recent'}
                            </td>
                            <td className="px-3 py-2.5">
                              {eventUser ? (
                                <div>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 block text-2xs">
                                    {eventUser.name || 'Staff User'}
                                  </span>
                                  <span className="text-3xs uppercase font-mono text-amber-500">
                                    {eventUser.role || 'user'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-2xs text-slate-400 italic">System</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 text-2xs max-w-xs">
                              {event.note || 'Status updated'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Order Items & Financial Summary */}
        <div className="space-y-6">
          {/* Order Contents & Summary */}
          <Card className="p-5 border-slate-200 dark:border-[#262626]">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-[#222222] text-amber-500 font-bold text-xs uppercase tracking-wider">
              <HiOutlineShoppingBag className="w-4 h-4" />
              Order Items & Bill
            </div>

            {/* Items List */}
            <div className="space-y-2 mb-4">
              {delivery.items && delivery.items.length > 0 ? (
                delivery.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-[#202020] last:border-0"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </span>
                      <span className="text-2xs text-slate-400 block">
                        Qty: {item.quantity || 1}
                      </span>
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                      ₹{(item.price || 0) * (item.quantity || 1)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Standard Food Package</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-2xs">
                <span>Payment Mode:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {delivery.paymentMethod || 'PREPAID'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-2xs">
                <span>Delivery Fee:</span>
                <span className="text-green-500 font-semibold">Free (Included)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-[#2E2E2E] flex items-center justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
                <span>Total Amount:</span>
                <span className="text-amber-500 text-base font-black">
                  ₹{delivery.totalAmount || 0}
                </span>
              </div>
            </div>
          </Card>

          {/* Metadata Card */}
          <Card className="p-5 border-slate-200 dark:border-[#262626] text-xs space-y-2">
            <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400">
              System Audit Metadata
            </h4>
            <div className="space-y-1 text-2xs text-slate-500 dark:text-slate-400">
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Created: </strong>
                {new Date(delivery.createdAt).toLocaleString()}
              </p>
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Last Updated: </strong>
                {new Date(delivery.updatedAt).toLocaleString()}
              </p>
              {delivery.deliveredAt && (
                <p className="text-green-500 font-semibold">
                  <strong>Delivered: </strong>{new Date(delivery.deliveredAt).toLocaleString()}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Cancellation Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={`Cancel Order #${delivery.orderId}`}
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Cancelling this order will record the cancellation reason in the history timeline and release any assigned driver and vehicle back to the available pool.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cancellation Reason *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Customer cancelled order before dispatch..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-red-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={actionLoading || !cancelReason.trim()}
              onClick={handleConfirmCancel}
            >
              {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeliveryDetailsPage;
