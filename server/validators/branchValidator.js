// FleetHub – Branch Request Validators
import { body, param } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import { STATUSES } from '../utils/constants.js';

// ════════════════════════════════════════
// Reusable field chains
// ════════════════════════════════════════

const branchNameChain = (required = true) => {
  const chain = body('branchName').trim();
  if (required) {
    chain
      .notEmpty()
      .withMessage('Branch name is required');
  }
  return chain
    .isLength({ min: 2, max: 200 })
    .withMessage('Branch name must be between 2 and 200 characters');
};

const branchCodeChain = (required = true) => {
  const chain = body('branchCode').trim();
  if (required) {
    chain
      .notEmpty()
      .withMessage('Branch code is required');
  }
  return chain
    .isLength({ min: 2, max: 20 })
    .withMessage('Branch code must be between 2 and 20 characters')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Branch code may only contain letters, numbers, hyphens, and underscores');
};

const clientChain = () =>
  body('client')
    .notEmpty()
    .withMessage('Client is required')
    .isMongoId()
    .withMessage('Client must be a valid ID');

const emailChain = () =>
  body('email')
    .optional({ values: 'null' })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail();

const phoneChain = () =>
  body('phone')
    .optional({ values: 'null' })
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number');

const managerChain = () =>
  body('manager')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Manager must be a valid user ID');

const statusChain = () =>
  body('status')
    .optional()
    .isIn(Object.values(STATUSES))
    .withMessage(`Status must be one of: ${Object.values(STATUSES).join(', ')}`);

const latitudeChain = () =>
  body('latitude')
    .optional({ values: 'null' })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90')
    .toFloat();

const longitudeChain = () =>
  body('longitude')
    .optional({ values: 'null' })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
    .toFloat();

const positiveIntChain = (field, label) =>
  body(field)
    .optional()
    .isInt({ min: 1 })
    .withMessage(`${label} must be a positive integer`)
    .toInt();

// ════════════════════════════════════════
// Create Branch Validation
// ════════════════════════════════════════
export const createBranchValidator = [
  branchNameChain(true),
  branchCodeChain(true),
  clientChain(),
  emailChain(),
  phoneChain(),
  managerChain(),

  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('postalCode').optional().trim(),

  latitudeChain(),
  longitudeChain(),

  body('operatingHours').optional().trim(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  positiveIntChain('maxVehicles', 'Max vehicles'),
  positiveIntChain('maxDrivers', 'Max drivers'),

  statusChain(),

  validate,
];

// ════════════════════════════════════════
// Update Branch Validation
// ════════════════════════════════════════
export const updateBranchValidator = [
  param('id').isMongoId().withMessage('Invalid branch ID'),

  body('branchName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Branch name must be between 2 and 200 characters'),

  body('branchCode')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Branch code must be between 2 and 20 characters')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Branch code may only contain letters, numbers, hyphens, and underscores'),

  body('client')
    .optional()
    .isMongoId()
    .withMessage('Client must be a valid ID'),

  emailChain(),
  phoneChain(),
  managerChain(),

  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('postalCode').optional().trim(),

  latitudeChain(),
  longitudeChain(),

  body('operatingHours').optional().trim(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  positiveIntChain('maxVehicles', 'Max vehicles'),
  positiveIntChain('maxDrivers', 'Max drivers'),

  statusChain(),

  validate,
];

// ════════════════════════════════════════
// Param ID Validation (GET / DELETE)
// ════════════════════════════════════════
export const branchIdValidator = [
  param('id').isMongoId().withMessage('Invalid branch ID'),
  validate,
];
