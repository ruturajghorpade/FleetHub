// FleetHub – Button Component
import Spinner from './Spinner';

const VARIANTS = {
  primary:
    'bg-amber-500 text-black font-bold hover:bg-amber-600 focus:ring-amber-500 shadow-sm hover:shadow active:scale-[0.98]',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 dark:bg-[#242424] dark:text-white dark:hover:bg-[#2E2E2E]',
  danger:
    'bg-red-600 text-white font-medium hover:bg-red-700 focus:ring-red-500 shadow-sm active:scale-[0.98]',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-amber-400 dark:text-slate-300 dark:hover:bg-[#242424]',
  outline:
    'border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 focus:ring-amber-500 font-medium',
  accent:
    'bg-amber-600 text-white font-bold hover:bg-amber-700 focus:ring-amber-500 shadow-sm active:scale-[0.98]',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-lg gap-2.5',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="xs" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
};

export default Button;
