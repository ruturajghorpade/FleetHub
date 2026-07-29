// FleetHub Route Configuration
// Central map of all application routes

const ROUTES = {
  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  UNAUTHORIZED: '/unauthorized',

  // Dashboard
  DASHBOARD: '/',

  // Clients
  CLIENTS: '/clients',
  CLIENT_DETAILS: '/clients/:id',
  CLIENT_CREATE: '/clients/new',
  CLIENT_EDIT: '/clients/:id/edit',

  // Branches
  BRANCHES: '/branches',
  BRANCH_DETAILS: '/branches/:id',
  BRANCH_CREATE: '/branches/new',
  BRANCH_EDIT: '/branches/:id/edit',

  // Vehicles
  VEHICLES: '/vehicles',
  VEHICLE_DETAILS: '/vehicles/:id',
  VEHICLE_CREATE: '/vehicles/new',
  VEHICLE_EDIT: '/vehicles/:id/edit',

  // Drivers
  DRIVERS: '/drivers',
  DRIVER_DETAILS: '/drivers/:id',
  DRIVER_CREATE: '/drivers/new',
  DRIVER_EDIT: '/drivers/:id/edit',

  // Deliveries
  DELIVERIES: '/deliveries',
  DELIVERY_DETAILS: '/deliveries/:id',
  DELIVERY_CREATE: '/deliveries/new',
  DELIVERY_EDIT: '/deliveries/:id/edit',

  // Routes
  ROUTES_LIST: '/routes',
  ROUTE_DETAILS: '/routes/:id',
  ROUTE_CREATE: '/routes/new',
  ROUTE_EDIT: '/routes/:id/edit',

  // Maintenance
  MAINTENANCE: '/maintenance',
  MAINTENANCE_DETAILS: '/maintenance/:id',
  MAINTENANCE_CREATE: '/maintenance/new',
  MAINTENANCE_EDIT: '/maintenance/:id/edit',

  // Reports
  REPORTS: '/reports',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Settings
  SETTINGS: '/settings',

  // Users
  USERS: '/users',
  USER_CREATE: '/users/new',

  // Errors
  NOT_FOUND: '*',
};

export default ROUTES;
