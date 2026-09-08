// FleetHub – Centralized Role Permissions Matrix (Food Delivery Logistics)
import { ROLES } from '@/config/roleConfig';

/**
 * Access permissions mapped to each supported backend role.
 */
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    routes: [
      '/',
      '/deliveries',
      '/routes',
      '/vehicles',
      '/drivers',
      '/maintenance',
      '/clients',
      '/branches',
      '/reports',
      '/users',
      '/notifications',
      '/settings',
    ],
    navItems: [
      'dashboard',
      'deliveries',
      'routes',
      'vehicles',
      'drivers',
      'maintenance',
      'clients',
      'branches',
      'users',
      'reports',
      'notifications',
      'settings',
    ],
  },
  [ROLES.CLIENT_ADMIN]: {
    routes: [
      '/',
      '/deliveries',
      '/clients',
      '/branches',
      '/maintenance',
      '/reports',
      '/notifications',
      '/settings',
    ],
    navItems: [
      'dashboard',
      'deliveries',
      'clients',
      'branches',
      'maintenance',
      'reports',
      'notifications',
      'settings',
    ],
  },
  [ROLES.DISPATCHER]: {
    routes: [
      '/',
      '/deliveries',
      '/routes',
      '/vehicles',
      '/drivers',
      '/maintenance',
      '/reports',
      '/notifications',
      '/settings',
    ],
    navItems: [
      'dashboard',
      'deliveries',
      'routes',
      'vehicles',
      'drivers',
      'maintenance',
      'reports',
      'notifications',
      'settings',
    ],
  },
  [ROLES.DRIVER]: {
    routes: [
      '/',
      '/deliveries',
      '/routes',
      '/notifications',
      '/settings',
    ],
    navItems: [
      'dashboard',
      'deliveries',
      'routes',
      'notifications',
      'settings',
    ],
  },
};

/**
 * Check if a role can access a specific route path
 * @param {string} role - User's active role
 * @param {string} path - Target route path
 * @returns {boolean}
 */
export const canAccessRoute = (role, path) => {
  if (!role) return false;
  if (role === ROLES.SUPER_ADMIN) return true;
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  // Match exact or parent route prefix
  return perms.routes.some((r) => r === path || (r !== '/' && path.startsWith(r)));
};

/**
 * Check if a role can see a sidebar navigation item
 * @param {string} role - User's active role
 * @param {string} navId - Sidebar item id
 * @returns {boolean}
 */
export const canAccessNavItem = (role, navId) => {
  if (!role) return false;
  if (role === ROLES.SUPER_ADMIN) return true;
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.navItems.includes(navId);
};

/**
 * Check if user has one of the allowed roles
 * @param {string} userRole
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export const hasAllowedRole = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  if (userRole === ROLES.SUPER_ADMIN) return true;
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};
