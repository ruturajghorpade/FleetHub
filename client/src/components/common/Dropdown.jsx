// FleetHub – Dropdown Component
import { useState, useRef, useEffect } from 'react';

const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  const alignClasses = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Menu */}
      {open && (
        <div
          className={`
            absolute ${alignClasses} mt-2 z-50
            min-w-[200px] py-1.5
            bg-white dark:bg-[#111111]
            rounded-xl shadow-xl
            border border-[#E5E5E5] dark:border-[#2E2E2E]
            animate-fade-in
          `}
        >
          {typeof children === 'function'
            ? children({ close: () => setOpen(false) })
            : children}
        </div>
      )}
    </div>
  );
};

/**
 * Dropdown.Item — individual menu item
 */
const DropdownItem = ({
  children,
  icon: Icon,
  onClick,
  danger = false,
  className = '',
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left
      transition-colors duration-150
      ${danger
        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1A1A1A]'
      }
      ${className}
    `}
  >
    {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-slate-400 dark:text-slate-500" />}
    {children}
  </button>
);

/**
 * Dropdown.Divider — horizontal separator
 */
const DropdownDivider = () => (
  <div className="my-1.5 border-t border-slate-100 dark:border-[#2E2E2E]" />
);

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;

export default Dropdown;
