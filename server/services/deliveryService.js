// FleetHub – Delivery Service (Food Delivery Logistics)
import Delivery from '../models/Delivery.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import Branch from '../models/Branch.js';
import ApiError from '../utils/apiError.js';
import { notifyOnCancellation, notifyOnStatusUpdate } from './notificationService.js';

/**
 * Generate a friendly orderId if none provided (e.g., ORD-782194)
 */
const generateOrderId = (prefix = 'ORD') => {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${rand}`;
};

/**
 * Valid state transitions for Delivery lifecycle
 */
const VALID_TRANSITIONS = {
  pending: ['assigned', 'cancelled'],
  assigned: ['picked_up', 'cancelled'],
  picked_up: ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

/**
 * Create a new food delivery request.
 * Initial status: PENDING
 */
export const createDelivery = async (data, user) => {
  const orderId = data.orderId || generateOrderId();

  // Enforce client ownership from authenticated user
  const clientId = user.role === 'client_admin' && user.client ? user.client : data.client;
  if (!clientId) {
    throw ApiError.badRequest('Client (restaurant) reference is required');
  }

  // Branch ownership verification
  let branchId = data.branch || null;
  if (branchId) {
    const branchDoc = await Branch.findById(branchId);
    if (!branchDoc || branchDoc.isDeleted) {
      throw ApiError.badRequest('Specified branch does not exist');
    }
    if (branchDoc.client.toString() !== clientId.toString()) {
      throw ApiError.badRequest('Branch does not belong to the selected client');
    }
  }

  const delivery = await Delivery.create({
    ...data,
    orderId,
    client: clientId,
    branch: branchId,
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

  return Delivery.findById(delivery._id)
    .populate('client', 'companyName phone address email businessType')
    .populate('branch', 'branchName branchCode address phone')
    .populate('timeline.updatedBy', 'name role email');
};

/**
 * Client or Dispatcher cancels a delivery request.
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
  const nonCancellableStatuses = ['picked_up', 'out_for_delivery', 'delivered', 'cancelled'];
  if (nonCancellableStatuses.includes(delivery.status.toLowerCase())) {
    throw ApiError.badRequest(
      `Cannot cancel delivery once it is "${delivery.status}". Cancellation is only allowed before pickup.`
    );
  }

  if (!reason || !reason.trim()) {
    throw ApiError.badRequest('Cancellation reason is required');
  }

  const previousStatus = delivery.status;
  delivery.status = 'cancelled';
  delivery.cancelledBy = user._id;
  delivery.cancellationReason = reason.trim();
  delivery.cancelledAt = new Date();

  delivery.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Delivery cancelled (${reason.trim()}). Previous status: ${previousStatus}`,
    updatedBy: user._id,
  });

  // Release assigned driver if any
  if (delivery.assignedDriver) {
    await Driver.findByIdAndUpdate(delivery.assignedDriver, {
      availability: 'AVAILABLE',
      status: 'available',
      assignedVehicle: null,
    });
  }

  // Release assigned vehicle if any
  if (delivery.assignedVehicle) {
    await Vehicle.findByIdAndUpdate(delivery.assignedVehicle, {
      availability: 'AVAILABLE',
      status: 'available',
      assignedDriver: null,
    });
  }

  await delivery.save();

  // Notify Dispatcher and Driver
  const cancelledByName = user.name || (user.role === 'client_admin' ? 'Restaurant Client' : 'Admin');
  await notifyOnCancellation(delivery, cancelledByName);

  return Delivery.findById(delivery._id)
    .populate('client', 'companyName phone address')
    .populate('branch', 'branchName branchCode address phone')
    .populate('assignedDriver', 'firstName lastName phone')
    .populate('assignedVehicle', 'vehicleNumber vehicleType')
    .populate('timeline.updatedBy', 'name role email')
    .populate('cancelledBy', 'name role email');
};

/**
 * Driver, Dispatcher or Admin updates delivery status.
 */
