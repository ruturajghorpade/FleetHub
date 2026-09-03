// FleetHub Role Configuration (Food Delivery Logistics)

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLIENT_ADMIN: 'client_admin',
  DISPATCHER: 'dispatcher',
  DRIVER: 'driver',
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin (FastFleet HQ)',
  [ROLES.CLIENT_ADMIN]: "Client Admin (Domino's Pizza)",
  [ROLES.DISPATCHER]: 'Dispatcher (Central Ops)',
  [ROLES.DRIVER]: 'Driver (Delivery Partner)',
};

const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.DISPATCHER,
  ROLES.CLIENT_ADMIN,
  ROLES.DRIVER,
];

export { ROLES, ROLE_LABELS, ROLE_HIERARCHY };
