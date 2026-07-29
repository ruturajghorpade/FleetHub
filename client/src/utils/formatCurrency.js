// FleetHub – Currency Formatting Utilities (INR)
import APP_CONFIG from '@/config/appConfig';

const { code, locale } = APP_CONFIG.currency;

/**
 * Format a number to Indian Rupee currency string
 * e.g., 150000 → "₹1,50,000.00"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format currency without decimals
 * e.g., 150000 → "₹1,50,000"
 */
export const formatCurrencyShort = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format large numbers in Indian notation
 * e.g., 1500000 → "₹15L", 10000000 → "₹1Cr"
 */
export const formatCurrencyCompact = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
};
