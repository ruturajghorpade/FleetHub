// FleetHub – Modal Component
import { useEffect, useRef } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showClose = true,
  className = '',
}) => {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#090909]/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`
          relative w-full ${SIZES[size] || SIZES.md}
          bg-white dark:bg-[#111111]
          border border-neutral-200 dark:border-[#2E2E2E]
          rounded-xl shadow-2xl
          z-10 overflow-hidden
          animate-slide-in-up
          ${className}
        `}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-5 border-b border-neutral-100 dark:border-[#2E2E2E]">
            <div>
              {title && (
                <h3 id="modal-title" className="text-base font-semibold text-slate-900 dark:text-[#FAFAFA]">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-[#A3A3A3]">
                  {subtitle}
                </p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#242424] transition-colors"
                aria-label="Close modal"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

/**
 * Modal.Footer – standard action container
 */
const ModalFooter = ({ children, className = '' }) => (
  <div className={`mt-5 pt-4 border-t border-neutral-100 dark:border-[#2E2E2E] flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);

Modal.Footer = ModalFooter;

export default Modal;
