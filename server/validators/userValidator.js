// FleetHub – User Request Validators
import { body, param } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import { ROLES } from '../utils/constants.js';

// ════════════════════════════════════════
// Reusable field chains
// ════════════════════════════════════════

const nameChain = (required = true) => {
  const chain = body('name').trim();
  if (required) {
    return chain
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters');
  }
  return chain
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters');
};

const emailChain = (required = true) => {
  const chain = body('email').trim();
  if (required) {
    return chain
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail();
  }
  return chain
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail();
};

const phoneChain = () =>
  body('phone')
    .optional({ values: 'null' })
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number');

const passwordChain = (required = true) => {
  const chain = body('password');
  if (required) {
    return chain
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters');
  }
  return chain
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters');
};

const roleChain = (required = true) => {
  const chain = body('role').customSanitizer((v) => (typeof v === 'string' ? v.toLowerCase() : v));
  if (required) {
    return chain
      .notEmpty()
      .withMessage('Role is required')
      .isIn(Object.values(ROLES))
      .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`);
  }
  return chain
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`);
};

const clientChain = () =>
  body('client')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Client must be a valid ID');

const branchChain = () =>
  body('branch')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Branch must be a valid ID');

const mongoIdParam = () =>
  param('id').isMongoId().withMessage('Invalid user ID');

// ════════════════════════════════════════
// Create User Validation
// ════════════════════════════════════════
export const createUserValidator = [
  nameChain(true),
  emailChain(true),
  phoneChain(),
  passwordChain(true),
  roleChain(true),
  clientChain(),
  branchChain(),
  validate,
];

// ════════════════════════════════════════
// Update User Validation
// ════════════════════════════════════════
export const updateUserValidator = [
  mongoIdParam(),
  nameChain(false),
  emailChain(false),
  phoneChain(),
  roleChain(false),
  clientChain(),
  branchChain(),
  validate,
];

// ════════════════════════════════════════
// Param ID Validation (GET / DELETE / ACTIVATE / DEACTIVATE)
// ════════════════════════════════════════
export const userIdValidator = [
  mongoIdParam(),
  validate,
];

// ════════════════════════════════════════
// Update Role Validation
// ════════════════════════════════════════
export const updateRoleValidator = [
  mongoIdParam(),
  roleChain(true),
  validate,
];

// ════════════════════════════════════════
// Reset Password Validation
// ════════════════════════════════════════
export const resetPasswordValidator = [
  mongoIdParam(),
  passwordChain(true),
  validate,
];

// ════════════════════════════════════════
// Assign Client Validation
// ════════════════════════════════════════
export const assignClientValidator = [
  mongoIdParam(),
  body('client')
    .notEmpty()
    .withMessage('Client ID is required')
    .isMongoId()
    .withMessage('Client must be a valid ID'),
  validate,
];

// ════════════════════════════════════════
// Assign Branch Validation
// ════════════════════════════════════════
export const assignBranchValidator = [
  mongoIdParam(),
  body('branch')
    .notEmpty()
    .withMessage('Branch ID is required')
    .isMongoId()
    .withMessage('Branch must be a valid ID'),
  validate,
];
