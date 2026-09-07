// FleetHub – Users & Role-Based Access Control Management Page
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEnvelope,
  HiOutlinePhone,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import userService from '@/services/userService';
import clientService from '@/services/clientService';
import branchService from '@/services/branchService';
import { showError, showSuccess } from '@/utils/toastUtils';
import { useAuth } from '@/context/AuthContext';

const UserListPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'dispatcher',
    client: '',
    branch: '',
    isActive: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usrRes, cliRes, braRes] = await Promise.all([
        userService.getUsers({ limit: 100 }),
        clientService.getClients({ limit: 50 }),
        branchService.getBranches({ limit: 50 }),
      ]);
      setUsers(usrRes.users || []);
      setClients(cliRes.clients || []);
      setBranches(braRes.branches || []);
    } catch (err) {
      showError(err.message || 'Failed to load system users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all') {
        const active = u.isActive !== false;
        if (statusFilter === 'active' && !active) return false;
        if (statusFilter === 'inactive' && active) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchPhone = u.phone?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'dispatcher',
      client: clients[0]?._id || '',
      branch: branches[0]?._id || '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      role: u.role || 'dispatcher',
      client: u.client?._id || u.client || '',
      branch: u.branch?._id || u.branch || '',
      isActive: u.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showError('Please provide both name and email');
      return;
    }
    if (!editingUser && (!formData.password || formData.password.length < 8)) {
      showError('Password must be at least 8 characters long for new users');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password;
      }
      if (payload.role === 'super_admin') {
        delete payload.client;
        delete payload.branch;
      }

      if (editingUser) {
        await userService.updateUser(editingUser._id, payload);
        showSuccess(`User ${formData.name} updated successfully`);
      } else {
        await userService.createUser(payload);
        showSuccess(`User account created for ${formData.name}`);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isCurrentlyActive = user.isActive !== false;
    setSubmitting(true);
    try {
      if (isCurrentlyActive) {
        await userService.deactivateUser(user._id);
        showSuccess(`Deactivated ${user.name}'s account`);
      } else {
        await userService.activateUser(user._id);
        showSuccess(`Activated ${user.name}'s account`);
      }
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to toggle account status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setSubmitting(true);
    try {
      await userService.deleteUser(userToDelete._id);
      showSuccess(`User ${userToDelete.name} deleted`);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            👑 Super Admin
          </span>
        );
      case 'client_admin':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            🍕 Client Admin
          </span>
        );
      case 'dispatcher':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            📻 Dispatcher
          </span>
        );
      case 'driver':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            🛵 Driver Partner
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#242424] text-[#A3A3A3]">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="User & Access Control"
        subtitle="Manage FleetHub system users, food logistics client administrators, dispatchers, and credentials."
        actions={
          <Button
            variant="primary"
            leftIcon={<HiOutlinePlus className="w-5 h-5" />}
            onClick={handleOpenCreateModal}
          >
            Create User Account
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Total Accounts</p>
          <p className="text-2xl font-black text-white mt-1">{users.length}</p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-amber-400 uppercase tracking-wider">Super Admins</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {users.filter((u) => u.role === 'super_admin').length}
          </p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-sky-400 uppercase tracking-wider">Client Admins</p>
          <p className="text-2xl font-black text-sky-400 mt-1">
            {users.filter((u) => u.role === 'client_admin').length}
          </p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-purple-400 uppercase tracking-wider">Dispatchers</p>
          <p className="text-2xl font-black text-purple-400 mt-1">
            {users.filter((u) => u.role === 'dispatcher').length}
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
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="client_admin">Client Admin</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="driver">Driver Partner</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden border border-[#2E2E2E]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] border-b border-[#2E2E2E] text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Organization / Client</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424] text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#A3A3A3]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading user accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#A3A3A3]">
                    <HiOutlineUser className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    No user accounts match your search or filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const clientName = user.client?.name || (user.role === 'super_admin' ? 'FastFleet Platform' : 'General Fleet');
                  const isActive = user.isActive !== false;

                  return (
                    <tr key={user._id} className="hover:bg-[#161616] transition-colors">
                      {/* User Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">
                              {user.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-[#A3A3A3] flex items-center gap-1">
                                <HiOutlineEnvelope className="w-3 h-3 text-slate-500" />
                                {user.email}
                              </span>
                              {user.phone && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <HiOutlinePhone className="w-3 h-3 text-slate-600" />
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Organization / Client */}
                      <td className="py-3.5 px-4">
                        <p className="text-white font-medium">{clientName}</p>
                        {user.branch?.name && (
                          <p className="text-xs text-[#A3A3A3]">{user.branch.name}</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={isActive ? 'Deactivate Account' : 'Activate Account'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                            }`}
                          >
                            {isActive ? (
                              <HiOutlineXCircle className="w-4 h-4" />
                            ) : (
                              <HiOutlineCheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit User"
                            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </button>
                          {currentUser?._id !== user._id && (
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setDeleteConfirmOpen(true);
                              }}
                              title="Delete User"
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

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `Edit Account: ${editingUser.name}` : 'Create New System User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="e.g. user@fastfleet.in"
              />
            </div>

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
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
              {editingUser ? 'New Password (leave blank to keep existing)' : 'Password * (min 8 chars)'}
            </label>
            <input
              type="password"
              required={!editingUser}
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
              Role & Permissions *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
            >
              <option value="super_admin">👑 Super Admin (Full Platform Access)</option>
              <option value="client_admin">🍕 Client Admin (Restaurant Client)</option>
              <option value="dispatcher">📻 Dispatcher (Fleet Operations)</option>
              <option value="driver">🛵 Driver Partner (Rider App)</option>
            </select>
          </div>

          {formData.role !== 'super_admin' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                  Associated Restaurant Client
                </label>
                <select
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                >
                  <option value="">-- No Client Attached --</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                  Associated Branch
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                >
                  <option value="">-- No Branch Attached --</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete ${userToDelete?.name}? They will no longer be able to log in to FleetHub.`}
        confirmText="Delete Account"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  );
};

export default UserListPage;
