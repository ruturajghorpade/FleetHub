// FleetHub – Route Service
import api from '@/api/axios';

export const routeService = {
  /**
   * Get active delivery routes from delivery operations
   */
  getRoutes: async () => {
    try {
      const res = await api.get('/deliveries', { params: { limit: 50 } });
      const deliveries = res.data?.deliveries || [];
      // Derive route operations from deliveries
      return deliveries.map((d) => ({
        _id: d._id,
        routeId: `RT-${d.orderId?.replace('ORD-', '') || d._id.slice(-4)}`,
        name: `${d.pickupLocation?.name || 'Hub'} → ${d.deliveryLocation?.city || 'Destination'}`,
        origin: d.pickupLocation?.address || 'Outlet Hub',
        destination: d.deliveryLocation?.address || 'Customer Location',
        assignedDriver: d.assignedDriver?.firstName
          ? `${d.assignedDriver.firstName} ${d.assignedDriver.lastName || ''}`
          : 'Unassigned',
        assignedVehicle: d.assignedVehicle?.vehicleNumber || 'Unassigned',
        status: d.status,
        orderId: d.orderId,
      }));
    } catch {
      return [];
    }
  },
};

export default routeService;
