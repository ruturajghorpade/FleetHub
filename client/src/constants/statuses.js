// General Status Constants
export const STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
};

export const STATUS_COLORS = {
  [STATUSES.ACTIVE]: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  [STATUSES.INACTIVE]: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  [STATUSES.PENDING]: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  [STATUSES.SUSPENDED]: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  [STATUSES.ARCHIVED]: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
};
