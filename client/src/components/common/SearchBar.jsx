// FleetHub – SearchBar Component
import { useState, useCallback, useEffect, useRef } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';

const SearchBar = ({
  value: controlledValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const timerRef = useRef(null);

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setInternalValue(val);

      if (onChange) {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onChange(val), debounceMs);
      }
    },
    [onChange, debounceMs]
  );

  const handleClear = useCallback(() => {
    setInternalValue('');
    clearTimeout(timerRef.current);
    onChange?.('');
  }, [onChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-300 dark:border-slate-700
                   bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm
                   placeholder:text-slate-400 dark:placeholder:text-slate-500
                   transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
      />
      {internalValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Clear search"
        >
          <HiOutlineXMark className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
