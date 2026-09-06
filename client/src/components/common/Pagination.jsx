// FleetHub – Pagination Component
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  pageSize = 10,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 py-3 ${className}`}>
      {totalItems !== undefined && (
        <div>
          Showing <span className="font-medium text-slate-700 dark:text-slate-200">{startItem}</span> to{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{endItem}</span> of{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-neutral-200 dark:border-[#2E2E2E] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#242424] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <HiOutlineChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400">
                ...
              </span>
            );
          }
          const active = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`
                min-w-[32px] h-8 px-2 rounded-lg font-bold text-xs transition-colors
                ${active
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-600 dark:text-[#FAFAFA] hover:bg-slate-100 dark:hover:bg-[#242424]'
                }
              `}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-neutral-200 dark:border-[#2E2E2E] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#242424] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <HiOutlineChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
