// FleetHub – Badge Component
// Semantic badges with soft tinted backgrounds, subtle borders, and dark mode support.

const BADGE_VARIANTS = {
  primary: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/30',
  secondary: 'bg-slate-100 text-slate-700 dark:bg-[#1A1A1A] dark:text-slate-300 border border-slate-200 dark:border-[#2E2E2E]',
  success: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400 border border-green-200/60 dark:border-green-500/20',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-200/60 dark:border-red-500/20',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20',
};

const BADGE_SIZES = {
  sm: 'px-2 py-0.5 text-2xs',
  md: 'px-2.5 py-0.5 text-xs',
};

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${BADGE_VARIANTS[variant] || BADGE_VARIANTS.primary}
        ${BADGE_SIZES[size] || BADGE_SIZES.md}
        ${className}
      `}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  );
};

export default Badge;
