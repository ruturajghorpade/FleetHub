// FleetHub – Driver Partners & Fleet Riders Management Page
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineTruck,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineXMark,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import driverService from '@/services/driverService';
import clientService from '@/services/clientService';
import branchService from '@/services/branchService';
import vehicleService from '@/services/vehicleService';
import { showError, showSuccess } from '@/utils/toastUtils';
import { useAuth } from '@/context/AuthContext';

const DriverListPage = () => {
  const { activeRole } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDriverForVehicle, setSelectedDriverForVehicle] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    licenseNumber: '',
    phone: '',
    email: '',
    client: '',
    branch: '',
    status: 'available',
    availability: 'AVAILABLE',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [drvRes, cliRes, braRes, vehRes] = await Promise.all([
        driverService.getDrivers({ limit: 100 }),
        clientService.getClients({ limit: 50 }),
        branchService.getBranches({ limit: 50 }),
        vehicleService.getVehicles({ limit: 100 }),
      ]);
      setDrivers(drvRes.drivers || []);
      setClients(cliRes.clients || []);
      setBranches(braRes.branches || []);
      setVehicles(vehRes.vehicles || []);

      if (cliRes.clients?.length > 0 && braRes.branches?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          client: cliRes.clients[0]._id,
          branch: braRes.branches[0]._id,
        }));
      }
    } catch (err) {
      showError(err.message || 'Failed to load driver fleet data');
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const avail = (d.availability || d.status || 'AVAILABLE').toUpperCase();
      if (statusFilter !== 'all') {
        if (statusFilter === 'AVAILABLE' && !avail.includes('AVAIL')) return false;
        if (statusFilter === 'BUSY' && !avail.includes('BUSY') && !avail.includes('DUTY')) return false;
        if (statusFilter === 'OFFLINE' && !avail.includes('OFF')) return false;
      }

      if (clientFilter !== 'all') {
        const clientObjId = d.client?._id || d.client;
        if (clientObjId !== clientFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${d.firstName || ''} ${d.lastName || ''}`.toLowerCase();
        const empId = (d.employeeId || '').toLowerCase();
        const license = (d.licenseNumber || '').toLowerCase();
        const phone = (d.phone || '').toLowerCase();
        if (!fullName.includes(q) && !empId.includes(q) && !license.includes(q) && !phone.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [drivers, statusFilter, clientFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingDriver(null);
    setFormData({
      firstName: '',
      lastName: '',
      employeeId: `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
      licenseNumber: `DL-${Math.floor(10000000 + Math.random() * 90000000)}`,
      phone: '',
      email: '',
      client: clients[0]?._id || '',
      branch: branches[0]?._id || '',
      status: 'available',
      availability: 'AVAILABLE',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({
      firstName: driver.firstName || '',
      lastName: driver.lastName || '',
      employeeId: driver.employeeId || '',
      licenseNumber: driver.licenseNumber || '',
      phone: driver.phone || '',
      email: driver.email || '',
      client: driver.client?._id || driver.client || '',
      branch: driver.branch?._id || driver.branch || '',
      status: driver.status || 'available',
      availability: driver.availability?.toUpperCase() || 'AVAILABLE',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.employeeId.trim() || !formData.licenseNumber.trim()) {
      showError('Please fill in all required driver details');
      return;
    }

    setSubmitting(true);
    try {
      if (editingDriver) {
        await driverService.updateDriver(editingDriver._id, formData);
        showSuccess(`Rider ${formData.firstName} updated successfully`);
      } else {
        await driverService.createDriver(formData);
        showSuccess(`Rider ${formData.firstName} added to fleet`);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to save driver partner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!driverToDelete) return;
    setSubmitting(true);
    try {
      await driverService.deleteDriver(driverToDelete._id);
      showSuccess(`Rider ${driverToDelete.firstName} removed`);
      setDeleteConfirmOpen(false);
      setDriverToDelete(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAssignVehicle = (driver) => {
    setSelectedDriverForVehicle(driver);
    setSelectedVehicleId(driver.assignedVehicle?._id || driver.assignedVehicle || '');
    setAssignModalOpen(true);
  };

  const handleSaveVehicleAssignment = async () => {
    if (!selectedDriverForVehicle) return;
    setSubmitting(true);
    try {
      if (selectedVehicleId) {
        await driverService.assignVehicle(selectedDriverForVehicle._id, selectedVehicleId);
        showSuccess('Vehicle assigned to driver successfully');
      } else {
        await driverService.removeVehicle(selectedDriverForVehicle._id);
        showSuccess('Vehicle unassigned from driver');
      }
      setAssignModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to update vehicle assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (avail, status) => {
    const s = (avail || status || '').toUpperCase();
    if (s.includes('AVAIL')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Available
        </span>
      );
    }
    if (s.includes('BUSY') || s.includes('DUTY')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          On Delivery
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#242424] text-[#A3A3A3] border border-[#333333]">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        Offline
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Driver Partners & Riders"
        subtitle="Manage fast food delivery riders, KYC licenses, shift availability, and assigned EV vehicles."
        actions={
          activeRole !== 'driver' && (
            <Button
              variant="primary"
              leftIcon={<HiOutlinePlus className="w-5 h-5" />}
              onClick={handleOpenCreateModal}
            >
              Add New Rider
            </Button>
          )
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Total Fleet Riders</p>
          <p className="text-2xl font-black text-white mt-1">{drivers.length}</p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-emerald-400 uppercase tracking-wider">Available For Dispatch</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {drivers.filter((d) => (d.availability || d.status || '').toUpperCase().includes('AVAIL')).length}
          </p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-amber-400 uppercase tracking-wider">On Active Delivery</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {drivers.filter((d) => {
              const s = (d.availability || d.status || '').toUpperCase();
              return s.includes('BUSY') || s.includes('DUTY');
            }).length}
          </p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Vehicles</p>
          <p className="text-2xl font-black text-white mt-1">
            {drivers.filter((d) => d.assignedVehicle).length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            <input
              type="text"
              placeholder="Search rider, ID, license, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">On Delivery / Busy</option>
              <option value="OFFLINE">Offline</option>
            </select>

            {/* Client Filter */}
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">All Restaurant Clients</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Drivers Table */}
      <Card className="overflow-hidden border border-[#2E2E2E]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] border-b border-[#2E2E2E] text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]">
                <th className="py-3 px-4">Rider Details</th>
                <th className="py-3 px-4">Client & Branch</th>
                <th className="py-3 px-4">License & Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Vehicle</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424] text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#A3A3A3]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading fleet drivers...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#A3A3A3]">
                    <HiOutlineUser className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    No driver partners found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const clientName = driver.client?.name || 'FastFleet Operations';
                  const branchName = driver.branch?.name || 'Main Hub';
                  const assignedVeh = driver.assignedVehicle?.vehicleNumber
                    ? `${driver.assignedVehicle.vehicleNumber} (${driver.assignedVehicle.brand || 'EV'})`
                    : null;

                  return (
                    <tr key={driver._id} className="hover:bg-[#161616] transition-colors">
                      {/* Rider Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {driver.firstName?.[0]}
                            {driver.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">
                              {driver.firstName} {driver.lastName}
                            </p>
                            <p className="text-xs text-amber-500/80 font-mono mt-0.5">
                              {driver.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Client & Branch */}
                      <td className="py-3.5 px-4">
                        <p className="text-white font-medium">{clientName}</p>
                        <p className="text-xs text-[#A3A3A3]">{branchName}</p>
                      </td>

                      {/* License & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                            <HiOutlineIdentification className="w-3.5 h-3.5 text-amber-400" />
                            {driver.licenseNumber}
                          </div>
                          {driver.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
                              <HiOutlinePhone className="w-3.5 h-3.5 text-slate-500" />
                              {driver.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(driver.availability, driver.status)}
                      </td>

                      {/* Assigned Vehicle */}
                      <td className="py-3.5 px-4">
                        {assignedVeh ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1A1A1A] border border-[#2E2E2E] text-xs font-mono text-amber-300">
                            <HiOutlineTruck className="w-3.5 h-3.5 text-amber-400" />
                            {assignedVeh}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">None assigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAssignVehicle(driver)}
                            title="Assign / Change Vehicle"
                            className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                          >
                            <HiOutlineTruck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(driver)}
                            title="Edit Rider Details"
                            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </button>
                          {activeRole === 'super_admin' && (
                            <button
                              onClick={() => {
                                setDriverToDelete(driver);
                                setDeleteConfirmOpen(true);
                              }}
                              title="Delete Rider"
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
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

      {/* Add / Edit Driver Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDriver ? `Edit Rider: ${editingDriver.firstName}` : 'Add New Driver Partner'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="e.g. Rahul"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="e.g. Verma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
                placeholder="e.g. DRV-105"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Driving License Number *
              </label>
              <input
                type="text"
                required
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
                placeholder="e.g. MH-12-20230045"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="e.g. +91 9876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="e.g. rider@fastfleet.in"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Restaurant Client *
              </label>
              <select
                required
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              >
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Branch / Hub *
              </label>
              <select
                required
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Availability Status
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BUSY">BUSY (ON ACTIVE DELIVERY)</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Driver Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              >
                <option value="available">Available</option>
                <option value="on-duty">On Duty</option>
                <option value="off-duty">Off Duty</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2E2E2E]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              {editingDriver ? 'Save Changes' : 'Register Rider'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Vehicle to ${selectedDriverForVehicle?.firstName || 'Rider'}`}
        size="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-[#A3A3A3]">
            Select a fleet bike, scooter, or EV to assign to this rider for food delivery dispatches.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
              Select Fleet Vehicle
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
            >
              <option value="">-- No Vehicle Assigned (Unassign) --</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.vehicleNumber} – {v.brand} {v.model} ({v.vehicleType?.replace('_', ' ') || 'Bike'}) [{v.availability}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2E2E2E]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={submitting}
              onClick={handleSaveVehicleAssignment}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remove Driver Partner"
        message={`Are you sure you want to remove rider ${driverToDelete?.firstName} ${driverToDelete?.lastName}? This action cannot be undone.`}
        confirmText="Delete Rider"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  );
};

export default DriverListPage;
