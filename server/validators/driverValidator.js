// FleetHub – Driver Request Validators
import { body, param } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';
import { DRIVER_STATUSES, GENDERS, BLOOD_GROUPS, LICENSE_TYPES, ROLES } from '../utils/constants.js';

// ════════════════════════════════════════
// Reusable field chains
// ════════════════════════════════════════

const employeeIdChain = (required = true) => {
  const chain = body('employeeId').trim();
  if (required) {
    chain
      .notEmpty()
      .withMessage('Employee ID is required');
  }
  return chain
    .isLength({ min: 2, max: 30 })
    .withMessage('Employee ID must be between 2 and 30 characters');
};

const clientChain = () =>
  body('client')
    .custom((value, { req }) => {
      if (!value && req.user?.role === ROLES.SUPER_ADMIN) {
        throw new Error('Client is required');
      }
      return true;
    })
    .optional({ values: 'falsy' })
    .isMongoId()
    .withMessage('Client must be a valid ID');

const branchChain = () =>
  body('branch')
    .notEmpty()
    .withMessage('Branch is required')
    .isMongoId()
    .withMessage('Branch must be a valid ID');

const licenseNumberChain = (required = true) => {
  const chain = body('licenseNumber').trim();
  if (required) {
    chain
      .notEmpty()
      .withMessage('License number is required');
  }
  return chain
    .isLength({ min: 5, max: 30 })
    .withMessage('License number must be between 5 and 30 characters');
};

const emailChain = () =>
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail();

const phoneChain = () =>
  body('phone')
    .optional({ values: 'falsy' })
    .trim();

const statusChain = () =>
  body('status')
    .optional()
    .customSanitizer((v) => (v ? v.toLowerCase() : v))
    .isIn(Object.values(DRIVER_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(DRIVER_STATUSES).join(', ')}`);

const availabilityChain = () =>
  body('availability')
    .optional({ values: 'null' })
    .customSanitizer((v) => (v ? v.toUpperCase() : v))
    .isIn(['AVAILABLE', 'BUSY', 'OFFLINE'])
    .withMessage('Availability must be one of: AVAILABLE, BUSY, OFFLINE');

const genderChain = () =>
  body('gender')
    .optional({ values: 'null' })
    .isIn(Object.values(GENDERS))
    .withMessage(`Gender must be one of: ${Object.values(GENDERS).join(', ')}`);

const bloodGroupChain = () =>
  body('bloodGroup')
    .optional({ values: 'null' })
    .isIn(Object.values(BLOOD_GROUPS))
    .withMessage(`Blood group must be one of: ${Object.values(BLOOD_GROUPS).join(', ')}`);

const licenseTypeChain = () =>
  body('licenseType')
    .optional({ values: 'null' })
    .isIn(Object.values(LICENSE_TYPES))
    .withMessage(`License type must be one of: ${Object.values(LICENSE_TYPES).join(', ')}`);

const assignedVehicleChain = () =>
  body('assignedVehicle')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Assigned vehicle must be a valid ID');

const userChain = () =>
  body('user')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('User must be a valid ID');

const dateChain = (field, label) =>
  body(field)
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage(`${label} must be a valid date`)
    .toDate();

const salaryChain = () =>
  body('salary')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('Salary must be a non-negative number')
    .toFloat();

const experienceChain = () =>
  body('experience')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('Experience must be a non-negative number')
    .toFloat();

const ratingChain = () =>
  body('rating')
    .optional({ values: 'null' })
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5')
    .toFloat();

// ════════════════════════════════════════
// Create Driver Validation
// ════════════════════════════════════════
export const createDriverValidator = [
  employeeIdChain(true),
  clientChain(),
  branchChain(),
  licenseNumberChain(true),
  userChain(),
  emailChain(),
  phoneChain(),
  statusChain(),
  availabilityChain(),
  genderChain(),
  bloodGroupChain(),
  licenseTypeChain(),
  assignedVehicleChain(),

  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  dateChain('dateOfBirth', 'Date of birth'),
  dateChain('licenseIssueDate', 'License issue date'),
  dateChain('licenseExpiryDate', 'License expiry date'),
  dateChain('joiningDate', 'Joining date'),

  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('postalCode').optional().trim(),

  body('aadhaarNumber')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 12 })
    .withMessage('Aadhaar number must not exceed 12 characters'),

  experienceChain(),
  salaryChain(),
  ratingChain(),

  body('emergencyContactName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name must not exceed 100 characters'),

  body('emergencyContactNumber')
    .optional()
    .trim(),

  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Remarks must not exceed 1000 characters'),

  validate,
];

// ════════════════════════════════════════
// Update Driver Validation
// ════════════════════════════════════════
export const updateDriverValidator = [
  param('id').isMongoId().withMessage('Invalid driver ID'),

  body('employeeId')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Employee ID must be between 2 and 30 characters'),

  body('client')
    .optional()
    .isMongoId()
    .withMessage('Client must be a valid ID'),

  body('branch')
    .optional()
    .isMongoId()
    .withMessage('Branch must be a valid ID'),

  body('licenseNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 30 })
    .withMessage('License number must be between 5 and 30 characters'),

  userChain(),
  emailChain(),
  phoneChain(),
  statusChain(),
  availabilityChain(),
  genderChain(),
  bloodGroupChain(),
  licenseTypeChain(),
  assignedVehicleChain(),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  dateChain('dateOfBirth', 'Date of birth'),
  dateChain('licenseIssueDate', 'License issue date'),
  dateChain('licenseExpiryDate', 'License expiry date'),
  dateChain('joiningDate', 'Joining date'),

  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('postalCode').optional().trim(),

  body('aadhaarNumber')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 12 })
    .withMessage('Aadhaar number must not exceed 12 characters'),

  experienceChain(),
  salaryChain(),
  ratingChain(),

  body('emergencyContactName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name must not exceed 100 characters'),

  body('emergencyContactNumber')
    .optional()
    .trim(),

  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Remarks must not exceed 1000 characters'),

  validate,
];

// ════════════════════════════════════════
// Param ID Validation (GET / DELETE)
// ════════════════════════════════════════
export const driverIdValidator = [
  param('id').isMongoId().withMessage('Invalid driver ID'),
  validate,
];

// ════════════════════════════════════════
// Assign Vehicle Validation
// ════════════════════════════════════════
export const assignVehicleValidator = [
  param('id').isMongoId().withMessage('Invalid driver ID'),
  body('vehicleId')
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .isMongoId()
    .withMessage('Vehicle ID must be a valid ID'),
  validate,
];
