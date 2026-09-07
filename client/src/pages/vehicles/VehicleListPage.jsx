// FleetHub – Vehicle Fleet Management Page (Food Delivery Bikes & EV Fleet)
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineTruck,
  HiOutlineBolt,
  HiOutlineFunnel,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import vehicleService from '@/services/vehicleService';
import clientService from '@/services/clientService';
import branchService from '@/services/branchService';
import { showError, showSuccess } from '@/utils/toastUtils';
import { useAuth } from '@/context/AuthContext';

const VehicleListPage = () => {
  const { activeRole } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'ev_bike',
    brand: '',
    model: '',
    client: '',
    branch: '',
    fuelType: 'electric',
    engineNumber: '',
    chassisNumber: '',
    availability: 'AVAILABLE',
    odometer: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [vehRes, cliRes, braRes] = await Promise.all([
        vehicleService.getVehicles({ limit: 100 }),
        clientService.getClients({ limit: 50 }),
        branchService.getBranches({ limit: 50 }),
      ]);
      setVehicles(vehRes.vehicles || []);
      setClients(cliRes.clients || []);
      setBranches(braRes.branches || []);

      if (cliRes.clients?.length > 0 && braRes.branches?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          client: cliRes.clients[0]._id,
          branch: braRes.branches[0]._id,
        }));
      }
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const avail = v.availability?.toUpperCase() || 'AVAILABLE';
      if (availabilityFilter !== 'all' && avail !== availabilityFilter) return false;
      if (typeFilter !== 'all' && v.vehicleType?.toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNum = v.vehicleNumber?.toLowerCase().includes(query);
        const matchModel = v.model?.toLowerCase().includes(query);
        const matchBrand = v.brand?.toLowerCase().includes(query);
        if (!matchNum && !matchModel && !matchBrand) return false;
      }
      return true;
    });
  }, [vehicles, availabilityFilter, typeFilter, searchQuery]);

  const openCreateModal = () => {
    setEditingVehicle(null);
    setFormData({
      vehicleNumber: '',
      vehicleType: 'ev_bike',
      brand: 'Ather Energy',
      model: 'Ather 450X',
      client: clients[0]?._id || '',
      branch: branches[0]?._id || '',
      fuelType: 'electric',
      engineNumber: `ENG-${Math.floor(1000 + Math.random() * 9000)}`,
      chassisNumber: `CHS-${Math.floor(1000 + Math.random() * 9000)}`,
      availability: 'AVAILABLE',
      odometer: 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber || '',
      vehicleType: vehicle.vehicleType || 'ev_bike',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      client: vehicle.client?._id || vehicle.client || '',
      branch: vehicle.branch?._id || vehicle.branch || '',
      fuelType: vehicle.fuelType || 'electric',
      engineNumber: vehicle.engineNumber || '',
      chassisNumber: vehicle.chassisNumber || '',
      availability: vehicle.availability?.toUpperCase() || 'AVAILABLE',
      odometer: vehicle.odometer || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle._id, formData);
        showSuccess('Vehicle updated successfully!');
      } else {
        await vehicleService.createVehicle(formData);
        showSuccess('Vehicle registered to fleet successfully!');
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
    if (!vehicleToDelete) return;
    try {
      await vehicleService.deleteVehicle(vehicleToDelete._id);
      showSuccess('Vehicle removed from fleet!');
      setDeleteConfirmOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Fleet Vehicles"
        subtitle="Manage EV delivery bikes, scooters, maintenance status, and store allocations"
      >
        {(activeRole === 'super_admin' || activeRole === 'client_admin' || activeRole === 'dispatcher') && (
          <Button variant="primary" size="md" onClick={openCreateModal}>
            <HiOutlinePlus className="w-5 h-5" />
            Add Fleet Vehicle
          </Button>
        )}
      </PageHeader>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111111] p-3 rounded-xl border border-slate-200 dark:border-[#2E2E2E] shadow-card">
        <div className="relative w-full sm:w-80">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vehicle number, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
          >
            <option value="all">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_DELIVERY">On Delivery</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#404040] text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
          >
            <option value="all">All Vehicle Types</option>
            <option value="ev_bike">EV Bike</option>
            <option value="scooter">Scooter</option>
            <option value="bike">Bike</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50 dark:bg-[#1A1A1A]">
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Reg Number</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Model & Brand</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Type / Fuel</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">Assigned Branch</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-center">Availability</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-right">Odometer</th>
                {(activeRole === 'super_admin' || activeRole === 'dispatcher') && (
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                    Loading fleet vehicles from MongoDB...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">
                    No vehicles found matching filters. Click "Add Fleet Vehicle" to register one.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const avail = vehicle.availability?.toUpperCase() || 'AVAILABLE';
                  const isEV = vehicle.fuelType === 'electric' || vehicle.vehicleType === 'ev_bike';

                  return (
                    <tr key={vehicle._id} className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-md ${isEV ? 'bg-amber-500/15 text-amber-500' : 'bg-slate-100 text-slate-500'}`}>
                            {isEV ? <HiOutlineBolt className="w-4 h-4" /> : <HiOutlineTruck className="w-4 h-4" />}
                          </span>
                          {vehicle.vehicleNumber}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{vehicle.model}</p>
                        <p className="text-2xs text-slate-400">{vehicle.brand || 'FastFleet Operations'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 dark:bg-[#242424] text-slate-700 dark:text-slate-300 uppercase">
                          {vehicle.vehicleType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                        {vehicle.branch?.branchName || vehicle.client?.companyName || 'Indiranagar Hub'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-2xs font-bold uppercase ${
                            avail === 'AVAILABLE'
                              ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400'
                              : avail === 'ON_DELIVERY'
                              ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400'
                              : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {avail.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                        {(vehicle.odometer || 0).toLocaleString('en-IN')} km
                      </td>
                      {(activeRole === 'super_admin' || activeRole === 'dispatcher') && (
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(vehicle)}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#242424] text-slate-500 hover:text-amber-500 transition-colors"
                              title="Edit Vehicle"
                            >
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setVehicleToDelete(vehicle);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-500 transition-colors"
                              title="Delete Vehicle"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVehicle ? `Edit Vehicle: ${editingVehicle.vehicleNumber}` : 'Register New Fleet Vehicle'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Reg Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. KA01EF7788"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Type *
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              >
                <option value="ev_bike">EV Bike</option>
                <option value="scooter">Scooter</option>
                <option value="bike">Motorcycle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                placeholder="Ather / Bajaj / Ola"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Model Name
              </label>
              <input
                type="text"
                placeholder="450X / Chetak / S1 Pro"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Restaurant Client *
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Branch Outlet *
              </label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Availability Status
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_DELIVERY">On Delivery</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Odometer (km)
              </label>
              <input
                type="number"
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-[#404040] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to remove vehicle ${vehicleToDelete?.vehicleNumber} from the fleet?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default VehicleListPage;
