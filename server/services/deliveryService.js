// FleetHub – Delivery Service (Food Delivery Logistics)
import Delivery from '../models/Delivery.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import ApiError from '../utils/apiError.js';
import { notifyOnCancellation } from './notificationService.js';

/**
 * Generate a friendly orderId if none provided (e.g., ORD-782194)
 */
const generateOrderId = (prefix = 'ORD') => {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${rand}`;
};

/**
 * Create a new food delivery request.
 * Initial status: PENDING
 */
export const createDelivery = async (data, user) => {
  const orderId = data.orderId || generateOrderId();

  const clientId = user.role === 'client_admin' && user.client ? user.client : data.client;
  if (!clientId) {
    throw ApiError.badRequest('Client (restaurant) reference is required');
  }

  const delivery = await Delivery.create({
    ...data,
    orderId,
    client: clientId,
    status: 'pending',
    createdBy: user._id,
    timeline: [
      {
        status: 'pending',
        timestamp: new Date(),
        note: 'Delivery request submitted by restaurant',
        updatedBy: user._id,
      },
    ],
  });

  return Delivery.findById(delivery._id).populate('client', 'companyName phone address');
};

/**
 * Client or Dispatcher cancels a delivery request.
 *
 * Requirements:
 * - Client may cancel delivery ONLY IF status is PENDING or ASSIGNED.
 * - If status is PICKED_UP, OUT_FOR_DELIVERY, or DELIVERED:
 *   Cannot cancel. Return proper validation error.
 * - After cancellation:
 *   Status = CANCELLED
 *   Save cancelledBy, cancellationReason, cancelledAt
 *   Release assigned driver → AVAILABLE
 *   Release assigned vehicle → AVAILABLE
 *   Notify Dispatcher & Driver
 */
export const cancelDelivery = async (deliveryId, { reason }, user) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw ApiError.notFound('Delivery not found');
  }

  // Permission check: if client_admin, must belong to their client
  if (user.role === 'client_admin' && user.client) {
    if (delivery.client.toString() !== user.client.toString()) {
      throw ApiError.forbidden('You can only cancel your own restaurant deliveries');
    }
  }

  // Cancellation rule: ONLY allowed if status is PENDING or ASSIGNED
  const nonCancellableStatuses = ['picked_up', 'out_for_delivery', 'delivered'];
  if (nonCancellableStatuses.includes(delivery.status.toLowerCase())) {
    throw ApiError.badRequest(
      `Cannot cancel delivery once it is "${delivery.status}". Cancellation is only allowed before pickup.`
    );
  }

  const previousStatus = delivery.status;
  delivery.status = 'cancelled';
  delivery.cancelledBy = user._id;
  delivery.cancellationReason = reason || 'Cancelled by client';
  delivery.cancelledAt = new Date();

  delivery.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Delivery cancelled (${reason || 'No reason provided'}). Previous status: ${previousStatus}`,
    updatedBy: user._id,
  });

  // Release assigned driver if any
  if (delivery.assignedDriver) {
    await Driver.findByIdAndUpdate(delivery.assignedDriver, {
      availability: 'AVAILABLE',
      assignedVehicle: null,
    });
  }

  // Release assigned vehicle if any
  if (delivery.assignedVehicle) {
    await Vehicle.findByIdAndUpdate(delivery.assignedVehicle, {
      availability: 'AVAILABLE',
      assignedDriver: null,
    });
  }

  await delivery.save();

  // Notify Dispatcher and Driver
  const cancelledByName = user.name || (user.role === 'client_admin' ? 'Restaurant Client' : 'Admin');
  await notifyOnCancellation(delivery, cancelledByName);

  return Delivery.findById(delivery._id)
    .populate('client', 'companyName phone')
    .populate('assignedDriver', 'firstName lastName phone')
    .populate('assignedVehicle', 'vehicleNumber vehicleType');
};

/**
 * Driver or Dispatcher updates delivery status.
 * Allowed transitions:
 *   ASSIGNED → PICKED_UP
 *   PICKED_UP → OUT_FOR_DELIVERY
 *   OUT_FOR_DELIVERY → DELIVERED
 */
