// FleetHub – Vehicle Request Validators
import { body, param } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import { VEHICLE_TYPES, FUEL_TYPES, VEHICLE_STATUSES } from '../utils/constants.js';

// ════════════════════════════════════════
// Reusable field chains
// ════════════════════════════════════════

const vehicleNumberChain = (required = true) => {
  const chain = body('vehicleNumber').trim();
  if (required) {
    chain
      .notEmpty()
      .withMessage('Vehicle number is required');
  }
  return chain
    .isLength({ min: 3, max: 20 })
    .withMessage('Vehicle number must be between 3 and 20 characters');
};

const clientChain = () =>
  body('client')
    .notEmpty()
    .withMessage('Client is required')
    .isMongoId()
    .withMessage('Client must be a valid ID');

const branchChain = () =>
  body('branch')
    .notEmpty()
    .withMessage('Branch is required')
    .isMongoId()
    .withMessage('Branch must be a valid ID');

const vehicleTypeChain = () =>
  body('vehicleType')
    .optional({ values: 'null' })
    .isIn(Object.values(VEHICLE_TYPES))
    .withMessage(`Vehicle type must be one of: ${Object.values(VEHICLE_TYPES).join(', ')}`);

const fuelTypeChain = () =>
  body('fuelType')
    .optional({ values: 'null' })
    .isIn(Object.values(FUEL_TYPES))
    .withMessage(`Fuel type must be one of: ${Object.values(FUEL_TYPES).join(', ')}`);

const statusChain = () =>
  body('status')
    .optional()
    .isIn(Object.values(VEHICLE_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(VEHICLE_STATUSES).join(', ')}`);

const assignedDriverChain = () =>
  body('assignedDriver')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Assigned driver must be a valid user ID');

const yearChain = () =>
  body('manufacturingYear')
    .optional({ values: 'null' })
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Manufacturing year must be between 1900 and 2100')
    .toInt();

const odometerChain = () =>
  body('odometer')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('Odometer must be a non-negative number')
    .toFloat();

const purchasePriceChain = () =>
  body('purchasePrice')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a non-negative number')
    .toFloat();

const dateChain = (field, label) =>
  body(field)
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage(`${label} must be a valid date`)
    .toDate();

// ════════════════════════════════════════
// Create Vehicle Validation
// ════════════════════════════════════════
export const createVehicleValidator = [
  vehicleNumberChain(true),
  clientChain(),
  branchChain(),
  vehicleTypeChain(),
  fuelTypeChain(),
  statusChain(),
  assignedDriverChain(),

  body('brand').optional().trim().isLength({ max: 100 }).withMessage('Brand must not exceed 100 characters'),
  body('model').optional().trim().isLength({ max: 100 }).withMessage('Model must not exceed 100 characters'),
  yearChain(),

  body('engineNumber').optional().trim().isLength({ max: 50 }).withMessage('Engine number must not exceed 50 characters'),
  body('chassisNumber').optional().trim().isLength({ max: 50 }).withMessage('Chassis number must not exceed 50 characters'),
  body('capacity').optional().trim().isLength({ max: 50 }).withMessage('Capacity must not exceed 50 characters'),
  odometerChain(),

  body('insuranceNumber').optional().trim().isLength({ max: 100 }).withMessage('Insurance number must not exceed 100 characters'),
  dateChain('insuranceExpiry', 'Insurance expiry'),
  dateChain('fitnessExpiry', 'Fitness expiry'),
  dateChain('pollutionExpiry', 'Pollution expiry'),
  dateChain('permitExpiry', 'Permit expiry'),
  dateChain('registrationDate', 'Registration date'),
  dateChain('purchaseDate', 'Purchase date'),
  purchasePriceChain(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  validate,
];

// ════════════════════════════════════════
// Update Vehicle Validation
// ════════════════════════════════════════
export const updateVehicleValidator = [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),

  body('vehicleNumber')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Vehicle number must be between 3 and 20 characters'),

  body('client')
    .optional()
    .isMongoId()
    .withMessage('Client must be a valid ID'),

  body('branch')
    .optional()
    .isMongoId()
    .withMessage('Branch must be a valid ID'),

  vehicleTypeChain(),
  fuelTypeChain(),
  statusChain(),
  assignedDriverChain(),

  body('brand').optional().trim().isLength({ max: 100 }).withMessage('Brand must not exceed 100 characters'),
  body('model').optional().trim().isLength({ max: 100 }).withMessage('Model must not exceed 100 characters'),
  yearChain(),

  body('engineNumber').optional().trim().isLength({ max: 50 }).withMessage('Engine number must not exceed 50 characters'),
  body('chassisNumber').optional().trim().isLength({ max: 50 }).withMessage('Chassis number must not exceed 50 characters'),
  body('capacity').optional().trim().isLength({ max: 50 }).withMessage('Capacity must not exceed 50 characters'),
  odometerChain(),

  body('insuranceNumber').optional().trim().isLength({ max: 100 }).withMessage('Insurance number must not exceed 100 characters'),
  dateChain('insuranceExpiry', 'Insurance expiry'),
  dateChain('fitnessExpiry', 'Fitness expiry'),
  dateChain('pollutionExpiry', 'Pollution expiry'),
  dateChain('permitExpiry', 'Permit expiry'),
  dateChain('registrationDate', 'Registration date'),
  dateChain('purchaseDate', 'Purchase date'),
  purchasePriceChain(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  validate,
];

// ════════════════════════════════════════
// Param ID Validation (GET / DELETE)
// ════════════════════════════════════════
export const vehicleIdValidator = [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  validate,
];
