// FleetHub – Notification Service
import Notification from '../models/Notification.js';

export const createNotification = async ({
  recipient = null,
  targetRole = 'all',
  type,
  title,
  message,
  delivery = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      targetRole,
      type,
      title,
      message,
      delivery,
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

export const notifyDriverOnAssignment = async (delivery, driverId) => {
  return createNotification({
    recipient: driverId,
    targetRole: 'driver',
    type: 'ASSIGNMENT',
    title: 'New Delivery Assigned',
    message: `Order #${delivery.orderId} from ${delivery.pickupLocation?.name || 'Restaurant'} is assigned to you.`,
    delivery: delivery._id,
  });
};

export const notifyOnCancellation = async (delivery, cancelledByName = 'Client') => {
  // Notify Dispatcher
  await createNotification({
    targetRole: 'dispatcher',
    type: 'CANCELLATION',
    title: 'Delivery Cancelled',
    message: `Order #${delivery.orderId} was cancelled by ${cancelledByName}. Reason: ${delivery.cancellationReason || 'Not specified'}.`,
    delivery: delivery._id,
  });

  // Notify Driver if one was assigned
  if (delivery.assignedDriver) {
    await createNotification({
      recipient: delivery.assignedDriver,
      targetRole: 'driver',
      type: 'CANCELLATION',
      title: 'Assigned Delivery Cancelled',
      message: `Order #${delivery.orderId} has been cancelled by ${cancelledByName}. You are now available for new orders.`,
      delivery: delivery._id,
    });
  }
};

export const getNotificationsForUser = async (user) => {
  const query = {
    $or: [
      { recipient: user._id },
      { targetRole: user.role },
      { targetRole: 'all' },
    ],
  };

  return Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('delivery', 'orderId customerName status');
};

export const markNotificationAsRead = async (notificationId) => {
  return Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};
