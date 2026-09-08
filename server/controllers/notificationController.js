// FleetHub – Notification Controller (Food Delivery Logistics)
import * as notificationService from '../services/notificationService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/v1/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotificationsForUser(req.user, req.query);
  return ApiResponse.ok(
    res,
    'Notifications retrieved successfully',
    {
      notifications: result.notifications,
      unreadCount: result.unreadCount,
    },
    result.pagination
  );
});

// GET /api/v1/notifications/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await notificationService.getUnreadCountForUser(req.user);
  return ApiResponse.ok(res, 'Unread count retrieved successfully', { unreadCount });
});

// PATCH /api/v1/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationAsRead(req.params.id, req.user);
  return ApiResponse.ok(res, 'Notification marked as read', { notification });
});

// PATCH /api/v1/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsAsRead(req.user);
  return ApiResponse.ok(res, 'All notifications marked as read', result);
});

// DELETE /api/v1/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id, req.user);
  return ApiResponse.ok(res, 'Notification deleted successfully', result);
});
