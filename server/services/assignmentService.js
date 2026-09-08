// FleetHub – Assignment Service (Food Delivery Logistics)
import Delivery from '../models/Delivery.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import Maintenance from '../models/Maintenance.js';
import ApiError from '../utils/apiError.js';
import { notifyDriverOnAssignment } from './notificationService.js';

const ACTIVE_DELIVERY_STATUSES = ['assigned', 'picked_up', 'out_for_delivery'];

/**
 * Automatically assign an available driver and available vehicle (bike/scooter/ev_bike) to a delivery.
 *
 * Requirements:
 * 1. Find AVAILABLE driver belonging to the delivery's client (and branch if specified)
 * 2. Find AVAILABLE bike/scooter belonging to the delivery's client (and branch if specified)
 * 3. Verify neither is already assigned to another active delivery
 * 4. Assign both to delivery
 * 5. Update driver availability → BUSY
 * 6. Update vehicle availability → ON_DELIVERY
 * 7. Update delivery status → ASSIGNED
 * 8. If no driver or vehicle exists → return proper message
 */
export const autoAssignDelivery = async (deliveryId, user) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw ApiError.notFound('Delivery not found');
  }

  // Tenant authorization check
  if (user?.role === 'client_admin' && user.client) {
    if (delivery.client.toString() !== user.client.toString()) {
      throw ApiError.forbidden('You are not authorized to assign this delivery');
    }
  }

  if (delivery.status !== 'pending') {
    throw ApiError.badRequest(
      `Cannot auto-assign delivery with status "${delivery.status}". Must be in "pending" status.`
    );
  }

  // Find IDs of drivers and vehicles currently assigned to active deliveries
  const activeDeliveries = await Delivery.find({
    _id: { $ne: delivery._id },
    status: { $in: ACTIVE_DELIVERY_STATUSES },
  }).select('assignedDriver assignedVehicle');

  const busyDriverIds = activeDeliveries.map((d) => d.assignedDriver).filter(Boolean);
  const busyVehicleIds = activeDeliveries.map((d) => d.assignedVehicle).filter(Boolean);

  // Also query vehicles currently under active maintenance
  const activeMaintenanceVehicles = await Maintenance.find({
    status: { $in: ['in_progress', 'IN_PROGRESS'] },
    isDeleted: { $ne: true },
  }).select('vehicle');
  const maintenanceVehicleIds = activeMaintenanceVehicles.map((m) => m.vehicle).filter(Boolean);

  // 1. Query candidate driver: must belong to the delivery's client
  const driverFilter = {
    client: delivery.client,
    _id: { $nin: busyDriverIds },
    isDeleted: { $ne: true },
    status: { $nin: ['inactive', 'suspended'] },
    availability: { $in: ['AVAILABLE', 'available'] },
  };
  if (delivery.branch) {
    driverFilter.branch = delivery.branch;
  }

  let availableDriver = await Driver.findOne(driverFilter);

  // If none found with branch filter, attempt fallback to same client
  if (!availableDriver && delivery.branch) {
    delete driverFilter.branch;
    availableDriver = await Driver.findOne(driverFilter);
  }

  if (!availableDriver) {
    throw ApiError.badRequest('No available drivers found for automatic assignment');
  }

  // 2. Query candidate vehicle: must belong to the delivery's client and be a bike/scooter
  const vehicleFilter = {
    client: delivery.client,
    _id: { $nin: [...busyVehicleIds, ...maintenanceVehicleIds] },
    isDeleted: { $ne: true },
    status: { $nin: ['maintenance', 'retired', 'inactive'] },
    availability: { $in: ['AVAILABLE', 'available'] },
    vehicleType: {
      $in: ['BIKE', 'SCOOTER', 'EV_BIKE', 'bike', 'scooter', 'ev_bike'],
    },
  };
  if (delivery.branch) {
    vehicleFilter.branch = delivery.branch;
  }

  let availableVehicle = await Vehicle.findOne(vehicleFilter);

  // Fallback to same client without branch if needed
  if (!availableVehicle && delivery.branch) {
    delete vehicleFilter.branch;
    availableVehicle = await Vehicle.findOne(vehicleFilter);
  }

  if (!availableVehicle) {
    throw ApiError.badRequest('No available delivery bikes or scooters found for automatic assignment');
  }

  // Double check race condition atomically
  const concurrentConflict = await Delivery.findOne({
    _id: { $ne: delivery._id },
    status: { $in: ACTIVE_DELIVERY_STATUSES },
    $or: [
      { assignedDriver: availableDriver._id },
      { assignedVehicle: availableVehicle._id },
    ],
  });

  if (concurrentConflict) {
    throw ApiError.conflict('Selected driver or vehicle was assigned in another concurrent transaction. Please retry.');
  }

  // Assign both & update delivery status
  delivery.assignedDriver = availableDriver._id;
  delivery.assignedVehicle = availableVehicle._id;
  delivery.status = 'assigned';
  delivery.assignedAt = new Date();
  delivery.timeline.push({
    status: 'assigned',
    timestamp: new Date(),
    note: `Auto-assigned to driver ${availableDriver.firstName} ${availableDriver.lastName} and vehicle ${availableVehicle.vehicleNumber}`,
    updatedBy: user?._id || null,
  });

  await delivery.save();

  // Update driver availability & status
  availableDriver.availability = 'BUSY';
  availableDriver.assignedVehicle = availableVehicle._id;
  await availableDriver.save();

  // Update vehicle availability & status
  availableVehicle.availability = 'ON_DELIVERY';
  availableVehicle.assignedDriver = availableDriver._id;
  await availableVehicle.save();

  // Notify driver
  await notifyDriverOnAssignment(delivery, availableDriver._id);

  return Delivery.findById(delivery._id)
    .populate('client', 'companyName phone address email businessType')
    .populate('branch', 'branchName branchCode address phone')
    .populate('assignedDriver', 'firstName lastName phone availability rating employeeId')
    .populate('assignedVehicle', 'vehicleNumber vehicleType brand model availability');
};

