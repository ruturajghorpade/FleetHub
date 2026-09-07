// FleetHub – Delivery Service
import api from '@/api/axios';

export const deliveryService = {
  /**
   * Get all deliveries with pagination and filters
   */
  getDeliveries: async (params = {}) => {
    const res = await api.get('/deliveries', { params });
    return {
      deliveries: res.data?.deliveries || [],
      pagination: res.meta || {},
    };
  },

  /**
   * Get single delivery by ID
   */
  getDeliveryById: async (id) => {
    const res = await api.get(`/deliveries/${id}`);
    return res.data?.delivery;
  },

  /**
   * Create new delivery request (Client Admin or Super Admin)
   */
  createDelivery: async (deliveryData) => {
    const res = await api.post('/deliveries', deliveryData);
    return res.data?.delivery;
  },

  /**
   * Manually assign driver and vehicle to delivery (Dispatcher or Super Admin)
   */
  manualAssign: async (id, { driverId, vehicleId }) => {
    const res = await api.post(`/deliveries/${id}/assign`, { driverId, vehicleId });
    return res.data?.delivery;
  },

  /**
   * Auto-assign nearest available driver and vehicle (Dispatcher or Super Admin)
   */
  autoAssign: async (id) => {
    const res = await api.post(`/deliveries/${id}/auto-assign`);
    return res.data?.delivery;
  },

  /**
   * Update delivery lifecycle status (picked_up, out_for_delivery, delivered)
   */
  updateStatus: async (id, { status, note }) => {
    const res = await api.patch(`/deliveries/${id}/status`, { status, note });
    return res.data?.delivery;
  },

  /**
   * Cancel delivery (Client Admin allowed before pickup, Dispatcher / Super Admin)
   */
  cancelDelivery: async (id, { reason }) => {
    const res = await api.post(`/deliveries/${id}/cancel`, { reason });
    return res.data?.delivery;
  },
};

export default deliveryService;
