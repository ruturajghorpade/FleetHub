// FleetHub – Client Management Page (Food Delivery Logistics Clients)
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineBuildingStorefront,
  HiOutlineBuildingOffice2,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import clientService from '@/services/clientService';
import branchService from '@/services/branchService';
import deliveryService from '@/services/deliveryService';
import { showError, showSuccess } from '@/utils/toastUtils';
import { useAuth } from '@/context/AuthContext';

const ClientListPage = () => {
  const { activeRole } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // View Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientBranches, setClientBranches] = useState([]);
  const [clientDeliveriesCount, setClientDeliveriesCount] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    email: '',
    phone: '',
    businessType: 'RESTAURANT',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '',
  });

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getClients({ limit: 100 });
      setClients(data.clients || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load restaurant clients';
      setError(msg);
      showError(msg);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (
        businessTypeFilter !== 'all' &&
        c.businessType?.toUpperCase() !== businessTypeFilter.toUpperCase()
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = c.companyName?.toLowerCase().includes(query);
        const matchCode = c.companyCode?.toLowerCase().includes(query);
        const matchEmail = c.email?.toLowerCase().includes(query);
        const matchPhone = c.phone?.toLowerCase().includes(query);
        const matchCity = c.city?.toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchEmail && !matchPhone && !matchCity) return false;
      }
      return true;
    });
  }, [clients, statusFilter, businessTypeFilter, searchQuery]);

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      companyName: '',
      companyCode: '',
      email: '',
      phone: '',
      businessType: 'RESTAURANT',
      address: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      companyName: client.companyName || '',
      companyCode: client.companyCode || '',
      email: client.email || '',
      phone: client.phone || '',
      businessType: client.businessType || 'RESTAURANT',
      address: client.address || '',
      city: client.city || 'Bengaluru',
      state: client.state || 'Karnataka',
      postalCode: client.postalCode || '',
    });
    setModalOpen(true);
  };

  const openDetailsModal = async (client) => {
    setSelectedClient(client);
    setDetailsModalOpen(true);
    setLoadingDetails(true);
    setClientBranches([]);
    setClientDeliveriesCount(null);

    try {
      const [branchesData, deliveriesData] = await Promise.all([
        branchService.getBranches({ client: client._id }),
        deliveryService.getDeliveries({ client: client._id, limit: 1 }).catch(() => ({})),
      ]);
      setClientBranches(branchesData.branches || []);
      setClientDeliveriesCount(deliveriesData.pagination?.total ?? null);
    } catch {
      setClientBranches([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.companyCode.trim() || !formData.email.trim()) {
      showError('Please fill out all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editingClient) {
        await clientService.updateClient(editingClient._id, formData);
        showSuccess('Restaurant client updated successfully!');
      } else {
        await clientService.createClient(formData);
        showSuccess('Restaurant client created successfully!');
      }
      setModalOpen(false);
      loadClients();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await clientService.deleteClient(clientToDelete._id);
      showSuccess('Restaurant client deactivated successfully!');
      setDeleteConfirmOpen(false);
      loadClients();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete client');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Restaurant Clients"
        subtitle="Manage food brand partners, restaurant stores, subscriptions, and logistics accounts"
      >
        {activeRole === 'super_admin' && (
          <Button variant="primary" size="md" onClick={openCreateModal}>
            <HiOutlinePlus className="w-5 h-5" />
            Add Restaurant Client
          </Button>
        )}
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium">
          <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
          <Button variant="ghost" size="xs" onClick={loadClients} className="ml-auto text-red-600 dark:text-red-400 underline">
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
            placeholder="Search by name, code, email, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
          >
            <option value="all">All Food Types</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="FAST_FOOD">Fast Food</option>
            <option value="CAFE">Cafe</option>
            <option value="BAKERY">Bakery</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Company Name</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Code</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Business Type</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Contact Details</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">City</th>
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
                      <p>Loading restaurant clients...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <HiOutlineBuildingOffice2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No clients found.</p>
                      <p className="text-2xs text-slate-400">Add your first client to get started with fleet dispatch and multi-branch management.</p>
                      {activeRole === 'super_admin' && (
                        <Button variant="primary" size="sm" onClick={openCreateModal} className="mt-2">
                          <HiOutlinePlus className="w-4 h-4" /> Add Restaurant Client
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <HiOutlineBuildingStorefront className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{client.companyName}</p>
                          <p className="text-2xs text-slate-400">{client.address || 'Bengaluru Outlet'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {client.companyCode}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 dark:bg-[#242424] text-slate-700 dark:text-slate-300">
                        {client.businessType || 'RESTAURANT'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-1"><HiOutlineEnvelope className="w-3.5 h-3.5 text-slate-400" /> {client.email}</p>
                      {client.phone && <p className="flex items-center gap-1 text-2xs text-slate-400 mt-0.5"><HiOutlinePhone className="w-3.5 h-3.5 text-slate-400" /> {client.phone}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {client.city || 'Bengaluru'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase ${client.status === 'active' ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-slate-100 text-slate-500'}`}>
                        {client.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetailsModal(client)}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#242424] text-slate-500 hover:text-amber-500 transition-colors"
                          title="View Details & Branches"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        {(activeRole === 'super_admin' || activeRole === 'client_admin') && (
                          <button
                            onClick={() => openEditModal(client)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#242424] text-slate-500 hover:text-amber-500 transition-colors"
                            title="Edit Client"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </button>
                        )}
                        {activeRole === 'super_admin' && (
                          <button
                            onClick={() => {
                              setClientToDelete(client);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-500 transition-colors"
                            title="Delete Client"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Client Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedClient ? `${selectedClient.companyName} — Client Details` : 'Client Details'}
        size="lg"
      >
        {selectedClient && (
          <div className="space-y-5">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <HiOutlineBuildingStorefront className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedClient.companyName}</h3>
                  <p className="font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold">{selectedClient.companyCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-2xs font-bold uppercase ${selectedClient.status === 'active' ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-slate-100 text-slate-500'}`}>
                  {selectedClient.status || 'ACTIVE'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-2xs font-semibold bg-slate-200 dark:bg-[#282828] text-slate-700 dark:text-slate-300 uppercase">
                  {selectedClient.businessType || 'RESTAURANT'}
                </span>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E]">
                <p className="text-2xs text-slate-400 font-medium uppercase">Active Branches</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {loadingDetails ? '...' : clientBranches.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E]">
                <p className="text-2xs text-slate-400 font-medium uppercase">Max Allowed</p>
                <p className="text-lg font-bold text-amber-500 mt-0.5">
                  {selectedClient.maxBranches || 20}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E]">
                <p className="text-2xs text-slate-400 font-medium uppercase">Subscription</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 uppercase">
                  {selectedClient.subscriptionPlan || 'Enterprise'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E]">
                <p className="text-2xs text-slate-400 font-medium uppercase">Total Deliveries</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {loadingDetails ? '...' : (clientDeliveriesCount ?? 'Active')}
                </p>
              </div>
            </div>

            {/* Contact details */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2E2E2E] space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Contact & Location</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5"><HiOutlineEnvelope className="w-4 h-4 text-amber-500" /> {selectedClient.email}</p>
                <p className="flex items-center gap-1.5"><HiOutlinePhone className="w-4 h-4 text-amber-500" /> {selectedClient.phone || 'Not provided'}</p>
                <p className="flex items-center gap-1.5"><HiOutlineMapPin className="w-4 h-4 text-amber-500" /> {selectedClient.address || 'Address not listed'}, {selectedClient.city || 'Bengaluru'}</p>
                <p className="flex items-center gap-1.5"><HiOutlineClock className="w-4 h-4 text-amber-500" /> Registered: {new Date(selectedClient.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Branches List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Associated Outlets & Branches ({clientBranches.length})
                </h4>
              </div>

              {loadingDetails ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading client branches...</div>
              ) : clientBranches.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-dashed border-slate-300 dark:border-[#333333]">
                  <HiOutlineBuildingStorefront className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No branches found for this client.</p>
                  <p className="text-2xs text-slate-400 mt-0.5">Add a branch to start managing operations.</p>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {clientBranches.map((branch) => (
                    <div
                      key={branch._id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#2E2E2E] text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{branch.branchName}</p>
                        <p className="text-2xs text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                          <span>{branch.branchCode}</span>
                          <span>•</span>
                          <span>{branch.city || 'Bengaluru'}</span>
                          {branch.phone && <span>• {branch.phone}</span>}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase ${branch.status === 'active' ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-slate-100 text-slate-500'}`}>
                        {branch.status || 'ACTIVE'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
        title={editingClient ? `Edit Client: ${editingClient.companyName}` : 'Add Restaurant Client'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Subway India"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SUBWAY-BLR"
                value={formData.companyCode}
                onChange={(e) => setFormData({ ...formData, companyCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                required
                placeholder="manager@subway.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+919888877777"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Food Business Type
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              >
                <option value="RESTAURANT">Restaurant</option>
                <option value="FAST_FOOD">Fast Food</option>
                <option value="CAFE">Cafe</option>
                <option value="BAKERY">Bakery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="Bengaluru"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
              placeholder="100ft Road, Indiranagar"
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
              {editingClient ? 'Save Changes' : 'Create Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Restaurant Client"
        message={`Are you sure you want to deactivate ${clientToDelete?.companyName}? If active branches exist, deletion will be prevented to maintain database integrity.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ClientListPage;
