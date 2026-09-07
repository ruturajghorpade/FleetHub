// FleetHub – Authentication Service
import api from '@/api/axios';
import authStorage from '@/utils/auth';

export const authService = {
  /**
   * Log in user with email & password
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
   */
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data; // { user, accessToken, refreshToken }
  },

  /**
   * Get current authenticated user profile
   * @returns {Promise<{ user: object }>}
   */
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  /**
   * Log out currently authenticated session
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      authStorage.clearAuth();
    }
  },

  /**
   * Refresh JWT token
   * @param {string} refreshToken
   */
  refreshToken: async (refreshToken) => {
    const res = await api.post('/auth/refresh', { refreshToken });
    return res.data;
  },

  /**
   * Register user
   */
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
};

export default authService;
