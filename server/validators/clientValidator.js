// FleetHub – Client Request Validators
import { body, param } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import { STATUSES } from '../utils/constants.js';

// ════════════════════════════════════════
// Reusable field chains
// ════════════════════════════════════════

const companyNameChain = () =>
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters');

const companyCodeChain = () =>
  body('companyCode')
    .trim()
    .notEmpty()
    .withMessage('Company code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Company code must be between 2 and 20 characters')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Company code may only contain letters, numbers, hyphens, and underscores');

const emailChain = () =>
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail();

const phoneChain = () =>
  body('phone')
    .optional({ values: 'null' })
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number');

const gstChain = () =>
  body('gstNumber')
    .optional({ values: 'null' })
    .trim()
    .isLength({ min: 15, max: 15 })
    .withMessage('GST number must be exactly 15 characters');

const panChain = () =>
  body('panNumber')
    .optional({ values: 'null' })
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage('PAN number must be exactly 10 characters')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
    .withMessage('PAN number format is invalid (e.g. ABCDE1234F)');

const subscriptionPlanChain = () =>
  body('subscriptionPlan')
    .optional()
    .isIn(['free', 'starter', 'professional', 'enterprise'])
    .withMessage('Subscription plan must be one of: free, starter, professional, enterprise');

const statusChain = () =>
  body('status')
    .optional()
    .isIn(Object.values(STATUSES))
    .withMessage(`Status must be one of: ${Object.values(STATUSES).join(', ')}`);

const positiveIntChain = (field, label) =>
  body(field)
    .optional()
    .isInt({ min: 1 })
    .withMessage(`${label} must be a positive integer`)
    .toInt();

// ════════════════════════════════════════
// Create Client Validation
// ════════════════════════════════════════
export const createClientValidator = [
  companyNameChain(),
  companyCodeChain(),
  emailChain(),
  phoneChain(),
  gstChain(),
  panChain(),

  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('postalCode').optional().trim(),

  subscriptionPlanChain(),

  body('subscriptionStartDate')
    .optional()
    .isISO8601()
    .withMessage('Subscription start date must be a valid ISO 8601 date'),

  body('subscriptionEndDate')
    .optional()
    .isISO8601()
    .withMessage('Subscription end date must be a valid ISO 8601 date'),

  positiveIntChain('maxBranches', 'Max branches'),
  positiveIntChain('maxVehicles', 'Max vehicles'),
  positiveIntChain('maxUsers', 'Max users'),

  statusChain(),

  validate,
];

// ════════════════════════════════════════
// Update Client Validation
// ════════════════════════════════════════
export const updateClientValidator = [
  param('id').isMongoId().withMessage('Invalid client ID'),

  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),

  body('companyCode')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Company code must be between 2 and 20 characters')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Company code may only contain letters, numbers, hyphens, and underscores'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  phoneChain(),
  gstChain(),
  panChain(),

  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('postalCode').optional().trim(),

  subscriptionPlanChain(),

  body('subscriptionStartDate')
    .optional()
    .isISO8601()
    .withMessage('Subscription start date must be a valid ISO 8601 date'),

  body('subscriptionEndDate')
    .optional()
    .isISO8601()
    .withMessage('Subscription end date must be a valid ISO 8601 date'),

  positiveIntChain('maxBranches', 'Max branches'),
  positiveIntChain('maxVehicles', 'Max vehicles'),
  positiveIntChain('maxUsers', 'Max users'),

  statusChain(),

  validate,
];

// ════════════════════════════════════════
// Param ID Validation (GET / DELETE)
// ════════════════════════════════════════
export const clientIdValidator = [
  param('id').isMongoId().withMessage('Invalid client ID'),
  validate,
];
