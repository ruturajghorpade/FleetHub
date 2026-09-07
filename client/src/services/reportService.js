// FleetHub – Reports & Analytics Service
import api from '@/api/axios';

export const reportService = {
  /**
   * Get 7-day daily delivery volume trends
   */
  getDailyDeliveries: async () => {
    const res = await api.get('/reports/daily-deliveries');
    return res.data?.dailyDeliveries || [];
  },

  /**
   * Get restaurant-wise delivery volume and revenue
   */
  getRestaurantReport: async () => {
    const res = await api.get('/reports/restaurants');
    return res.data?.restaurants || [];
  },

  /**
   * Get driver performance, ratings, and delivery stats
   */
  getDriverReport: async () => {
    const res = await api.get('/reports/drivers');
    return res.data?.drivers || [];
  },

  /**
   * Get fleet vehicle usage by availability & model
   */
  getVehicleUsageReport: async () => {
    const res = await api.get('/reports/vehicle-usage');
    return res.data?.vehicleUsage || [];
  },

  /**
   * Get pre-pickup cancellation audit logs
   */
  getCancelledDeliveries: async () => {
    const res = await api.get('/reports/cancelled-deliveries');
    return res.data?.cancelledDeliveries || [];
  },
};

export default reportService;
