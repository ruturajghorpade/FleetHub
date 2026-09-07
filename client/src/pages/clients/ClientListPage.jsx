// FleetHub – Client Management Page (Food Delivery Logistics Clients)
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBuildingStorefront,
  HiOutlinePhone,
  HiOutlineEnvelope,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import clientService from '@/services/clientService';
import { showError, showSuccess } from '@/utils/toastUtils';
import { useAuth } from '@/context/AuthContext';

const ClientListPage = () => {
  const { activeRole } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    email: '',
    phone: '',
    businessType: 'RESTAURANT',
    address: '',
    city: 'Bengaluru',
    postalCode: '',
  });

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientService.getClients({ limit: 100 });
      setClients(data.clients || []);
    } catch {
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
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = c.companyName?.toLowerCase().includes(query);
        const matchCode = c.companyCode?.toLowerCase().includes(query);
        const matchEmail = c.email?.toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchEmail) return false;
      }
      return true;
    });
  }, [clients, statusFilter, searchQuery]);

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
      postalCode: client.postalCode || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingClient) {
        await clientService.updateClient(editingClient._id, formData);
        showSuccess('Client updated successfully!');
      } else {
        await clientService.createClient(formData);
        showSuccess('Client created successfully!');
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
      showSuccess('Client deleted successfully!');
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-[#2E2E2E] shadow-card">
        <div className="relative w-full sm:w-80">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, code, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Company Name</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Code</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Business Type</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Contact Details</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">City</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-center">Status</th>
                {activeRole === 'super_admin' && (
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                    Loading restaurant clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                    No restaurant clients found. Click "Add Restaurant Client" to create one.
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
                    {activeRole === 'super_admin' && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(client)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#242424] text-slate-500 hover:text-amber-500 transition-colors"
                            title="Edit Client"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </button>
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
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
                placeholder="e.g. SUB-BLR"
                value={formData.companyCode}
                onChange={(e) => setFormData({ ...formData, companyCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
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
                placeholder="+91 80 2555 1234"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Type
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
        title="Delete Client"
        message={`Are you sure you want to delete ${clientToDelete?.companyName}? Associated branches and records will be archived.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ClientListPage;
