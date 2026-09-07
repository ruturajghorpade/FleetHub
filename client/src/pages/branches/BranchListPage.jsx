// FleetHub – Branch Management Page (Restaurant Stores / Outlets)
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBuildingStorefront,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineClock,
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
  const { activeRole } = useAuth();
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState('all');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    } catch {
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
      if (selectedClientFilter !== 'all' && branchClientId !== selectedClientFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = b.branchName?.toLowerCase().includes(query);
        const matchCode = b.branchCode?.toLowerCase().includes(query);
        const matchAddress = b.address?.toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchAddress) return false;
      }
      return true;
    });
  }, [branches, selectedClientFilter, searchQuery]);

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({
      client: clients[0]?._id || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-[#2E2E2E] shadow-card">
        <div className="relative w-full sm:w-80">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search branch name, code, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
                {(activeRole === 'super_admin' || activeRole === 'client_admin') && (
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                    Loading restaurant branch outlets...
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                    No branch outlets found. Click "Add Store Branch" to create one.
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => {
                  const clientName = branch.client?.companyName || 'Domino\'s Pizza';
                  return (
                    <tr key={branch._id} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <HiOutlineBuildingStorefront className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{branch.branchName}</p>
                            <p className="text-2xs text-slate-400">{branch.address || 'Bengaluru'}</p>
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
                      {(activeRole === 'super_admin' || activeRole === 'client_admin') && (
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(branch)}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#242424] text-slate-500 hover:text-amber-500 transition-colors"
                              title="Edit Branch"
                            >
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </button>
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
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
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
            <select
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
            >
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Outlet Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Domino's – Whitefield"
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
                placeholder="e.g. DOM-WHI-03"
                value={formData.branchCode}
                onChange={(e) => setFormData({ ...formData, branchCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
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
                placeholder="+91 80 2525 1114"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store Address
            </label>
            <input
              type="text"
              placeholder="ITPL Main Road, Whitefield"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
            />
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
        message={`Are you sure you want to delete ${branchToDelete?.branchName}?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default BranchListPage;