export const updateDeliveryStatus = async (deliveryId, { status, note }, user) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw ApiError.notFound('Delivery not found');
  }

  const normalizedStatus = status.toLowerCase();
  const allowedStatuses = ['pending', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'];

  if (!allowedStatuses.includes(normalizedStatus)) {
    throw ApiError.badRequest(`Invalid status "${status}"`);
  }

  // Driver authorization check
  if (user.role === 'driver') {
    // If driver, ensure delivery is assigned to them
    const driverDoc = await Driver.findOne({ user: user._id });
    if (driverDoc && delivery.assignedDriver) {
      if (delivery.assignedDriver.toString() !== driverDoc._id.toString()) {
        throw ApiError.forbidden('You are not assigned to this delivery');
      }
    }
  }

  delivery.status = normalizedStatus;
  if (normalizedStatus === 'delivered') {
    delivery.deliveredAt = new Date();

    // Release driver and vehicle
    if (delivery.assignedDriver) {
      await Driver.findByIdAndUpdate(delivery.assignedDriver, {
        availability: 'AVAILABLE',
        assignedVehicle: null,
      });
    }
    if (delivery.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(delivery.assignedVehicle, {
        availability: 'AVAILABLE',
        assignedDriver: null,
      });
    }
  }

  delivery.timeline.push({
    status: normalizedStatus,
    timestamp: new Date(),
    note: note || `Status updated to ${normalizedStatus.replace(/_/g, ' ').toUpperCase()}`,
    updatedBy: user._id,
  });

  await delivery.save();

  return Delivery.findById(delivery._id)
    .populate('client', 'companyName phone address')
    .populate('assignedDriver', 'firstName lastName phone availability')
    .populate('assignedVehicle', 'vehicleNumber vehicleType brand model availability');
};

/**
 * Query deliveries with role-based visibility and filters.
 */
export const getDeliveries = async (query = {}, user) => {
  const filter = {};

  // Role scoping: Client Admin only views their own deliveries
  if (user.role === 'client_admin') {
    if (user.client) {
      filter.client = user.client;
    }
  }

  // Role scoping: Driver only views their assigned deliveries
  if (user.role === 'driver') {
    const driverDoc = await Driver.findOne({ user: user._id });
    if (driverDoc) {
      filter.assignedDriver = driverDoc._id;
    }
  }

  // Optional status filter
  if (query.status && query.status !== 'all') {
    filter.status = query.status.toLowerCase();
  }

  // Optional client filter (for super_admin or dispatcher)
  if (query.client && user.role !== 'client_admin') {
    filter.client = query.client;
  }

  // Search by orderId, customerName, or phone
  if (query.search) {
    filter.$or = [
      { orderId: { $regex: query.search, $options: 'i' } },
      { customerName: { $regex: query.search, $options: 'i' } },
      { customerPhone: { $regex: query.search, $options: 'i' } },
    ];
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  const [deliveries, total] = await Promise.all([
    Delivery.find(filter)
      .populate('client', 'companyName phone businessType address')
      .populate('assignedDriver', 'firstName lastName phone availability rating')
      .populate('assignedVehicle', 'vehicleNumber vehicleType model availability')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Delivery.countDocuments(filter),
  ]);

  return {
    deliveries,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get delivery by ID with populated references.
 */
export const getDeliveryById = async (deliveryId, user) => {
  const delivery = await Delivery.findById(deliveryId)
    .populate('client', 'companyName phone address email businessType')
    .populate('assignedDriver', 'firstName lastName phone availability rating')
    .populate('assignedVehicle', 'vehicleNumber vehicleType brand model availability')
    .populate('cancelledBy', 'name role email');

  if (!delivery) {
    throw ApiError.notFound('Delivery not found');
  }

  if (user.role === 'client_admin' && user.client) {
    if (delivery.client?._id?.toString() !== user.client.toString()) {
      throw ApiError.forbidden('You are not authorized to view this delivery');
    }
  }

  return delivery;
};
