// FleetHub Role Configuration

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  DISPATCHER: 'dispatcher',
  DRIVER: 'driver',
  VIEWER: 'viewer',
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.DISPATCHER]: 'Dispatcher',
  [ROLES.DRIVER]: 'Driver',
  [ROLES.VIEWER]: 'Viewer',
};

const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.DISPATCHER,
  ROLES.DRIVER,
  ROLES.VIEWER,
];

export { ROLES, ROLE_LABELS, ROLE_HIERARCHY };
