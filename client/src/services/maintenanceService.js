// FleetHub – Maintenance Service
import api from '@/api/axios';

export const maintenanceService = {
  /**
   * Get paginated maintenance logs
   */
  getMaintenanceRecords: async (params = {}) => {
    const res = await api.get('/maintenance', { params });
    return {
      records: res.data?.records || [],
      pagination: res.meta || {},
    };
  },

  /**
   * Get single maintenance record
   */
  getMaintenanceRecordById: async (id) => {
    const res = await api.get(`/maintenance/${id}`);
    return res.data?.record;
  },

  /**
   * Create maintenance entry
   */
  createMaintenance: async (data) => {
    const res = await api.post('/maintenance', data);
    return res.data?.record;
  },

  /**
   * Update maintenance record
   */
  updateMaintenance: async (id, data) => {
    const res = await api.put(`/maintenance/${id}`, data);
    return res.data?.record;
  },

  /**
   * Delete maintenance record
   */
  deleteMaintenance: async (id) => {
    const res = await api.delete(`/maintenance/${id}`);
    return res.data;
  },
};

export default maintenanceService;
