// FleetHub – Notification Service
import api from '@/api/axios';

export const notificationService = {
  /**
   * Get user notifications
   */
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data?.notifications || [];
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data?.notification;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};

export default notificationService;
