// FleetHub – Notification Controller
import * as notificationService from '../services/notificationService.js';
import Notification from '../models/Notification.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotificationsForUser(req.user);
  return ApiResponse.ok(res, 'Notifications retrieved successfully', { notifications });
});

// PATCH /api/v1/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationAsRead(req.params.id);
  return ApiResponse.ok(res, 'Notification marked as read', { notification });
});

// PATCH /api/v1/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  const query = {
    $or: [
      { recipient: req.user._id },
      { targetRole: req.user.role },
      { targetRole: 'all' },
    ],
    isRead: false,
  };

  await Notification.updateMany(query, { isRead: true });
  return ApiResponse.ok(res, 'All notifications marked as read');
});
