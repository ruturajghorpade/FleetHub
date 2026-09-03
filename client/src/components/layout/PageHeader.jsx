// FleetHub – PageHeader Component
// Reusable header for all pages: title, subtitle, breadcrumb, optional actions.
import BreadcrumbNav from './BreadcrumbNav';

const PageHeader = ({
  title,
  subtitle,
  actions,
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {/* Breadcrumb */}
      <BreadcrumbNav className="mb-2.5" />

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
