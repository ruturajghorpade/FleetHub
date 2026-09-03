// FleetHub – StatusBadge Component
// Maps status strings to styled badges using semantic colors.
import { STATUS_COLORS } from '@/constants/statuses';
import { DELIVERY_STATUS_COLORS, DELIVERY_STATUS_LABELS } from '@/constants/deliveryStatuses';
import { toTitleCase } from '@/utils/helpers';

const ALL_COLORS = { ...STATUS_COLORS, ...DELIVERY_STATUS_COLORS };

const StatusBadge = ({ status, type = 'general', className = '' }) => {
  const colors = ALL_COLORS[status];

  if (!colors) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}>
        {toTitleCase(status || 'Unknown')}
      </span>
    );
  }

  const label =
    type === 'delivery'
      ? DELIVERY_STATUS_LABELS[status] || toTitleCase(status)
      : toTitleCase(status);

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
        ${colors.bg} ${colors.text}
        ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
