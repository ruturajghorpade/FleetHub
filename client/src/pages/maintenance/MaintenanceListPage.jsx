// FleetHub – Fleet Vehicle Maintenance & EV Service Logs Page
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineWrenchScrewdriver,
  HiOutlineTruck,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlinePlay,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineEye,
  HiOutlineInformationCircle,
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
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
  const [summary, setSummary] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Complete Maintenance Modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingRecord, setCompletingRecord] = useState(null);
  const [completeData, setCompleteData] = useState({
    cost: 0,
    odometer: 0,
    notes: '',
    performedBy: '',
  });

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
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
      setSummary(maintRes.summary || {});
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

  // Is Overdue check helper
  const isOverdue = (rec) => {
    const s = (rec.status || '').toLowerCase();
    if (s !== 'scheduled') return false;
    const targetDate = new Date(rec.scheduledDate || rec.maintenanceDate);
    const now = new Date();
    return targetDate < now;
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const s = (r.status || 'scheduled').toLowerCase();
      const overdue = isOverdue(r);

      if (activeTab === 'scheduled' && s !== 'scheduled') return false;
      if (activeTab === 'in_progress' && s !== 'in_progress') return false;
      if (activeTab === 'completed' && s !== 'completed') return false;
      if (activeTab === 'overdue' && !overdue) return false;

      if (typeFilter !== 'all' && (r.maintenanceType || '').toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const vehNum = r.vehicle?.vehicleNumber?.toLowerCase() || '';
        const title = (r.title || '').toLowerCase();
        const sc = (r.serviceCenter || r.serviceProvider || '').toLowerCase();
        const desc = (r.description || r.notes || '').toLowerCase();
        if (!vehNum.includes(q) && !title.includes(q) && !sc.includes(q) && !desc.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [records, activeTab, typeFilter, searchQuery]);

  const overdueCount = useMemo(() => {
    return records.filter(isOverdue).length;
  }, [records]);

  const scheduledCount = useMemo(() => {
    return records.filter((r) => (r.status || '').toLowerCase() === 'scheduled').length;
  }, [records]);

  const inProgressCount = useMemo(() => {
    return records.filter((r) => (r.status || '').toLowerCase() === 'in_progress').length;
  }, [records]);

  const completedCount = useMemo(() => {
    return records.filter((r) => (r.status || '').toLowerCase() === 'completed').length;
  }, [records]);

  const totalCost = useMemo(() => {
    return records.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  }, [records]);

  // Actions
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
      odometer: vehicles[0]?.odometer || 0,
      serviceCenter: 'FastFleet EV Hub Workshop',
      performedBy: 'Fleet Technician Team',
      scheduledDate: new Date().toISOString().split('T')[0],
      notes: '',
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
      serviceCenter: rec.serviceCenter || rec.serviceProvider || '',
      performedBy: rec.performedBy || '',
      scheduledDate: rec.scheduledDate ? new Date(rec.scheduledDate).toISOString().split('T')[0] : '',
      notes: rec.notes || '',
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
        showSuccess('Maintenance record scheduled successfully');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to save maintenance record');
    } finally {
      setSubmitting(false);
    }
  };

  // Start Maintenance with Active Delivery protection feedback
  const handleStartMaintenance = async (rec) => {
    setSubmitting(true);
    try {
      await maintenanceService.startMaintenance(rec._id);
      showSuccess(`Maintenance started on vehicle ${rec.vehicle?.vehicleNumber || 'fleet unit'}. Vehicle is now under maintenance.`);
      loadData();
    } catch (err) {
      showError(err.message || 'Cannot start maintenance on vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Complete Modal
  const handleOpenCompleteModal = (rec) => {
    setCompletingRecord(rec);
    setCompleteData({
      cost: rec.cost || 0,
      odometer: rec.odometer || rec.vehicle?.odometer || 0,
      notes: rec.notes || 'Routine maintenance and safety checklist completed successfully.',
      performedBy: rec.performedBy || 'FastFleet Workshop Engineer',
    });
    setCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingRecord) return;
    setSubmitting(true);
    try {
      await maintenanceService.completeMaintenance(completingRecord._id, completeData);
      showSuccess(`Maintenance completed for vehicle ${completingRecord.vehicle?.vehicleNumber || 'vehicle'}. Vehicle restored to available status!`);
      setCompleteModalOpen(false);
      setCompletingRecord(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to complete maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Maintenance
  const handleCancelMaintenance = async (rec) => {
    try {
      await maintenanceService.cancelMaintenance(rec._id, { reason: 'Cancelled by fleet manager' });
      showSuccess('Maintenance cancelled');
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to cancel maintenance');
    }
  };

  // View Details with Audit Logs
  const handleOpenDetails = async (rec) => {
    setSelectedRecord(rec);
    setDetailsModalOpen(true);
    setLoadingDetails(true);
    try {
      const detailed = await maintenanceService.getMaintenanceRecordById(rec._id);
      setSelectedRecord(detailed);
    } catch {
      // keep initial record if fetch fails
    } finally {
      setLoadingDetails(false);
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

  const getStatusBadge = (rec) => {
    const s = (rec.status || '').toLowerCase();
    const overdue = isOverdue(rec);

    if (overdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
          <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
          Overdue
        </span>
      );
    }

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <HiOutlineXMark className="w-3.5 h-3.5" />
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
        subtitle="Manage regular vehicle servicing, battery diagnostics, tire replacements, and active delivery protection."
        actions={
          <Button
            variant="primary"
            leftIcon={<HiOutlinePlus className="w-5 h-5" />}
            onClick={handleOpenCreateModal}
          >
            Schedule Maintenance
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Total Logs</p>
          <p className="text-2xl font-black text-white mt-1">{records.length}</p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-sky-400 uppercase tracking-wider">Scheduled</p>
          <p className="text-2xl font-black text-sky-400 mt-1">{scheduledCount}</p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-amber-400 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-rose-400 uppercase tracking-wider">Overdue Alerts</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{overdueCount}</p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-2xs font-semibold text-emerald-400 uppercase tracking-wider">Total Expense</p>
          <p className="text-2xl font-black text-white mt-1">
            {formatCurrency ? formatCurrency(totalCost) : `₹${totalCost.toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-[#2E2E2E] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <span>All</span>
            <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-black/20 text-black' : 'bg-[#222222] text-[#A3A3A3]'}`}>
              {records.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'scheduled'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <span>Scheduled</span>
            <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'scheduled' ? 'bg-black/20 text-black' : 'bg-[#222222] text-[#A3A3A3]'}`}>
              {scheduledCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('in_progress')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'in_progress'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <span>In Progress</span>
            <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'in_progress' ? 'bg-black/20 text-black' : 'bg-[#222222] text-[#A3A3A3]'}`}>
              {inProgressCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'overdue'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <span>Overdue</span>
            {overdueCount > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.2 rounded-full ${activeTab === 'overdue' ? 'bg-black text-rose-400' : 'bg-rose-500 text-white'}`}>
                {overdueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <span>Completed</span>
            <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'completed' ? 'bg-black/20 text-black' : 'bg-[#222222] text-[#A3A3A3]'}`}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <Card className="p-3.5">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input
                type="text"
                placeholder="Search vehicle number, provider, task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-amber-500 transition-colors w-full md:w-auto"
              >
                <option value="all">All Service Types</option>
                <option value="routine">Routine Service</option>
                <option value="preventive">Preventive Inspection</option>
                <option value="corrective">Corrective Repair</option>
                <option value="emergency">Emergency Breakdown</option>
                <option value="oil_change">Oil & Fluids</option>
                <option value="brake_service">Brakes & Tyres</option>
                <option value="electrical">EV Battery & Electrical</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Maintenance Records Table */}
      <Card className="overflow-hidden border border-[#2E2E2E]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] border-b border-[#2E2E2E] text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Service Task</th>
                <th className="py-3 px-4">Provider / Center</th>
                <th className="py-3 px-4">Scheduled Date</th>
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
                      <span>Loading maintenance records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center text-[#A3A3A3]">
                    <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center mx-auto mb-3 text-amber-400">
                      <HiOutlineWrenchScrewdriver className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-white">No maintenance records found</p>
                    <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
                      {activeTab === 'overdue'
                        ? 'All vehicles are up to date! No scheduled maintenance is overdue.'
                        : 'No records match your selected filter. Click "Schedule Maintenance" to log an event.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const vehNum = rec.vehicle?.vehicleNumber || 'Unspecified';
                  const vehModel = rec.vehicle?.brand ? `${rec.vehicle.brand} ${rec.vehicle.model || ''}` : 'EV Bike';
                  const status = (rec.status || '').toLowerCase();

                  return (
                    <tr key={rec._id} className="hover:bg-[#161616] transition-colors">
                      {/* Vehicle */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0">
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
                        <p className="text-2xs text-amber-500/90 uppercase font-bold tracking-wider mt-0.5">
                          {rec.maintenanceType || 'routine'}
                        </p>
                      </td>

                      {/* Service Provider */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-200">{rec.serviceProvider || rec.serviceCenter || 'FastFleet Workshop'}</p>
                        {rec.performedBy && (
                          <p className="text-xs text-[#A3A3A3]">Tech: {rec.performedBy}</p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        {rec.scheduledDate || rec.maintenanceDate ? formatDate(rec.scheduledDate || rec.maintenanceDate) : 'N/A'}
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-400">
                        ₹{(rec.cost || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(rec)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Details Button */}
                          <button
                            onClick={() => handleOpenDetails(rec)}
                            title="View Maintenance Details"
                            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>

                          {/* Start Maintenance Button (for scheduled) */}
                          {status === 'scheduled' && (
                            <button
                              onClick={() => handleStartMaintenance(rec)}
                              title="Start Maintenance (Sets Vehicle to Under Maintenance)"
                              className="p-1.5 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors flex items-center gap-1 text-xs font-semibold"
                            >
                              <HiOutlinePlay className="w-4 h-4" />
                              <span className="hidden lg:inline">Start</span>
                            </button>
                          )}

                          {/* Complete Maintenance Button (for in_progress) */}
                          {status === 'in_progress' && (
                            <button
                              onClick={() => handleOpenCompleteModal(rec)}
                              title="Complete Maintenance (Restores Vehicle to Available)"
                              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors flex items-center gap-1 text-xs font-semibold"
                            >
                              <HiOutlineCheck className="w-4 h-4" />
                              <span className="hidden lg:inline">Complete</span>
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(rec)}
                            title="Edit Record"
                            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
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
        title={editingRecord ? 'Edit Maintenance Record' : 'Schedule Vehicle Maintenance'}
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
                    {v.vehicleNumber} – {v.brand} {v.model} ({v.availability || v.status})
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
                <option value="preventive">Preventive Inspection</option>
                <option value="corrective">Corrective Repair</option>
                <option value="emergency">Emergency Breakdown</option>
                <option value="oil_change">Oil & Fluids</option>
                <option value="brake_service">Brake Check & Service</option>
                <option value="electrical">EV Battery & Electrical</option>
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
              placeholder="e.g. 10,000km Periodic EV Battery Diagnostic & Brake Pad Replacement"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Estimated Cost (₹ INR)
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
                Odometer (KM)
              </label>
              <input
                type="number"
                min="0"
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: Number(e.target.value) })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Scheduled Date *
              </label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Service Provider / Center
              </label>
              <input
                type="text"
                value={formData.serviceCenter}
                onChange={(e) => setFormData({ ...formData, serviceCenter: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="e.g. Ather Authorized Service Hub"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Technician / Performed By
              </label>
              <input
                type="text"
                value={formData.performedBy}
                onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="e.g. Lead Tech R. Verma"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
              Description / Notes
            </label>
            <textarea
              rows="3"
              value={formData.notes || formData.description}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value, description: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              placeholder="Additional operational instructions, inspection checklist, or replacement notes..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2E2E2E]">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              {editingRecord ? 'Save Changes' : 'Confirm Schedule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Maintenance Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Complete Vehicle Maintenance"
        size="md"
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
            <HiOutlineShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Restoring Vehicle to Available Fleet</p>
              <p className="mt-0.5 text-emerald-300/80">
                Completing this maintenance will immediately restore vehicle {completingRecord?.vehicle?.vehicleNumber} to active service and make it available for delivery dispatches.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Final Cost (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                value={completeData.cost}
                onChange={(e) => setCompleteData({ ...completeData, cost: Number(e.target.value) })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Ending Odometer (KM)
              </label>
              <input
                type="number"
                min="0"
                value={completeData.odometer}
                onChange={(e) => setCompleteData({ ...completeData, odometer: Number(e.target.value) })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
              Serviced By / Technician
            </label>
            <input
              type="text"
              value={completeData.performedBy}
              onChange={(e) => setCompleteData({ ...completeData, performedBy: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
              Resolution Notes / Replaced Parts
            </label>
            <textarea
              rows="3"
              value={completeData.notes}
              onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              placeholder="e.g. Battery cell health verified 98%, front disc brake pads replaced, test ride complete."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2E2E2E]">
            <Button variant="outline" type="button" onClick={() => setCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Complete & Restore Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Maintenance Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Maintenance Record Details"
        size="lg"
      >
        {selectedRecord ? (
          <div className="space-y-5 pt-2">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#161616] border border-[#2E2E2E]">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-amber-500">
                  {selectedRecord.maintenanceType || 'Routine'} Maintenance
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedRecord.title}</h3>
                <p className="text-xs text-[#A3A3A3] mt-0.5">
                  Client: {selectedRecord.client?.companyName || 'FastFleet Logistics'} {selectedRecord.branch?.branchName ? `• Branch: ${selectedRecord.branch.branchName}` : ''}
                </p>
              </div>
              <div>{getStatusBadge(selectedRecord)}</div>
            </div>

            {/* Vehicle & Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
                <p className="text-2xs text-[#A3A3A3] uppercase font-semibold">Vehicle</p>
                <p className="text-sm font-bold font-mono text-white mt-1">
                  {selectedRecord.vehicle?.vehicleNumber || 'N/A'}
                </p>
                <p className="text-2xs text-[#737373]">{selectedRecord.vehicle?.brand} {selectedRecord.vehicle?.model}</p>
              </div>

              <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
                <p className="text-2xs text-[#A3A3A3] uppercase font-semibold">Service Cost</p>
                <p className="text-sm font-bold font-mono text-amber-400 mt-1">
                  ₹{(selectedRecord.cost || 0).toLocaleString()}
                </p>
                <p className="text-2xs text-[#737373]">Invoice Total</p>
              </div>

              <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
                <p className="text-2xs text-[#A3A3A3] uppercase font-semibold">Scheduled Date</p>
                <p className="text-sm font-semibold text-white mt-1">
                  {selectedRecord.scheduledDate || selectedRecord.maintenanceDate ? formatDate(selectedRecord.scheduledDate || selectedRecord.maintenanceDate) : 'N/A'}
                </p>
                <p className="text-2xs text-[#737373]">
                  {selectedRecord.completedDate ? `Completed ${formatDate(selectedRecord.completedDate)}` : 'Pending execution'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
                <p className="text-2xs text-[#A3A3A3] uppercase font-semibold">Service Provider</p>
                <p className="text-sm font-semibold text-white mt-1 truncate">
                  {selectedRecord.serviceProvider || selectedRecord.serviceCenter || 'FastFleet Workshop'}
                </p>
                <p className="text-2xs text-[#737373]">{selectedRecord.performedBy || 'Fleet Engineer'}</p>
              </div>
            </div>

            {/* Notes & Description */}
            {(selectedRecord.description || selectedRecord.notes) && (
              <div className="p-4 rounded-xl bg-[#141414] border border-[#242424]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1.5 flex items-center gap-1.5">
                  <HiOutlineDocumentText className="w-4 h-4 text-amber-500" />
                  Notes & Details
                </h4>
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedRecord.notes || selectedRecord.description}
                </p>
              </div>
            )}

            {/* Audit History Log */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#242424]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-3 flex items-center gap-1.5">
                <HiOutlineInformationCircle className="w-4 h-4 text-amber-500" />
                Audit Trail & History
              </h4>
              {loadingDetails ? (
                <div className="py-4 text-center text-xs text-[#A3A3A3]">
                  Loading audit logs...
                </div>
              ) : selectedRecord.auditLogs?.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedRecord.auditLogs.map((log) => (
                    <div key={log._id} className="text-xs flex items-start justify-between border-b border-[#222222] pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-white">{log.description}</p>
                        <p className="text-2xs text-[#737373] mt-0.5">
                          By {log.userName || log.user?.name || 'System User'} ({log.userRole || log.user?.role || 'Admin'})
                        </p>
                      </div>
                      <span className="text-2xs text-[#A3A3A3] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#737373]">
                  Record initialized. Status transitions and edits are logged here automatically.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#2E2E2E]">
              <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Maintenance Record"
        message={`Are you sure you want to remove the maintenance record for vehicle ${recordToDelete?.vehicle?.vehicleNumber || 'this unit'}? This action cannot be undone.`}
        confirmText="Delete Record"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  );
};

export default MaintenanceListPage;
