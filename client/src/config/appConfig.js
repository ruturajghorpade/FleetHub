// FleetHub Application Configuration

const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'FleetHub',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  description: 'Multi-client fleet & logistics management platform',
  company: 'FleetHub Technologies',
  region: 'India (Maharashtra)',
  currency: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'hh:mm a',
  dateTimeFormat: 'dd/MM/yyyy hh:mm a',
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

export default APP_CONFIG;
