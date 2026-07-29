// FleetHub – Validation Utilities (Zod schemas)
import { z } from 'zod';

/**
 * Common validation patterns
 */
export const patterns = {
  phone: /^[6-9]\d{9}$/,
  pincode: /^\d{6}$/,
  vehicleNumber: /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/,
  panCard: /^[A-Z]{5}\d{4}[A-Z]$/,
  aadhaar: /^\d{12}$/,
  gst: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/,
  drivingLicense: /^[A-Z]{2}\d{13}$/,
};

/**
 * Reusable Zod field schemas
 */
export const fields = {
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(patterns.phone, 'Enter a valid 10-digit Indian mobile number'),
  pincode: z.string().regex(patterns.pincode, 'Enter a valid 6-digit pincode'),
  vehicleNumber: z.string().regex(patterns.vehicleNumber, 'Enter a valid vehicle number (e.g., MH12AB1234)'),
  requiredString: (label) => z.string().min(1, `${label} is required`),
  optionalString: z.string().optional().or(z.literal('')),
};
