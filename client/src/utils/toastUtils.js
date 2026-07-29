// FleetHub – Toast Notification Utilities
import toast from 'react-hot-toast';

/**
 * Show a success toast
 */
export const showSuccess = (message) => {
  toast.success(message);
};

/**
 * Show an error toast
 */
export const showError = (message) => {
  toast.error(message || 'Something went wrong');
};

/**
 * Show an info toast
 */
export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
  });
};

/**
 * Show a loading toast (returns toast ID for later dismissal)
 */
export const showLoading = (message = 'Loading...') => {
  return toast.loading(message);
};

/**
 * Dismiss a specific toast or all toasts
 */
export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

/**
 * Promise-based toast (auto handles loading → success/error)
 */
export const showPromise = (promise, { loading, success, error }) => {
  return toast.promise(promise, {
    loading: loading || 'Processing...',
    success: success || 'Done!',
    error: error || 'Something went wrong',
  });
};