/**
 * Manually assign a specific driver and vehicle to a delivery.
 *
 * Validates:
 * - Delivery status is pending or assigned
 * - Driver exists, active, belongs to same client, available, not assigned elsewhere
 * - Vehicle exists, active, not maintenance, belongs to same client, available, not assigned elsewhere
 * - Driver and vehicle client compatibility
 */
export const manualAssignDelivery = async (deliveryId, { driverId, vehicleId }, user) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw ApiError.notFound('Delivery not found');
  }

  // Tenant authorization check
  if (user?.role === 'client_admin' && user.client) {
    if (delivery.client.toString() !== user.client.toString()) {
      throw ApiError.forbidden('You are not authorized to assign this delivery');
    }
  }

  if (delivery.status !== 'pending' && delivery.status !== 'assigned') {
    throw ApiError.badRequest(
      `Cannot assign delivery with status "${delivery.status}". Only pending or assigned orders may be assigned.`
    );
  }

  // 1. Driver Validation
  const driver = await Driver.findById(driverId);
  if (!driver || driver.isDeleted) {
    throw ApiError.notFound('Driver not found or has been deactivated');
  }

  if (driver.status === 'inactive' || driver.status === 'suspended') {
    throw ApiError.badRequest(`Driver ${driver.firstName} is currently ${driver.status}`);
  }

  // Verify Driver Client Ownership
  if (driver.client.toString() !== delivery.client.toString()) {
    throw ApiError.badRequest('Driver belongs to a different restaurant client');
  }

  // 2. Vehicle Validation
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle || vehicle.isDeleted) {
    throw ApiError.notFound('Vehicle not found or has been deactivated');
  }

  if (vehicle.status === 'retired' || vehicle.status === 'inactive') {
    throw ApiError.badRequest(`Vehicle ${vehicle.vehicleNumber} is currently ${vehicle.status}`);
  }

  if (vehicle.status === 'maintenance' || vehicle.availability === 'MAINTENANCE') {
    throw ApiError.badRequest(`Vehicle ${vehicle.vehicleNumber} is under maintenance and cannot be assigned`);
  }

  // Verify vehicle is not currently under an active in-progress maintenance record
  const activeMaintenance = await Maintenance.findOne({
    vehicle: vehicle._id,
    status: { $in: ['in_progress', 'IN_PROGRESS'] },
    isDeleted: { $ne: true },
  });
  if (activeMaintenance) {
    throw ApiError.badRequest(
      `Vehicle ${vehicle.vehicleNumber} is currently under maintenance and cannot be assigned to deliveries`
    );
  }

  // Verify Vehicle Client Ownership
  if (vehicle.client.toString() !== delivery.client.toString()) {
    throw ApiError.badRequest('Vehicle belongs to a different restaurant client');
  }

  // 3. Race Condition & Conflict Check:
  // Ensure neither Driver nor Vehicle is already assigned to another active delivery
  const conflictingDelivery = await Delivery.findOne({
    _id: { $ne: delivery._id },
    status: { $in: ACTIVE_DELIVERY_STATUSES },
    $or: [
      { assignedDriver: driverId },
      { assignedVehicle: vehicleId },
    ],
  });

  if (conflictingDelivery) {
    const conflictType = conflictingDelivery.assignedDriver?.toString() === driverId ? 'Driver' : 'Vehicle';
    throw ApiError.conflict(
      `${conflictType} is already assigned to another active delivery (#${conflictingDelivery.orderId})`
    );
  }

  // If this delivery was already assigned to a DIFFERENT driver or vehicle, release the previous ones
  if (delivery.assignedDriver && delivery.assignedDriver.toString() !== driverId.toString()) {
    await Driver.findByIdAndUpdate(delivery.assignedDriver, {
      availability: 'AVAILABLE',
      status: 'available',
      assignedVehicle: null,
    });
  }

  if (delivery.assignedVehicle && delivery.assignedVehicle.toString() !== vehicleId.toString()) {
    await Vehicle.findByIdAndUpdate(delivery.assignedVehicle, {
      availability: 'AVAILABLE',
      status: 'available',
      assignedDriver: null,
    });
  }

  // Assign new driver & vehicle
  delivery.assignedDriver = driver._id;
  delivery.assignedVehicle = vehicle._id;
  delivery.status = 'assigned';
  delivery.assignedAt = new Date();
  delivery.timeline.push({
    status: 'assigned',
    timestamp: new Date(),
    note: `Assigned to driver ${driver.firstName} ${driver.lastName} and vehicle ${vehicle.vehicleNumber}`,
    updatedBy: user?._id || null,
  });

  await delivery.save();

  // Update driver status
  driver.availability = 'BUSY';
  driver.assignedVehicle = vehicle._id;
  await driver.save();

  // Update vehicle status
  vehicle.availability = 'ON_DELIVERY';
  vehicle.assignedDriver = driver._id;
  await vehicle.save();

  // Notify driver
  await notifyDriverOnAssignment(delivery, driver._id);

  return Delivery.findById(delivery._id)
    .populate('client', 'companyName phone address email businessType')
    .populate('branch', 'branchName branchCode address phone')
    .populate('assignedDriver', 'firstName lastName phone availability rating employeeId')
    .populate('assignedVehicle', 'vehicleNumber vehicleType brand model availability');
};
