// FleetHub – Maintenance Service (Food Delivery Fleet Logistics)
import api from '@/api/axios';

export const maintenanceService = {
  /**
   * Get paginated maintenance logs with summary KPIs
   */
  getMaintenanceRecords: async (params = {}) => {
    const res = await api.get('/maintenance', { params });
    return {
      records: res.data?.records || [],
      summary: res.data?.summary || {},
      pagination: res.meta || res.pagination || {},
    };
  },

  /**
   * Get single maintenance record with audit history
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
   * Start maintenance (transitions status to in_progress & marks vehicle unavailable)
   */
  startMaintenance: async (id) => {
    const res = await api.patch(`/maintenance/${id}/start`);
    return res.data?.record;
  },

  /**
   * Complete maintenance (transitions status to completed & restores vehicle availability)
   */
  completeMaintenance: async (id, data = {}) => {
    const res = await api.patch(`/maintenance/${id}/complete`, data);
    return res.data?.record;
  },

  /**
   * Cancel maintenance
   */
  cancelMaintenance: async (id, data = {}) => {
    const res = await api.patch(`/maintenance/${id}/cancel`, data);
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
