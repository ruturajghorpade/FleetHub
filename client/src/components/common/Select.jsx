// FleetHub – Select Component
import { forwardRef } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi2';

const Select = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  id,
  className = '',
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`
            w-full pl-3.5 pr-10 py-2 rounded-lg border text-sm appearance-none
            bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
            transition-all duration-200
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
              : 'border-slate-300 dark:border-slate-700 focus:ring-primary-500/20 focus:border-primary-500'
            }
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <HiOutlineChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
