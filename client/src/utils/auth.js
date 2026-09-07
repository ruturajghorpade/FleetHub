// FleetHub – Centralized Authentication & Session Storage Utility

const TOKEN_KEY = 'token';
const USER_KEY = 'fleethub_user';
const ROLE_KEY = 'fleethub_active_role';

export const authStorage = {
  /**
   * Retrieve stored JWT token
   */
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Persist JWT token
   */
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to set token in storage', e);
    }
  },

  /**
   * Check if token exists in storage
   */
  hasToken: () => {
    return !!authStorage.getToken();
  },

  /**
   * Retrieve cached authenticated user object
   */
  getUser: () => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  /**
   * Persist user object
   */
  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        if (user.role) {
          localStorage.setItem(ROLE_KEY, user.role);
        }
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.error('Failed to set user in storage', e);
    }
  },

  /**
   * Retrieve active role
   */
  getActiveRole: () => {
    try {
      return localStorage.getItem(ROLE_KEY) || authStorage.getUser()?.role || 'super_admin';
    } catch {
      return 'super_admin';
    }
  },

  /**
   * Persist active role
   */
  setActiveRole: (role) => {
    try {
      if (role) {
        localStorage.setItem(ROLE_KEY, role);
      } else {
        localStorage.removeItem(ROLE_KEY);
      }
    } catch (e) {
      console.error('Failed to set active role in storage', e);
    }
  },

  /**
   * Clear all auth-related session items
   */
  clearAuth: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ROLE_KEY);
    } catch (e) {
      console.error('Failed to clear auth storage', e);
    }
  },
};

export default authStorage;
