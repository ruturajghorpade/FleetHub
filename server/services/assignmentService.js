// FleetHub – Assignment Service (Food Delivery Logistics)
import Delivery from '../models/Delivery.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import ApiError from '../utils/apiError.js';
import { notifyDriverOnAssignment } from './notificationService.js';

/**
 * Automatically assign an available driver and available vehicle (bike/scooter/ev_bike) to a delivery.
 *
 * Requirements:
 * 1. Find AVAILABLE driver
 * 2. Find AVAILABLE bike
 * 3. Assign both to delivery
 * 4. Update driver availability → BUSY
 * 5. Update vehicle availability → ON_DELIVERY
 * 6. Update delivery status → ASSIGNED
 * 7. If no driver or vehicle exists → return proper message
 */
export const autoAssignDelivery = async (deliveryId, user) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw ApiError.notFound('Delivery not found');
  }

  if (delivery.status !== 'pending') {
    throw ApiError.badRequest(
      `Cannot auto-assign delivery with status "${delivery.status}". Must be in "pending" status.`
    );
  }

  // 1. Find AVAILABLE driver
  const availableDriver = await Driver.findOne({
    $or: [
      { availability: 'AVAILABLE' },
      { availability: 'available' },
      { status: 'available' },
    ],
    isDeleted: { $ne: true },
  });

  if (!availableDriver) {
    throw ApiError.badRequest('No available drivers found for automatic assignment');
  }

  // 2. Find AVAILABLE food delivery vehicle (bike/scooter/ev_bike)
  const availableVehicle = await Vehicle.findOne({
    $or: [
      { availability: 'AVAILABLE' },
      { availability: 'available' },
      { status: 'available' },
    ],
    vehicleType: {
      $in: ['BIKE', 'SCOOTER', 'EV_BIKE', 'bike', 'scooter', 'ev_bike'],
    },
    isDeleted: { $ne: true },
  });

  if (!availableVehicle) {
    throw ApiError.badRequest('No available delivery bikes or scooters found for automatic assignment');
  }

  // 3. Assign both & update delivery status
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

  // 4. Update driver availability → BUSY
  availableDriver.availability = 'BUSY';
  availableDriver.assignedVehicle = availableVehicle._id;
  await availableDriver.save();

  // 5. Update vehicle availability → ON_DELIVERY
  availableVehicle.availability = 'ON_DELIVERY';
  availableVehicle.assignedDriver = availableDriver._id;
  await availableVehicle.save();

  // 6. Notify driver
  await notifyDriverOnAssignment(delivery, availableDriver._id);

  return Delivery.findById(delivery._id)
    .populate('client', 'companyName phone address')
    .populate('assignedDriver', 'firstName lastName phone availability rating')
    .populate('assignedVehicle', 'vehicleNumber vehicleType brand model availability');
};

/**
 * Manually assign a specific driver and vehicle to a delivery.
 */
export const manualAssignDelivery = async (deliveryId, { driverId, vehicleId }, user) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw ApiError.notFound('Delivery not found');
  }

  if (delivery.status !== 'pending' && delivery.status !== 'assigned') {
    throw ApiError.badRequest(
      `Cannot reassign delivery with status "${delivery.status}"`
    );
  }

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw ApiError.notFound('Driver not found');
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found');
  }

  // If previous driver/vehicle existed, release them
  if (delivery.assignedDriver && delivery.assignedDriver.toString() !== driverId) {
    await Driver.findByIdAndUpdate(delivery.assignedDriver, { availability: 'AVAILABLE' });
  }
  if (delivery.assignedVehicle && delivery.assignedVehicle.toString() !== vehicleId) {
    await Vehicle.findByIdAndUpdate(delivery.assignedVehicle, { availability: 'AVAILABLE' });
  }

  // Assign new driver & vehicle
  delivery.assignedDriver = driver._id;
  delivery.assignedVehicle = vehicle._id;
  delivery.status = 'assigned';
  delivery.assignedAt = new Date();
  delivery.timeline.push({
    status: 'assigned',
    timestamp: new Date(),
    note: `Manually assigned to driver ${driver.firstName} ${driver.lastName} and vehicle ${vehicle.vehicleNumber}`,
    updatedBy: user?._id || null,
  });

  await delivery.save();

  // Update statuses
  driver.availability = 'BUSY';
  driver.assignedVehicle = vehicle._id;
  await driver.save();

  vehicle.availability = 'ON_DELIVERY';
  vehicle.assignedDriver = driver._id;
  await vehicle.save();

  // Notify driver
  await notifyDriverOnAssignment(delivery, driver._id);

  return Delivery.findById(delivery._id)
    .populate('client', 'companyName phone address')
    .populate('assignedDriver', 'firstName lastName phone availability rating')
    .populate('assignedVehicle', 'vehicleNumber vehicleType brand model availability');
};
