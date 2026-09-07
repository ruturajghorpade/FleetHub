// FleetHub – User Service
import api from '@/api/axios';

export const userService = {
  /**
   * Get all users with optional role or search filtering
   */
  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return {
      users: res.data?.users || [],
      pagination: res.meta || {},
    };
  },

  /**
   * Get single user by ID
   */
  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data?.user;
  },

  /**
   * Create new user
   */
  createUser: async (userData) => {
    const res = await api.post('/users', userData);
    return res.data?.user;
  },

  /**
   * Update user details
   */
  updateUser: async (id, userData) => {
    const res = await api.put(`/users/${id}`, userData);
    return res.data?.user;
  },

  /**
   * Delete user
   */
  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  /**
   * Activate user account
   */
  activateUser: async (id) => {
    const res = await api.patch(`/users/${id}/activate`);
    return res.data?.user;
  },

  /**
   * Deactivate user account
   */
  deactivateUser: async (id) => {
    const res = await api.patch(`/users/${id}/deactivate`);
    return res.data?.user;
  },

  /**
   * Update user role
   */
  updateRole: async (id, role) => {
    const res = await api.patch(`/users/${id}/role`, { role });
    return res.data?.user;
  },

  /**
   * Reset user password
   */
  resetPassword: async (id, password) => {
    const res = await api.patch(`/users/${id}/reset-password`, { password });
    return res.data;
  },
};

export default userService;
