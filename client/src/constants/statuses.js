// General Status Constants
export const STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
};

export const STATUS_COLORS = {
  [STATUSES.ACTIVE]: { bg: 'bg-green-50 dark:bg-green-500/15 border border-green-200/60 dark:border-green-500/20', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  [STATUSES.INACTIVE]: { bg: 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
  [STATUSES.PENDING]: { bg: 'bg-amber-50 dark:bg-amber-500/15 border border-amber-200/60 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  [STATUSES.SUSPENDED]: { bg: 'bg-red-50 dark:bg-red-500/15 border border-red-200/60 dark:border-red-500/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  [STATUSES.ARCHIVED]: { bg: 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
};
