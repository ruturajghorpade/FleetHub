// FleetHub – Tooltip Component (CSS-only, lightweight)

const POSITIONS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
}) => {
  if (!content) return children;

  return (
    <div className={`relative group inline-flex ${className}`}>
      {children}
      <div
        className={`
          absolute ${POSITIONS[position]}
          px-2.5 py-1 rounded-md
          bg-slate-900 dark:bg-slate-100
          text-white dark:text-slate-900
          text-xs font-medium whitespace-nowrap
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 ease-out
          z-50 pointer-events-none
          shadow-md
        `}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
