// FleetHub – Reusable DataTable Component
// Enterprise table with clean headers, row hover states, and dark mode support.
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';

const DataTable = ({
  columns = [],
  data = [],
  keyField = '_id',
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  pagination,
  className = '',
}) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row[keyField] || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    transition-colors duration-150
                    hover:bg-slate-50/70 dark:hover:bg-slate-800/40
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                >
                  {columns.map((col) => {
                    const cellValue = row[col.key];
                    const content = col.render ? col.render(cellValue, row, rowIndex) : cellValue;

                    return (
                      <td
                        key={col.key}
                        className={`px-5 py-3.5 text-slate-700 dark:text-slate-200 ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        } ${col.cellClassName || ''}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};

export default DataTable;
