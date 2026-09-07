// FleetHub – Vehicle Service
import api from '@/api/axios';

export const vehicleService = {
  /**
   * Get all vehicles with optional filters
   */
  getVehicles: async (params = {}) => {
    const res = await api.get('/vehicles', { params });
    return {
      vehicles: res.data?.vehicles || [],
      meta: res.meta || {},
    };
  },

  /**
   * Get vehicle by ID
   */
  getVehicleById: async (id) => {
    const res = await api.get(`/vehicles/${id}`);
    return res.data?.vehicle;
  },

  /**
   * Create new vehicle
   */
  createVehicle: async (vehicleData) => {
    const res = await api.post('/vehicles', vehicleData);
    return res.data?.vehicle;
  },

  /**
   * Update vehicle
   */
  updateVehicle: async (id, vehicleData) => {
    const res = await api.put(`/vehicles/${id}`, vehicleData);
    return res.data?.vehicle;
  },

  /**
   * Delete vehicle
   */
  deleteVehicle: async (id) => {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  },
};

export default vehicleService;
