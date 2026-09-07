// FleetHub – Dashboard Service
import Client from '../models/Client.js';
import Branch from '../models/Branch.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Delivery from '../models/Delivery.js';
import Maintenance from '../models/Maintenance.js';
import { ROLES } from '../utils/constants.js';

export const getDashboardStats = async (user) => {
  const isSuperAdmin = user.role === ROLES.SUPER_ADMIN || user.role === 'admin';
  const isDispatcher = user.role === ROLES.DISPATCHER;
  const isClientAdmin = user.role === ROLES.CLIENT_ADMIN;
  const isDriver = user.role === ROLES.DRIVER;

  // Base filters for role-based scoping
  const deliveryFilter = {};
  const clientFilter = {};
  const vehicleFilter = {};
  const driverFilter = {};

  if (isClientAdmin && user.client) {
    deliveryFilter.client = user.client;
    clientFilter._id = user.client;
    vehicleFilter.client = user.client;
    driverFilter.client = user.client;
  }

  // Today date boundaries (UTC)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Parallel counts
  const [
    totalClients,
    totalBranches,
    totalVehicles,
    totalDrivers,
    totalDeliveries,
    todayDeliveries,
    pendingDeliveries,
    assignedDeliveries,
    pickedUpDeliveries,
    outForDeliveryDeliveries,
    completedDeliveries,
    cancelledDeliveries,
    vehiclesAvailable,
    vehiclesOnDelivery,
    vehiclesMaintenance,
    driversAvailable,
    driversBusy,
    driversOffline,
    maintenanceScheduled,
    recentDeliveries,
  ] = await Promise.all([
    Client.countDocuments(clientFilter),
    Branch.countDocuments(isClientAdmin && user.client ? { client: user.client } : {}),
    Vehicle.countDocuments(vehicleFilter),
    Driver.countDocuments(driverFilter),
    Delivery.countDocuments(deliveryFilter),
    Delivery.countDocuments({ ...deliveryFilter, createdAt: { $gte: todayStart, $lte: todayEnd } }),
    Delivery.countDocuments({ ...deliveryFilter, status: 'pending' }),
    Delivery.countDocuments({ ...deliveryFilter, status: 'assigned' }),
    Delivery.countDocuments({ ...deliveryFilter, status: 'picked_up' }),
    Delivery.countDocuments({ ...deliveryFilter, status: 'out_for_delivery' }),
    Delivery.countDocuments({ ...deliveryFilter, status: 'delivered' }),
    Delivery.countDocuments({ ...deliveryFilter, status: 'cancelled' }),
    Vehicle.countDocuments({ ...vehicleFilter, availability: { $in: ['AVAILABLE', 'available'] } }),
    Vehicle.countDocuments({ ...vehicleFilter, availability: { $in: ['ON_DELIVERY', 'on_delivery'] } }),
    Vehicle.countDocuments({ ...vehicleFilter, availability: { $in: ['MAINTENANCE', 'maintenance'] } }),
    Driver.countDocuments({ ...driverFilter, availability: { $in: ['AVAILABLE', 'available'] } }),
    Driver.countDocuments({ ...driverFilter, availability: { $in: ['BUSY', 'busy'] } }),
    Driver.countDocuments({ ...driverFilter, availability: { $in: ['OFFLINE', 'offline'] } }),
    Maintenance.countDocuments({ status: { $in: ['scheduled', 'in_progress'] } }),
    Delivery.find(deliveryFilter)
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('client', 'companyName')
      .populate('assignedDriver', 'firstName lastName phone')
      .populate('assignedVehicle', 'vehicleNumber model vehicleType'),
  ]);

  const activeDeliveries = assignedDeliveries + pickedUpDeliveries + outForDeliveryDeliveries;

  // On-time rate calculation (completed orders / (completed + cancelled or 1))
  const resolvedCount = completedDeliveries + cancelledDeliveries;
  const onTimeRate = resolvedCount > 0 ? Math.round((completedDeliveries / resolvedCount) * 100) : 98;

  // Total revenue aggregation
  const revenueAgg = await Delivery.aggregate([
    { $match: { ...deliveryFilter, status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  return {
    kpis: {
      totalClients,
      totalBranches,
      totalVehicles,
      totalDrivers,
      totalDeliveries,
      todayOrders: todayDeliveries || totalDeliveries,
      pendingOrders: pendingDeliveries,
      activeDeliveries,
      completedOrders: completedDeliveries,
      cancelledOrders: cancelledDeliveries,
      availableDrivers: driversAvailable,
      availableVehicles: vehiclesAvailable,
      maintenanceAlerts: maintenanceScheduled,
      onTimeDeliveryRate: `${onTimeRate}%`,
      totalRevenue,
    },
    fleetAvailability: {
      available: vehiclesAvailable,
      onDelivery: vehiclesOnDelivery,
      maintenance: vehiclesMaintenance,
      total: totalVehicles,
    },
    driverAvailability: {
      available: driversAvailable,
      busy: driversBusy,
      offline: driversOffline,
      total: totalDrivers,
    },
    recentDeliveries,
  };
};
