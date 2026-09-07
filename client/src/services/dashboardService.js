// FleetHub – Dashboard Service
import api from '@/api/axios';

export const dashboardService = {
  /**
   * Get operational dashboard statistics and KPIs
   * @returns {Promise<{ kpis: object, fleetAvailability: object, driverAvailability: object, recentDeliveries: Array }>}
   */
  getStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};

export default dashboardService;
