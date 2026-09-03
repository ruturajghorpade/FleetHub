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
  [DELIVERY_STATUSES.PENDING]: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
  [DELIVERY_STATUSES.ASSIGNED]: { bg: 'bg-blue-50 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  [DELIVERY_STATUSES.PICKED_UP]: { bg: 'bg-cyan-50 dark:bg-cyan-500/15', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
  [DELIVERY_STATUSES.IN_TRANSIT]: { bg: 'bg-primary-50 dark:bg-primary-500/15', text: 'text-primary-700 dark:text-primary-400', dot: 'bg-primary-500' },
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: { bg: 'bg-amber-50 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  [DELIVERY_STATUSES.DELIVERED]: { bg: 'bg-green-50 dark:bg-green-500/15', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  [DELIVERY_STATUSES.FAILED]: { bg: 'bg-red-50 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  [DELIVERY_STATUSES.RETURNED]: { bg: 'bg-orange-50 dark:bg-orange-500/15', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  [DELIVERY_STATUSES.CANCELLED]: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
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
