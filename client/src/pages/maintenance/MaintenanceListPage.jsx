// FleetHub – Fleet Vehicle Maintenance & EV Service Logs Page
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineWrenchScrewdriver,
  HiOutlineTruck,
  HiOutlineCurrencyRupee,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineClock,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import maintenanceService from '@/services/maintenanceService';
import vehicleService from '@/services/vehicleService';
import clientService from '@/services/clientService';
import { showError, showSuccess } from '@/utils/toastUtils';
import { formatCurrency, formatDate } from '@/utils/formatters';

const MaintenanceListPage = () => {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vehicle: '',
    client: '',
    maintenanceType: 'routine',
    title: '',
    description: '',
    cost: 0,
    status: 'scheduled',
    odometer: 0,
    serviceCenter: '',
    performedBy: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [maintRes, vehRes, cliRes] = await Promise.all([
        maintenanceService.getMaintenanceRecords({ limit: 100 }),
        vehicleService.getVehicles({ limit: 100 }),
        clientService.getClients({ limit: 50 }),
      ]);
      setRecords(maintRes.records || []);
      setVehicles(vehRes.vehicles || []);
      setClients(cliRes.clients || []);

      if (vehRes.vehicles?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          vehicle: vehRes.vehicles[0]._id,
          client: vehRes.vehicles[0].client?._id || vehRes.vehicles[0].client || '',
        }));
      }
    } catch (err) {
      showError(err.message || 'Failed to load maintenance records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const s = (r.status || 'scheduled').toLowerCase();
      if (statusFilter !== 'all' && s !== statusFilter.toLowerCase()) return false;
      if (typeFilter !== 'all' && (r.maintenanceType || '').toLowerCase() !== typeFilter.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const vehNum = r.vehicle?.vehicleNumber?.toLowerCase() || '';
        const title = (r.title || '').toLowerCase();
        const sc = (r.serviceCenter || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        if (!vehNum.includes(q) && !title.includes(q) && !sc.includes(q) && !desc.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [records, statusFilter, typeFilter, searchQuery]);

  const totalCost = useMemo(() => {
    return records.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  }, [records]);

  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setFormData({
      vehicle: vehicles[0]?._id || '',
      client: vehicles[0]?.client?._id || vehicles[0]?.client || '',
      maintenanceType: 'routine',
      title: '',
      description: '',
      cost: 1500,
      status: 'scheduled',
      odometer: 12000,
      serviceCenter: 'FastFleet EV Hub Workshop',
      performedBy: 'Master Tech EV Team',
      maintenanceDate: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (rec) => {
    setEditingRecord(rec);
    setFormData({
      vehicle: rec.vehicle?._id || rec.vehicle || '',
      client: rec.client?._id || rec.client || '',
      maintenanceType: rec.maintenanceType || 'routine',
      title: rec.title || '',
      description: rec.description || '',
      cost: rec.cost || 0,
      status: rec.status?.toLowerCase() || 'scheduled',
      odometer: rec.odometer || 0,
      serviceCenter: rec.serviceCenter || '',
      performedBy: rec.performedBy || '',
      maintenanceDate: rec.maintenanceDate ? new Date(rec.maintenanceDate).toISOString().split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.vehicle) {
      showError('Please provide a maintenance title and select a vehicle');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRecord) {
        await maintenanceService.updateMaintenance(editingRecord._id, formData);
        showSuccess('Maintenance record updated successfully');
      } else {
        await maintenanceService.createMaintenance(formData);
        showSuccess('Maintenance record logged successfully');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to save maintenance record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    setSubmitting(true);
    try {
      await maintenanceService.deleteMaintenance(recordToDelete._id);
      showSuccess('Maintenance record removed');
      setDeleteConfirmOpen(false);
      setRecordToDelete(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete maintenance log');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HiOutlineCheckBadge className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HiOutlineClock className="w-3.5 h-3.5 animate-spin" />
            In Progress
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <HiOutlineCalendarDays className="w-3.5 h-3.5" />
            Scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Fleet Maintenance & Servicing"
        subtitle="Manage regular vehicle servicing, battery diagnostics, tire replacements, and repair logs."
        actions={
          <Button
            variant="primary"
            leftIcon={<HiOutlinePlus className="w-5 h-5" />}
            onClick={handleOpenCreateModal}
          >
            Log Maintenance
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Total Service Logs</p>
          <p className="text-2xl font-black text-white mt-1">{records.length}</p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-amber-400 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {records.filter((r) => (r.status || '').toLowerCase() === 'in_progress').length}
          </p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-sky-400 uppercase tracking-wider">Upcoming Scheduled</p>
          <p className="text-2xl font-black text-sky-400 mt-1">
            {records.filter((r) => (r.status || '').toLowerCase() === 'scheduled').length}
          </p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-emerald-400 uppercase tracking-wider">Total Fleet Expense</p>
          <p className="text-2xl font-black text-white mt-1">
            {formatCurrency ? formatCurrency(totalCost) : `₹${totalCost.toLocaleString()}`}
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
              placeholder="Search vehicle, service center, title..."
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
              <option value="all">All Service Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">All Maintenance Types</option>
              <option value="routine">Routine Service</option>
              <option value="preventive">Preventive Check</option>
              <option value="corrective">Corrective Repair</option>
              <option value="emergency">Emergency Breakdown</option>
              <option value="inspection">Safety Inspection</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Maintenance Records Table */}
      <Card className="overflow-hidden border border-[#2E2E2E]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] border-b border-[#2E2E2E] text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Maintenance Task</th>
                <th className="py-3 px-4">Service Center</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424] text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#A3A3A3]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading maintenance logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#A3A3A3]">
                    <HiOutlineWrenchScrewdriver className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    No maintenance records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const vehNum = rec.vehicle?.vehicleNumber || 'Unspecified';
                  const vehModel = rec.vehicle?.brand ? `${rec.vehicle.brand} ${rec.vehicle.model || ''}` : 'EV Bike';

                  return (
                    <tr key={rec._id} className="hover:bg-[#161616] transition-colors">
                      {/* Vehicle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                            <HiOutlineTruck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white font-mono leading-tight">
                              {vehNum}
                            </p>
                            <p className="text-xs text-[#A3A3A3] mt-0.5">{vehModel}</p>
                          </div>
                        </div>
                      </td>

                      {/* Maintenance Task */}
                      <td className="py-3.5 px-4">
                        <p className="text-white font-medium">{rec.title}</p>
                        <p className="text-xs text-amber-500/80 uppercase font-semibold mt-0.5">
                          {rec.maintenanceType || 'routine'}
                        </p>
                      </td>

                      {/* Service Center */}
                      <td className="py-3.5 px-4">
                        <p className="text-white">{rec.serviceCenter || 'Fleet Center'}</p>
                        {rec.performedBy && (
                          <p className="text-xs text-[#A3A3A3]">Tech: {rec.performedBy}</p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        {rec.maintenanceDate ? formatDate(rec.maintenanceDate) : 'N/A'}
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-400">
                        ₹{(rec.cost || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(rec.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(rec)}
                            title="Edit Record"
                            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setRecordToDelete(rec);
                              setDeleteConfirmOpen(true);
                            }}
                            title="Delete Record"
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
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

      {/* Add / Edit Maintenance Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRecord ? 'Edit Maintenance Record' : 'Log Maintenance Event'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Vehicle *
              </label>
              <select
                required
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              >
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber} – {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Maintenance Type *
              </label>
              <select
                value={formData.maintenanceType}
                onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              >
                <option value="routine">Routine Service</option>
                <option value="preventive">Preventive Check</option>
                <option value="corrective">Corrective Repair</option>
                <option value="emergency">Emergency Breakdown</option>
                <option value="inspection">Safety Inspection</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
              Title / Task Description *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              placeholder="e.g. 10,000km Battery Pack Health Diagnostic & Brake Bleed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Cost (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Odometer (km)
              </label>
              <input
                type="number"
                min="0"
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: Number(e.target.value) })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Service Center
              </label>
              <input
                type="text"
                value={formData.serviceCenter}
                onChange={(e) => setFormData({ ...formData, serviceCenter: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="e.g. FastFleet EV Hub Workshop"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Service Date
              </label>
              <input
                type="date"
                value={formData.maintenanceDate}
                onChange={(e) => setFormData({ ...formData, maintenanceDate: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
              Technician Notes / Detailed Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              placeholder="Inspection findings, parts replaced, battery cell voltage balancing notes..."
            />
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
              {editingRecord ? 'Save Changes' : 'Log Maintenance'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Maintenance Record"
        message={`Are you sure you want to delete the maintenance record "${recordToDelete?.title}"?`}
        confirmText="Delete Record"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  );
};

export default MaintenanceListPage;