export const updateDeliveryStatus = async (deliveryId, { status, note }, user) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw ApiError.notFound('Delivery not found');
  }

  // Client admin check
  if (user.role === 'client_admin' && user.client) {
    if (delivery.client.toString() !== user.client.toString()) {
      throw ApiError.forbidden('You are not authorized to update this delivery');
    }
  }

  // Driver authorization check
  if (user.role === 'driver') {
    const driverDoc = await Driver.findOne({ user: user._id });
    if (!driverDoc || !delivery.assignedDriver || delivery.assignedDriver.toString() !== driverDoc._id.toString()) {
      throw ApiError.forbidden('You are not assigned to this delivery');
    }
  }

  const currentStatus = (delivery.status || 'pending').toLowerCase();
  const normalizedStatus = status ? status.toLowerCase() : '';

  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(normalizedStatus)) {
    throw ApiError.badRequest(
      `Invalid status transition from "${currentStatus}" to "${normalizedStatus}". Allowed transitions: ${allowedNext.length > 0 ? allowedNext.join(', ') : 'none (terminal state)'}`
    );
  }

  delivery.status = normalizedStatus;

  // Status-specific updates
  if (normalizedStatus === 'picked_up' || normalizedStatus === 'out_for_delivery') {
    if (delivery.assignedDriver) {
      await Driver.findByIdAndUpdate(delivery.assignedDriver, {
        availability: 'BUSY',
        status: 'on_trip',
      });
    }
    if (delivery.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(delivery.assignedVehicle, {
        availability: 'ON_DELIVERY',
        status: 'on_trip',
      });
    }
  } else if (normalizedStatus === 'delivered') {
    delivery.deliveredAt = new Date();

    // Release driver and vehicle
    if (delivery.assignedDriver) {
      await Driver.findByIdAndUpdate(delivery.assignedDriver, {
        availability: 'AVAILABLE',
        status: 'available',
        assignedVehicle: null,
      });
    }
    if (delivery.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(delivery.assignedVehicle, {
        availability: 'AVAILABLE',
        status: 'available',
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

  // Notify Dispatcher and stakeholders
  const updatedByName = user.name || (user.role === 'driver' ? 'Assigned Driver' : 'Staff');
  await notifyOnStatusUpdate(delivery, normalizedStatus, updatedByName);

  return Delivery.findById(delivery._id)
    .populate('client', 'companyName phone address')
    .populate('branch', 'branchName branchCode address phone')
    .populate('assignedDriver', 'firstName lastName phone availability rating')
    .populate('assignedVehicle', 'vehicleNumber vehicleType brand model availability')
    .populate('timeline.updatedBy', 'name role email');
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
    } else {
      filter.assignedDriver = null;
    }
  }

  // Role scoping: Branch check (if user has branch assigned, e.g. branch manager)
  if (user.branch && !filter.branch && user.role !== 'super_admin') {
    filter.branch = user.branch;
  }

  // Optional status filter
  if (query.status && query.status !== 'all') {
    filter.status = query.status.toLowerCase();
  }

  // Optional client filter (for super_admin or dispatcher)
  if (query.client && query.client !== 'all' && user.role !== 'client_admin') {
    filter.client = query.client;
  }

  // Optional branch filter
  if (query.branch && query.branch !== 'all') {
    filter.branch = query.branch;
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
      .populate('branch', 'branchName branchCode address phone')
      .populate('assignedDriver', 'firstName lastName phone availability rating')
      .populate('assignedVehicle', 'vehicleNumber vehicleType model availability')
      .populate('timeline.updatedBy', 'name role email')
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
    .populate('branch', 'branchName branchCode address phone')
    .populate('assignedDriver', 'firstName lastName phone availability rating')
    .populate('assignedVehicle', 'vehicleNumber vehicleType brand model availability')
    .populate('timeline.updatedBy', 'name role email')
    .populate('cancelledBy', 'name role email');

  if (!delivery) {
    throw ApiError.notFound('Delivery not found');
  }

  // Client Admin access check
  if (user.role === 'client_admin' && user.client) {
    if (delivery.client?._id?.toString() !== user.client.toString()) {
      throw ApiError.forbidden('You are not authorized to view this delivery');
    }
  }

  // Branch Manager / Branch scoping check
  if (user.branch && delivery.branch && user.role !== 'super_admin') {
    const deliveryBranchId = delivery.branch?._id ? delivery.branch._id.toString() : delivery.branch.toString();
    const userBranchId = user.branch?._id ? user.branch._id.toString() : user.branch.toString();
    if (deliveryBranchId !== userBranchId) {
      throw ApiError.forbidden('You are not authorized to view deliveries for this branch');
    }
  }

  // Driver access check
  if (user.role === 'driver') {
    const driverDoc = await Driver.findOne({ user: user._id });
    if (!driverDoc || !delivery.assignedDriver || delivery.assignedDriver._id?.toString() !== driverDoc._id.toString()) {
      throw ApiError.forbidden('You are not authorized to view this delivery');
    }
  }

  return delivery;
};

/**
 * Get delivery status history & timeline.
 */
export const getDeliveryHistory = async (deliveryId, user) => {
  const delivery = await getDeliveryById(deliveryId, user);

  return {
    deliveryId: delivery._id,
    orderId: delivery.orderId,
    trackingId: delivery.trackingId,
    currentStatus: delivery.status,
    history: delivery.timeline || [],
    deliveredAt: delivery.deliveredAt,
    cancelledAt: delivery.cancelledAt,
    cancellationReason: delivery.cancellationReason,
  };
};

/**
 * Driver retrieves their assigned deliveries with status filtering, search and pagination.
 */
export const getMyDeliveries = async (query = {}, user) => {
  const driverDoc = await Driver.findOne({ user: user._id });
  if (!driverDoc) {
    return {
      deliveries: [],
      pagination: { page: 1, limit: 25, total: 0, pages: 1 },
    };
  }

  const filter = { assignedDriver: driverDoc._id };

  // Status filter
  if (query.status && query.status !== 'all') {
    filter.status = query.status.toLowerCase();
  }

  // Search by orderId, customerName, or customerPhone
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
      .populate('branch', 'branchName branchCode address phone')
      .populate('assignedDriver', 'firstName lastName phone availability rating')
      .populate('assignedVehicle', 'vehicleNumber vehicleType brand model availability')
      .populate('timeline.updatedBy', 'name role email')
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
