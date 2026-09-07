// FleetHub – Branch Management Page (Restaurant Stores / Outlets)
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineBuildingStorefront,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import branchService from '@/services/branchService';
import clientService from '@/services/clientService';
import { showError, showSuccess } from '@/utils/toastUtils';
import { useAuth } from '@/context/AuthContext';

const BranchListPage = () => {
  const { user, activeRole } = useAuth();
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // View Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    client: '',
    branchName: '',
    branchCode: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bengaluru',
    operatingHours: '10:00 AM – 11:00 PM',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [branchesData, clientsData] = await Promise.all([
        branchService.getBranches({ limit: 100 }),
        clientService.getClients({ limit: 50 }),
      ]);
      setBranches(branchesData.branches || []);
      setClients(clientsData.clients || []);
      if (clientsData.clients?.length > 0) {
        setFormData((prev) => ({ ...prev, client: clientsData.clients[0]._id }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load branch outlets';
      setError(msg);
      showError(msg);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const branchClientId = b.client?._id || b.client;
      if (activeRole === 'super_admin' && selectedClientFilter !== 'all' && branchClientId !== selectedClientFilter) {
        return false;
      }
      if (statusFilter !== 'all' && b.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = b.branchName?.toLowerCase().includes(query);
        const matchCode = b.branchCode?.toLowerCase().includes(query);
        const matchAddress = b.address?.toLowerCase().includes(query);
        const matchCity = b.city?.toLowerCase().includes(query);
        const matchClient = (b.client?.companyName || '').toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchAddress && !matchCity && !matchClient) return false;
      }
      return true;
    });
  }, [branches, selectedClientFilter, statusFilter, searchQuery, activeRole]);

  const openCreateModal = () => {
    setEditingBranch(null);
    const defaultClientId =
      activeRole === 'client_admin'
        ? user?.client?._id || user?.client || clients[0]?._id || ''
        : clients[0]?._id || '';

    setFormData({
      client: defaultClientId,
      branchName: '',
      branchCode: '',
      email: '',
      phone: '',
      address: '',
      city: 'Bengaluru',
      operatingHours: '10:00 AM – 11:00 PM',
    });
    setModalOpen(true);
  };

  const openEditModal = (branch) => {
    setEditingBranch(branch);
    setFormData({
      client: branch.client?._id || branch.client || '',
      branchName: branch.branchName || '',
      branchCode: branch.branchCode || '',
      email: branch.email || '',
      phone: branch.phone || '',
      address: branch.address || '',
      city: branch.city || 'Bengaluru',
      operatingHours: branch.operatingHours || '10:00 AM – 11:00 PM',
    });
    setModalOpen(true);
  };

  const openDetailsModal = (branch) => {
    setSelectedBranch(branch);
    setDetailsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.branchName.trim() || !formData.branchCode.trim()) {
      showError('Please fill out all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch._id, formData);
        showSuccess('Branch outlet updated successfully!');
      } else {
        await branchService.createBranch(formData);
        showSuccess('Branch outlet created successfully!');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!branchToDelete) return;
    try {
      await branchService.deleteBranch(branchToDelete._id);
      showSuccess('Branch deleted successfully!');
      setDeleteConfirmOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete branch');
    }
  };

  // Find active client name for Client Admin header badge
  const clientAdminBrandName =
    clients.find((c) => c._id === (user?.client?._id || user?.client))?.companyName ||
    clients[0]?.companyName ||
    "Domino's Pizza";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Restaurant Branches"
        subtitle="Manage individual outlet locations, dispatch pickup hubs, and store contacts"
      >
        {(activeRole === 'super_admin' || activeRole === 'client_admin') && (
          <Button variant="primary" size="md" onClick={openCreateModal}>
            <HiOutlinePlus className="w-5 h-5" />
            Add Store Branch
          </Button>
        )}
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium">
          <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
          <Button variant="ghost" size="xs" onClick={loadData} className="ml-auto text-red-600 dark:text-red-400 underline">
            Retry
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-[#2E2E2E] shadow-card">
        <div className="relative w-full sm:w-80">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search branch name, code, city, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Restaurant filter: Super Admin can pick, Client Admin has locked scope */}
          {activeRole === 'super_admin' ? (
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
            >
              <option value="all">All Restaurant Brands</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400">
              <HiOutlineBuildingStorefront className="w-3.5 h-3.5" />
              <span>{clientAdminBrandName} Outlets</span>
            </div>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Branch Name</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Code</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Restaurant</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Operating Hours</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Contact</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <p>Loading restaurant branch outlets...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <HiOutlineBuildingStorefront className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No branches found.</p>
                      <p className="text-2xs text-slate-400">Add a branch to start managing operations.</p>
                      {(activeRole === 'super_admin' || activeRole === 'client_admin') && (
                        <Button variant="primary" size="sm" onClick={openCreateModal} className="mt-2">
                          <HiOutlinePlus className="w-4 h-4" /> Add Store Branch
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => {
                  const clientName = branch.client?.companyName || "Domino's Pizza";
                  return (
                    <tr key={branch._id} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <HiOutlineBuildingStorefront className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{branch.branchName}</p>
                            <p className="text-2xs text-slate-400">{branch.address || branch.city || 'Bengaluru'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {branch.branchCode}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {clientName}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1 text-2xs text-slate-400">
                          <HiOutlineClock className="w-3.5 h-3.5" />
                          {branch.operatingHours || '10:00 AM – 11:00 PM'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                        {branch.email && <p className="flex items-center gap-1"><HiOutlineEnvelope className="w-3.5 h-3.5 text-slate-400" /> {branch.email}</p>}
                        {branch.phone && <p className="flex items-center gap-1 text-2xs text-slate-400 mt-0.5"><HiOutlinePhone className="w-3.5 h-3.5 text-slate-400" /> {branch.phone}</p>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase ${branch.status === 'active' ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-slate-100 text-slate-500'}`}>
                          {branch.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetailsModal(branch)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#242424] text-slate-500 hover:text-amber-500 transition-colors"
                            title="View Branch Details"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          {(activeRole === 'super_admin' || activeRole === 'client_admin') && (
                            <button
                              onClick={() => openEditModal(branch)}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#242424] text-slate-500 hover:text-amber-500 transition-colors"
                              title="Edit Branch"
                            >
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </button>
                          )}
                          {(activeRole === 'super_admin' || activeRole === 'client_admin') && (
                            <button
                              onClick={() => {
                                setBranchToDelete(branch);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-500 transition-colors"
                              title="Delete Branch"
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

      {/* Branch Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedBranch ? `${selectedBranch.branchName} — Details` : 'Branch Details'}
        size="md"
      >
        {selectedBranch && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <HiOutlineBuildingStorefront className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedBranch.branchName}</h3>
                  <p className="font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold">{selectedBranch.branchCode}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-2xs font-bold uppercase ${selectedBranch.status === 'active' ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-slate-100 text-slate-500'}`}>
                {selectedBranch.status || 'ACTIVE'}
              </span>
            </div>

            {/* Parent Brand & Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E]">
                <p className="text-2xs text-slate-400 uppercase font-medium">Parent Restaurant</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedBranch.client?.companyName || "Domino's Pizza"}
                </p>
                {selectedBranch.client?.companyCode && (
                  <p className="text-2xs text-amber-500 font-mono mt-0.5">{selectedBranch.client.companyCode}</p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E]">
                <p className="text-2xs text-slate-400 uppercase font-medium">Capacity Limits</p>
                <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1"><HiOutlineTruck className="w-3.5 h-3.5 text-amber-500" /> {selectedBranch.maxVehicles || 5} bikes</span>
                  <span className="flex items-center gap-1"><HiOutlineUserGroup className="w-3.5 h-3.5 text-amber-500" /> {selectedBranch.maxDrivers || 5} riders</span>
                </div>
              </div>
            </div>

            {/* Operating info */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] space-y-2 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Store Location & Timing</p>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2"><HiOutlineClock className="w-4 h-4 text-amber-500" /> {selectedBranch.operatingHours || '10:00 AM – 11:00 PM'}</p>
                <p className="flex items-center gap-2"><HiOutlineMapPin className="w-4 h-4 text-amber-500" /> {selectedBranch.address || 'Address not provided'}, {selectedBranch.city || 'Bengaluru'}</p>
                {selectedBranch.phone && <p className="flex items-center gap-2"><HiOutlinePhone className="w-4 h-4 text-amber-500" /> {selectedBranch.phone}</p>}
                {selectedBranch.email && <p className="flex items-center gap-2"><HiOutlineEnvelope className="w-4 h-4 text-amber-500" /> {selectedBranch.email}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBranch ? `Edit Branch: ${editingBranch.branchName}` : 'Add Restaurant Store Branch'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Parent Restaurant Brand *
            </label>
            {activeRole === 'super_admin' ? (
              <select
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              >
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName} ({c.companyCode})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#252525] border border-slate-300 dark:border-[#404040] text-sm font-semibold text-slate-800 dark:text-slate-200">
                {clientAdminBrandName}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Outlet Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Domino's – Pune Camp"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DOM-PUN-01"
                value={formData.branchCode}
                onChange={(e) => setFormData({ ...formData, branchCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+919888811111"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pune"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store Address
              </label>
              <input
                type="text"
                placeholder="e.g. MG Road, Camp Area"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                placeholder="10:00 AM – 1:00 AM"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              {editingBranch ? 'Save Changes' : 'Create Branch'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Branch Outlet"
        message={`Are you sure you want to delete ${branchToDelete?.branchName}? If active deliveries depend on this branch, deletion will be blocked.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default BranchListPage;
