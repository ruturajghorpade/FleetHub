// FleetHub – Card Component
// Enterprise card container with clean borders, dark mode, and subtle hover states.

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-5',
  ...props
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-[#111111]
        rounded-xl shadow-sm border border-neutral-200 dark:border-[#2E2E2E]
        ${padding}
        transition-all duration-200
        ${hover ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card.Header – top section with title and optional actions
 */
const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    {children}
  </div>
);

/**
 * Card.Title – card heading text
 */
const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base font-semibold text-slate-900 dark:text-[#FAFAFA] ${className}`}>
    {children}
  </h3>
);

/**
 * Card.Body – main content area
 */
const CardBody = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

/**
 * Card.Footer – bottom section
 */
const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-[#2E2E2E] ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
