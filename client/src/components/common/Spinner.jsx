// FleetHub – Inline Spinner Component
const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
    xl: 'w-12 h-12 border-[3px]',
  };

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full
        border-primary-200 dark:border-dark-600
        border-t-primary-600 dark:border-t-primary-400
        animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
