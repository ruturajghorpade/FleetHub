// FleetHub – Server-Side Constants (Food Delivery Logistics)

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLIENT_ADMIN: 'client_admin',
  DISPATCHER: 'dispatcher',
  DRIVER: 'driver',
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
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Food delivery fleet types
export const VEHICLE_TYPES = {
  BIKE: 'bike',
  SCOOTER: 'scooter',
  EV_BIKE: 'ev_bike',
  // Legacy / backup vehicle types
  TRUCK: 'truck',
  MINI_TRUCK: 'mini_truck',
  VAN: 'van',
};

export const VEHICLE_AVAILABILITY = {
  AVAILABLE: 'available',
  ON_DELIVERY: 'on_delivery',
  MAINTENANCE: 'maintenance',
};

export const DRIVER_AVAILABILITY = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline',
};

export const CLIENT_BUSINESS_TYPES = {
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  FAST_FOOD: 'fast_food',
  BAKERY: 'bakery',
};

export const FUEL_TYPES = {
  PETROL: 'petrol',
  ELECTRIC: 'electric',
  DIESEL: 'diesel',
  CNG: 'cng',
};

export const VEHICLE_STATUSES = {
  AVAILABLE: 'available',
  IN_TRANSIT: 'in_transit',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
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

export const DRIVER_STATUSES = {
  AVAILABLE: 'available',
  ON_DUTY: 'on_duty',
  ON_LEAVE: 'on_leave',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
};

export const BLOOD_GROUPS = {
  A_POS: 'A+',
  A_NEG: 'A-',
  B_POS: 'B+',
  B_NEG: 'B-',
  AB_POS: 'AB+',
  AB_NEG: 'AB-',
  O_POS: 'O+',
  O_NEG: 'O-',
};

export const LICENSE_TYPES = {
  LMV: 'LMV',
  MCWG: 'MCWG',
  MCWOG: 'MCWOG',
  HMV: 'HMV',
  TRANS: 'TRANS',
};
