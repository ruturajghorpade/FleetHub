// FleetHub API Configuration

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',

  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: '/users',

  // Clients
  CLIENTS: '/clients',

  // Branches
  BRANCHES: '/branches',

  // Vehicles
  VEHICLES: '/vehicles',

  // Drivers
  DRIVERS: '/drivers',

  // Deliveries
  DELIVERIES: '/deliveries',

  // Routes
  ROUTES: '/routes',

  // Maintenance
  MAINTENANCE: '/maintenance',

  // Reports
  REPORTS: '/reports',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Settings
  SETTINGS: '/settings',

  // Dashboard
  DASHBOARD: '/dashboard',
};

export { API_BASE_URL, API_ENDPOINTS };
