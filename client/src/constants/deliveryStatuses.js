// Delivery Status Constants
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

export const DELIVERY_STATUS_COLORS = {
  [DELIVERY_STATUSES.PENDING]: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  [DELIVERY_STATUSES.ASSIGNED]: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  [DELIVERY_STATUSES.PICKED_UP]: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  [DELIVERY_STATUSES.IN_TRANSIT]: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  [DELIVERY_STATUSES.DELIVERED]: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  [DELIVERY_STATUSES.FAILED]: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  [DELIVERY_STATUSES.RETURNED]: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  [DELIVERY_STATUSES.CANCELLED]: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
};

export const DELIVERY_STATUS_LABELS = {
  [DELIVERY_STATUSES.PENDING]: 'Pending',
  [DELIVERY_STATUSES.ASSIGNED]: 'Assigned',
  [DELIVERY_STATUSES.PICKED_UP]: 'Picked Up',
  [DELIVERY_STATUSES.IN_TRANSIT]: 'In Transit',
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [DELIVERY_STATUSES.DELIVERED]: 'Delivered',
  [DELIVERY_STATUSES.FAILED]: 'Failed',
  [DELIVERY_STATUSES.RETURNED]: 'Returned',
  [DELIVERY_STATUSES.CANCELLED]: 'Cancelled',
};
