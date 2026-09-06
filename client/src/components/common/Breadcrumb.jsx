// FleetHub – Breadcrumb Component
import { Link } from 'react-router-dom';
import { HiOutlineChevronRight } from 'react-icons/hi2';

const Breadcrumb = ({ items = [], className = '' }) => {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.path || index} className="flex items-center gap-1.5">
              {index > 0 && (
                <HiOutlineChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
              )}
              {isLast || !item.path ? (
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors truncate"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
