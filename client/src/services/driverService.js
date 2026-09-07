// FleetHub – Driver Service
import api from '@/api/axios';

export const driverService = {
  /**
   * Get all drivers with optional filters
   */
  getDrivers: async (params = {}) => {
    const res = await api.get('/drivers', { params });
    return {
      drivers: res.data?.drivers || [],
      meta: res.meta || {},
    };
  },

  /**
   * Get driver by ID
   */
  getDriverById: async (id) => {
    const res = await api.get(`/drivers/${id}`);
    return res.data?.driver;
  },

  /**
   * Create new driver
   */
  createDriver: async (driverData) => {
    const res = await api.post('/drivers', driverData);
    return res.data?.driver;
  },

  /**
   * Update driver
   */
  updateDriver: async (id, driverData) => {
    const res = await api.put(`/drivers/${id}`, driverData);
    return res.data?.driver;
  },

  /**
   * Delete driver
   */
  deleteDriver: async (id) => {
    const res = await api.delete(`/drivers/${id}`);
    return res.data;
  },

  /**
   * Assign vehicle to driver
   */
  assignVehicle: async (id, vehicleId) => {
    const res = await api.patch(`/drivers/${id}/assign-vehicle`, { vehicleId });
    return res.data?.driver;
  },

  /**
   * Remove assigned vehicle from driver
   */
  removeVehicle: async (id) => {
    const res = await api.patch(`/drivers/${id}/remove-vehicle`);
    return res.data?.driver;
  },
};

export default driverService;
