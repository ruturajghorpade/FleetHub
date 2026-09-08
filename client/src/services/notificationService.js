// FleetHub – Notification Service (Food Delivery Logistics)
import api from '@/api/axios';

export const notificationService = {
  /**
   * Get user notifications with optional tab/filter and pagination
   * @param {Object} params - { tab: 'all'|'unread'|'assignments'|'alerts', page: 1, limit: 20 }
   * @returns {Promise<{ notifications: Array, unreadCount: number, pagination: Object }>}
   */
  getNotifications: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    return {
      notifications: res.data?.notifications || [],
      unreadCount: res.data?.unreadCount || 0,
      pagination: res.meta || res.pagination || {},
    };
  },

  /**
   * Get current unread notification count
   * @returns {Promise<number>}
   */
  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data?.unreadCount || 0;
  },

  /**
   * Mark single notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>}
   */
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data?.notification;
  },

  /**
   * Mark all notifications as read for current user
   * @returns {Promise<Object>}
   */
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @returns {Promise<Object>}
   */
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

export default notificationService;
