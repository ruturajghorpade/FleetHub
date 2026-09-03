// FleetHub – Dispatcher Dashboard (Central Dispatch Operations)
import { useState } from 'react';
import {
  HiOutlineBolt,
  HiOutlineUserPlus,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiOutlineTruck,
  HiOutlineArrowPath,
  HiOutlineMapPin,
  HiOutlineBuildingStorefront,
} from 'react-icons/hi2';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import {
  MOCK_DELIVERIES,
  MOCK_DRIVERS,
  MOCK_VEHICLES,
} from '@/data/mockData';

const DispatcherDashboard = () => {
  const [deliveries, setDeliveries] = useState(MOCK_DELIVERIES);
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [notification, setNotification] = useState(null);

  // Manual Assign Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const pendingDeliveries = deliveries.filter((d) => d.status === 'pending');
  const activeAssignedDeliveries = deliveries.filter(
    (d) => d.status === 'assigned' || d.status === 'picked_up' || d.status === 'out_for_delivery'
  );

  const availableDrivers = drivers.filter((d) => d.availability === 'AVAILABLE');
  const availableVehicles = vehicles.filter((v) => v.availability === 'AVAILABLE');

  // 1-Click Auto Assign
  const handleAutoAssign = (deliveryId) => {
    const targetDelivery = deliveries.find((d) => d._id === deliveryId);
    if (!targetDelivery) return;

    if (availableDrivers.length === 0 || availableVehicles.length === 0) {
      setNotification({
        type: 'error',
        message: 'No available drivers or vehicles found for automatic assignment!',
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    const assignedDriver = availableDrivers[0];
    const assignedVehicle = availableVehicles[0];

    // Update delivery
    setDeliveries((prev) =>
      prev.map((d) =>
        d._id === deliveryId
          ? {
              ...d,
              status: 'assigned',
              driver: assignedDriver.name,
              driverId: assignedDriver._id,
              vehicle: assignedVehicle.vehicleNumber,
              vehicleType: assignedVehicle.vehicleType,
              estimatedDeliveryTime: '20-25 mins',
              timeline: [
                ...d.timeline,
                {
                  status: 'assigned',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  note: `Auto-assigned to ${assignedDriver.name} (${assignedVehicle.vehicleNumber})`,
                },
              ],
            }
          : d
      )
    );

    // Update driver availability
    setDrivers((prev) =>
      prev.map((dr) =>
        dr._id === assignedDriver._id
          ? { ...dr, availability: 'BUSY', vehicle: assignedVehicle.vehicleNumber }
          : dr
      )
    );

    // Update vehicle availability
    setVehicles((prev) =>
      prev.map((v) =>
        v._id === assignedVehicle._id ? { ...v, availability: 'ON_DELIVERY' } : v
      )
    );

    setNotification({
      type: 'success',
      message: `Order #${targetDelivery.orderId} auto-assigned to ${assignedDriver.name} (${assignedVehicle.vehicleNumber})!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Manual Assign Modal
  const openManualAssign = (delivery) => {
    setSelectedDelivery(delivery);
    setSelectedDriverId(availableDrivers[0]?._id || '');
    setSelectedVehicleId(availableVehicles[0]?._id || '');
    setAssignModalOpen(true);
  };

  // Submit Manual Assignment
  const handleManualAssignSubmit = () => {
    if (!selectedDriverId || !selectedVehicleId || !selectedDelivery) return;

    const assignedDriver = drivers.find((d) => d._id === selectedDriverId);
    const assignedVehicle = vehicles.find((v) => v._id === selectedVehicleId);

    setDeliveries((prev) =>
      prev.map((d) =>
        d._id === selectedDelivery._id
          ? {
              ...d,
              status: 'assigned',
              driver: assignedDriver.name,
              driverId: assignedDriver._id,
              vehicle: assignedVehicle.vehicleNumber,
              vehicleType: assignedVehicle.vehicleType,
              estimatedDeliveryTime: '20-25 mins',
              timeline: [
                ...d.timeline,
                {
                  status: 'assigned',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  note: `Manually assigned to ${assignedDriver.name} (${assignedVehicle.vehicleNumber})`,
                },
              ],
            }
          : d
      )
    );

    setDrivers((prev) =>
      prev.map((dr) =>
        dr._id === assignedDriver._id ? { ...dr, availability: 'BUSY' } : dr
      )
    );

    setVehicles((prev) =>
      prev.map((v) =>
        v._id === assignedVehicle._id ? { ...v, availability: 'ON_DELIVERY' } : v
      )
    );

    setAssignModalOpen(false);
    setNotification({
      type: 'success',
      message: `Order #${selectedDelivery.orderId} assigned to ${assignedDriver.name}!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`px-4 py-3 rounded-xl shadow-md border flex items-center justify-between text-sm font-medium transition-all ${
            notification.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
              : 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900 text-green-800 dark:text-green-200'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dispatch Overview KPIs */}
      <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <HiOutlineClock className="w-5 h-5" />
            </div>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              Action Required
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {pendingDeliveries.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pending Assignment</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
              In Transit
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {activeAssignedDeliveries.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Active Deliveries</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400">
              <HiOutlineUserGroup className="w-5 h-5" />
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {drivers.length} total
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {availableDrivers.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Available Riders</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
              <HiOutlineTruck className="w-5 h-5" />
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {vehicles.length} total
            </span>
          </div>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {availableVehicles.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Available Bikes / EVs</p>
        </div>
      </section>

      {/* Pending Delivery Requests (Dispatcher Assignment Hub) */}
      <Card padding="p-0" className="overflow-hidden border-2 border-amber-300 dark:border-amber-900/60 shadow-lg">
        <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-b border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Live Pending Requests Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fresh restaurant delivery requests waiting for rider assignment
              </p>
            </div>
          </div>
          <Badge variant="warning" size="md">
            {pendingDeliveries.length} Pending
          </Badge>
        </div>

        {pendingDeliveries.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <HiOutlineCheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              All delivery requests are assigned!
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              New requests from Domino's, KFC, and restaurants will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {pendingDeliveries.map((delivery) => (
              <div
                key={delivery._id}
                className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {delivery.orderId}
                    </span>
                    <span className="text-xs font-semibold text-primary-600 dark:text-secondary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-0.5 rounded-full">
                      {delivery.client}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      ₹{delivery.totalAmount}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400 font-medium">Pickup: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {delivery.pickupLocation.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Dropoff: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {delivery.deliveryLocation.address}
                      </span>
                    </div>
                  </div>

                  <p className="text-2xs text-slate-500 dark:text-slate-400 italic">
                    Items: {delivery.items}
                  </p>
                </div>

                {/* Assignment Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAutoAssign(delivery._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-bold shadow-sm transition-all hover:shadow"
                    title="Automatically find available driver and bike"
                  >
                    <HiOutlineBolt className="w-4 h-4 text-amber-300" />
                    Auto Assign
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openManualAssign(delivery)}
                  >
                    <HiOutlineUserPlus className="w-4 h-4" />
                    Manual Assign
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Fleet & Rider Availability Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rider Availability Table */}
        <Card padding="p-0" className="overflow-hidden">
          <Card.Header className="px-5 pt-5 pb-3">
            <div>
              <Card.Title>Delivery Partner Availability</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {availableDrivers.length} ready for new assignments
              </p>
            </div>
            <Badge variant="info" size="sm">
              Live Fleet
            </Badge>
          </Card.Header>

          <div className="overflow-x-auto max-h-[340px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">Rider</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">Phone</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">Assigned Bike</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {drivers.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {d.name}
                      <span className="block text-2xs text-amber-500 font-bold">★ {d.rating}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-2xs text-slate-600 dark:text-slate-300">
                      {d.phone}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-2xs font-bold ${
                          d.availability === 'AVAILABLE'
                            ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300'
                            : d.availability === 'BUSY'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {d.availability}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {d.vehicle || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Bike / Scooter Availability Table */}
        <Card padding="p-0" className="overflow-hidden">
          <Card.Header className="px-5 pt-5 pb-3">
            <div>
              <Card.Title>Bike & EV Fleet Availability</Card.Title>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {availableVehicles.length} vehicles available for dispatch
              </p>
            </div>
            <Badge variant="primary" size="sm">
              Hub Fleet
            </Badge>
          </Card.Header>

          <div className="overflow-x-auto max-h-[340px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">Reg No</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">Model</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">Type</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {v.vehicleNumber}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300">
                      {v.brand} {v.model}
                    </td>
                    <td className="px-4 py-2.5 text-2xs font-semibold text-slate-600 dark:text-slate-400">
                      {v.vehicleType}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-2xs font-bold ${
                          v.availability === 'AVAILABLE'
                            ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300'
                            : v.availability === 'ON_DELIVERY'
                            ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {v.availability}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Assigned / Active Deliveries */}
      <Card padding="p-0" className="overflow-hidden">
        <Card.Header className="px-5 pt-5 pb-3">
          <div>
            <Card.Title>Today's Assigned & Active Deliveries</Card.Title>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live tracking of orders en route to customers
            </p>
          </div>
        </Card.Header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Order ID</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Restaurant</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Customer & Destination</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500">Driver & Bike</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                <th className="px-5 py-2.5 text-xs font-semibold uppercase text-slate-500 text-right">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {activeAssignedDeliveries.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                    {d.orderId}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {d.client}
                  </td>
                  <td className="px-5 py-3 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{d.customerName}</p>
                    <p className="text-2xs text-slate-400 truncate max-w-[220px]">{d.deliveryLocation.address}</p>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{d.driver || '—'}</p>
                    <p className="text-2xs font-mono text-slate-400">{d.vehicle || '—'}</p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge status={d.status} size="sm" />
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-xs text-slate-600 dark:text-slate-300">
                    {d.estimatedDeliveryTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Assignment Modal */}
      {selectedDelivery && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Delivery #${selectedDelivery.orderId}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
              <p>
                <span className="text-slate-400 font-medium">Restaurant: </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedDelivery.client}
                </span>
              </p>
              <p>
                <span className="text-slate-400 font-medium">Customer: </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedDelivery.customerName} ({selectedDelivery.customerPhone})
                </span>
              </p>
              <p>
                <span className="text-slate-400 font-medium">Destination: </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {selectedDelivery.deliveryLocation.address}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Available Driver Partner
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-primary-500"
              >
                {availableDrivers.length === 0 ? (
                  <option value="">No available drivers</option>
                ) : (
                  availableDrivers.map((dr) => (
                    <option key={dr._id} value={dr._id}>
                      {dr.name} (★ {dr.rating}) — {dr.phone}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Available Vehicle (Bike / Scooter / EV)
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm outline-none focus:border-primary-500"
              >
                {availableVehicles.length === 0 ? (
                  <option value="">No available vehicles</option>
                ) : (
                  availableVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.vehicleNumber} — {v.brand} {v.model} ({v.vehicleType})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleManualAssignSubmit}
                disabled={!selectedDriverId || !selectedVehicleId}
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DispatcherDashboard;
