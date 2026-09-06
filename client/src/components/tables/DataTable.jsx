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
            <tr className="border-b border-[#E5E5E5] dark:border-[#2E2E2E] bg-[#F5F5F5] dark:bg-[#1A1A1A]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#A3A3A3] ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#2E2E2E] bg-white dark:bg-[#111111]">
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
                    hover:bg-[#FFFBEB] dark:hover:bg-[#1A1A1A]
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                >
                  {columns.map((col) => {
                    const cellValue = row[col.key];
                    const content = col.render ? col.render(cellValue, row, rowIndex) : cellValue;

                    return (
                      <td
                        key={col.key}
                        className={`px-5 py-3.5 text-slate-800 dark:text-[#FAFAFA] ${
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
        <div className="px-5 py-3 border-t border-[#E5E5E5] dark:border-[#2E2E2E]">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};

export default DataTable;
