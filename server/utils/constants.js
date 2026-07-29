// FleetHub – Server-Side Constants

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  DISPATCHER: 'dispatcher',
  DRIVER: 'driver',
  VIEWER: 'viewer',
};

export const STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
};

export const DELIVERY_STATUSES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
};

export const VEHICLE_TYPES = {
  TWO_WHEELER: 'two_wheeler',
  THREE_WHEELER: 'three_wheeler',
  MINI_TRUCK: 'mini_truck',
  LCV: 'lcv',
  TRUCK: 'truck',
  TRAILER: 'trailer',
  REFRIGERATED: 'refrigerated',
  TANKER: 'tanker',
  VAN: 'van',
};

export const MAINTENANCE_TYPES = {
  ROUTINE: 'routine',
  PREVENTIVE: 'preventive',
  CORRECTIVE: 'corrective',
  EMERGENCY: 'emergency',
  INSPECTION: 'inspection',
  TYRE_REPLACEMENT: 'tyre_replacement',
  OIL_CHANGE: 'oil_change',
  BRAKE_SERVICE: 'brake_service',
  ENGINE_REPAIR: 'engine_repair',
  BODY_REPAIR: 'body_repair',
  ELECTRICAL: 'electrical',
  AC_SERVICE: 'ac_service',
};
