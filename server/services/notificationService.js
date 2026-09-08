// FleetHub – Notification Service (Food Delivery Logistics)
import Notification from '../models/Notification.js';
import Driver from '../models/Driver.js';
import ApiError from '../utils/apiError.js';

/**
 * Create an in-app notification with deduplication guard.
 */
export const createNotification = async ({
  recipient = null,
  targetRole = 'all',
  type,
  title,
  message,
  delivery = null,
  client = null,
  branch = null,
  relatedEntity = 'delivery',
  relatedEntityId = null,
}) => {
  try {
    // 15-second deduplication window for identical event triggers
    const dedupeWindow = new Date(Date.now() - 15000);
    const existing = await Notification.findOne({
      type,
      recipient,
      title,
      ...(delivery && { delivery }),
      createdAt: { $gte: dedupeWindow },
    });

    if (existing) {
      return existing;
    }

    const notification = await Notification.create({
      recipient,
      targetRole,
      type,
      title,
      message,
      delivery,
      client,
      branch,
      relatedEntity: delivery ? 'delivery' : relatedEntity,
      relatedEntityId: delivery || relatedEntityId,
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

/**
 * Helper to resolve driver user ID for personal notifications.
 */
const resolveDriverUserId = async (driverId) => {
  if (!driverId) return null;
  try {
    const driverDoc = await Driver.findById(driverId);
    return driverDoc?.user || driverId;
  } catch {
    return driverId;
  }
};

/**
 * Notify driver & restaurant management when a delivery is assigned.
 */
export const notifyDriverOnAssignment = async (delivery, driverId) => {
  const recipientUserId = await resolveDriverUserId(driverId);
  const pickupName = delivery.pickupLocation?.name || 'Restaurant Outlet';

  // 1. Notify Driver Partner
  await createNotification({
    recipient: recipientUserId,
    targetRole: 'driver',
    type: 'DELIVERY_ASSIGNED',
    title: 'New Delivery Assigned',
    message: `Order #${delivery.orderId} from ${pickupName} has been assigned to you.`,
    delivery: delivery._id,
    client: delivery.client?._id || delivery.client,
    branch: delivery.branch?._id || delivery.branch,
  });

  // 2. Notify Restaurant Client Admin
  await createNotification({
    targetRole: 'client_admin',
    type: 'DELIVERY_ASSIGNED',
    title: 'Fleet Assigned to Order',
    message: `A rider has been assigned to Order #${delivery.orderId}.`,
    delivery: delivery._id,
    client: delivery.client?._id || delivery.client,
    branch: delivery.branch?._id || delivery.branch,
  });

  // 3. Notify Central Dispatcher
  await createNotification({
    targetRole: 'dispatcher',
    type: 'DELIVERY_ASSIGNED',
    title: `Order #${delivery.orderId} Assigned`,
    message: `Fleet allocated to Order #${delivery.orderId} at ${pickupName}.`,
    delivery: delivery._id,
    client: delivery.client?._id || delivery.client,
    branch: delivery.branch?._id || delivery.branch,
  });
};

/**
 * Notify relevant stakeholders when a delivery is cancelled.
 */
export const notifyOnCancellation = async (delivery, cancelledByName = 'Client') => {
  const reason = delivery.cancellationReason || 'Customer requested cancellation';
  const clientId = delivery.client?._id || delivery.client;
  const branchId = delivery.branch?._id || delivery.branch;

  // 1. Notify Assigned Driver (if assigned)
  if (delivery.assignedDriver) {
    const driverUserId = await resolveDriverUserId(delivery.assignedDriver);
    await createNotification({
      recipient: driverUserId,
      targetRole: 'driver',
      type: 'DELIVERY_CANCELLED',
      title: 'Assigned Delivery Cancelled',
      message: `Order #${delivery.orderId} has been cancelled (${reason}). You are now available for new orders.`,
      delivery: delivery._id,
      client: clientId,
      branch: branchId,
    });
  }

  // 2. Notify Restaurant Client Admin
  await createNotification({
    targetRole: 'client_admin',
    type: 'DELIVERY_CANCELLED',
    title: 'Delivery Cancelled',
    message: `Order #${delivery.orderId} was cancelled (${reason}).`,
    delivery: delivery._id,
    client: clientId,
    branch: branchId,
  });

  // 3. Notify Central Dispatcher
  await createNotification({
    targetRole: 'dispatcher',
    type: 'DELIVERY_CANCELLED',
    title: `Order #${delivery.orderId} Cancelled`,
    message: `Order #${delivery.orderId} was cancelled by ${cancelledByName}. Reason: ${reason}.`,
    delivery: delivery._id,
    client: clientId,
    branch: branchId,
  });
};

/**
 * Notify stakeholders when a delivery progresses in lifecycle status.
 */
export const notifyOnStatusUpdate = async (delivery, status, updatedByName = 'System') => {
  const clientId = delivery.client?._id || delivery.client;
  const branchId = delivery.branch?._id || delivery.branch;

  const statusConfig = {
    picked_up: {
      type: 'DELIVERY_PICKED_UP',
      label: 'Picked Up',
      clientMsg: `Order #${delivery.orderId} was picked up from kitchen and is on the move.`,
      dispatchMsg: `Order #${delivery.orderId} picked up by rider.`,
    },
    out_for_delivery: {
      type: 'DELIVERY_IN_TRANSIT',
      label: 'Out for Delivery',
      clientMsg: `Order #${delivery.orderId} is out for delivery to ${delivery.customerName}.`,
      dispatchMsg: `Order #${delivery.orderId} is in transit to destination.`,
    },
    delivered: {
      type: 'DELIVERY_DELIVERED',
      label: 'Delivered',
      clientMsg: `Order #${delivery.orderId} has been safely delivered to ${delivery.customerName}.`,
      dispatchMsg: `Order #${delivery.orderId} was delivered successfully.`,
    },
  };

  const config = statusConfig[status];
  if (!config) return;

  // 1. Notify Client Admin
  await createNotification({
    targetRole: 'client_admin',
    type: config.type,
    title: `Order #${delivery.orderId} ${config.label}`,
    message: config.clientMsg,
    delivery: delivery._id,
    client: clientId,
    branch: branchId,
  });

  // 2. Notify Dispatcher
  await createNotification({
    targetRole: 'dispatcher',
    type: config.type,
    title: `Order #${delivery.orderId} ${config.label}`,
    message: config.dispatchMsg,
    delivery: delivery._id,
    client: clientId,
    branch: branchId,
  });

  // 3. Notify Driver upon successful delivery completion
  if (status === 'delivered' && delivery.assignedDriver) {
    const driverUserId = await resolveDriverUserId(delivery.assignedDriver);
    await createNotification({
      recipient: driverUserId,
      targetRole: 'driver',
      type: 'DELIVERY_DELIVERED',
      title: 'Delivery Completed',
      message: `Order #${delivery.orderId} successfully completed! You are now available for new orders.`,
      delivery: delivery._id,
      client: clientId,
      branch: branchId,
    });
  }
};

/**
 * Notify stakeholders when a vehicle maintenance alert occurs.
 */
export const notifyOnMaintenance = async (maintenance, alertType = 'SCHEDULED') => {
  const vehicleNumber = maintenance.vehicle?.vehicleNumber || 'Fleet Vehicle';
  const clientId = maintenance.client?._id || maintenance.client;
  const branchId = maintenance.branch?._id || maintenance.branch;

  let title = 'Vehicle Maintenance Alert';
  let message = `Vehicle ${vehicleNumber} maintenance updated.`;

  switch (alertType.toUpperCase()) {
    case 'STARTED':
      title = 'Vehicle Maintenance Started';
      message = `Maintenance started on vehicle ${vehicleNumber} (${maintenance.title}). The vehicle is currently unavailable for delivery assignments.`;
      break;
    case 'COMPLETED':
      title = 'Vehicle Maintenance Completed';
      message = `Maintenance on vehicle ${vehicleNumber} (${maintenance.title}) is completed. The vehicle is now restored to available status.`;
      break;
    case 'CANCELLED':
      title = 'Vehicle Maintenance Cancelled';
      message = `Scheduled maintenance for vehicle ${vehicleNumber} (${maintenance.title}) has been cancelled.`;
      break;
    case 'OVERDUE':
      title = 'Vehicle Maintenance Overdue';
      message = `Scheduled maintenance for vehicle ${vehicleNumber} is overdue! Please inspect and begin servicing immediately.`;
      break;
    case 'SCHEDULED':
    default:
      title = 'Vehicle Maintenance Scheduled';
      message = `Vehicle ${vehicleNumber} has maintenance scheduled for ${maintenance.title || 'Service Inspection'}.`;
      break;
  }

  // Notify Dispatcher / Fleet Operations
  await createNotification({
    targetRole: 'dispatcher',
    type: 'MAINTENANCE_ALERT',
    title,
    message,
    client: clientId,
    branch: branchId,
    relatedEntity: 'maintenance',
    relatedEntityId: maintenance._id,
  });

  // If associated with a client, notify client admin
  if (clientId) {
    await createNotification({
      targetRole: 'client_admin',
      type: 'MAINTENANCE_ALERT',
      title,
      message,
      client: clientId,
      branch: branchId,
      relatedEntity: 'maintenance',
      relatedEntityId: maintenance._id,
    });
  }
};

/**
 * Build multi-tenant query based on user role and permissions.
 */
const buildUserScopedQuery = async (user, query = {}) => {
  const filter = {};

  if (user.role === 'driver') {
    // Driver receives direct notifications or driver-role notifications for their client
    const driverDoc = await Driver.findOne({ user: user._id });
    const recipientIds = [user._id];
    if (driverDoc) recipientIds.push(driverDoc._id);

    filter.$or = [
      { recipient: { $in: recipientIds } },
      { targetRole: 'driver', ...(driverDoc?.client && { client: driverDoc.client }) },
      { targetRole: 'all', client: null },
    ];
  } else if (user.role === 'client_admin' && user.client) {
    // Client Admin receives notifications strictly scoped to their own client
    filter.$or = [
      { recipient: user._id },
      { client: user.client, targetRole: { $in: ['client_admin', 'all'] } },
      { client: user.client, recipient: null },
    ];
  } else if (user.role === 'dispatcher') {
    // Dispatcher receives operational notifications
    filter.$or = [
      { recipient: user._id },
      { targetRole: { $in: ['dispatcher', 'all'] } },
    ];
  } else if (user.role === 'super_admin') {
    // Super Admin receives all notifications (or filtered by recipient if specific)
    filter.$or = [
      { recipient: user._id },
      { recipient: null },
    ];
  } else {
    filter.recipient = user._id;
  }

  // Branch isolation (if user is locked to an outlet branch)
  if (user.branch && user.role !== 'super_admin') {
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [{ branch: user.branch }, { branch: null }],
    });
  }

  // Unread filter tab
  if (query.filter === 'unread' || query.unreadOnly === 'true') {
    filter.isRead = false;
  }

  // Type filter tab
  if (query.filter === 'assignments') {
    filter.type = { $in: ['DELIVERY_ASSIGNED', 'ASSIGNMENT', 'DRIVER_ASSIGNMENT'] };
  } else if (query.filter === 'alerts') {
    filter.type = {
      $in: ['DELIVERY_CANCELLED', 'CANCELLATION', 'MAINTENANCE_ALERT', 'ALERT', 'SYSTEM_ALERT'],
    };
  }

  return filter;
};

/**
 * Get notifications for authenticated user with multi-tenant filtering & pagination.
 */
export const getNotificationsForUser = async (user, query = {}) => {
  const filter = await buildUserScopedQuery(user, query);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('delivery', 'orderId customerName status totalAmount')
      .populate('client', 'companyName'),
    Notification.countDocuments(filter),
    getUnreadCountForUser(user),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Count unread notifications for authenticated user.
 */
export const getUnreadCountForUser = async (user) => {
  const filter = await buildUserScopedQuery(user, { filter: 'unread' });
  return Notification.countDocuments(filter);
};

/**
 * Mark a single notification as read with tenant security verification.
 */
export const markNotificationAsRead = async (notificationId, user) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  // Multi-Client / Tenant Access Check
  if (user.role === 'client_admin' && user.client) {
    if (notification.client && notification.client.toString() !== user.client.toString()) {
      throw ApiError.forbidden('You are not authorized to access this notification');
    }
  }

  if (user.role === 'driver') {
    const driverDoc = await Driver.findOne({ user: user._id });
    const isDirectRecipient =
      notification.recipient?.toString() === user._id.toString() ||
      (driverDoc && notification.recipient?.toString() === driverDoc._id.toString());
    const isRoleBroadcast = notification.targetRole === 'driver' || notification.targetRole === 'all';

    if (!isDirectRecipient && !isRoleBroadcast) {
      throw ApiError.forbidden('You are not authorized to access this notification');
    }
  }

  notification.isRead = true;
  await notification.save();
  return notification;
};

/**
 * Mark all authorized notifications for user as read.
 */
export const markAllNotificationsAsRead = async (user) => {
  const filter = await buildUserScopedQuery(user, { filter: 'unread' });
  const result = await Notification.updateMany(filter, { isRead: true });
  return { modifiedCount: result.modifiedCount };
};

/**
 * Delete a notification with security ownership verification.
 */
export const deleteNotification = async (notificationId, user) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  // Tenant Access Check
  if (user.role === 'client_admin' && user.client) {
    if (notification.client && notification.client.toString() !== user.client.toString()) {
      throw ApiError.forbidden('You are not authorized to delete this notification');
    }
  }

  if (user.role === 'driver') {
    const driverDoc = await Driver.findOne({ user: user._id });
    const isDirectRecipient =
      notification.recipient?.toString() === user._id.toString() ||
      (driverDoc && notification.recipient?.toString() === driverDoc._id.toString());

    if (!isDirectRecipient) {
      throw ApiError.forbidden('You are not authorized to delete this notification');
    }
  }

  await Notification.findByIdAndDelete(notificationId);
  return { success: true, id: notificationId };
};
