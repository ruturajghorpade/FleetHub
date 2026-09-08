// FleetHub – Delivery Request Validators (express-validator)
import { body, param } from 'express-validator';
import { validate } from '../middleware/validationMiddleware.js';

export const validateCreateDelivery = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),

  body('customerPhone')
    .trim()
    .notEmpty()
    .withMessage('Customer phone is required'),

  body('pickupLocation.name')
    .trim()
    .notEmpty()
    .withMessage('Pickup restaurant name is required'),

  body('pickupLocation.address')
    .trim()
    .notEmpty()
    .withMessage('Pickup address is required'),

  body('deliveryLocation.address')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required'),

  body('client')
    .optional()
    .isMongoId()
    .withMessage('Client must be a valid ID'),

  body('branch')
    .optional({ values: 'falsy' })
    .isMongoId()
    .withMessage('Branch must be a valid ID'),

  validate,
];

export const validateAssignDelivery = [
  param('id')
    .isMongoId()
    .withMessage('Invalid delivery ID'),

  body('driverId')
    .notEmpty()
    .withMessage('Driver ID is required')
    .isMongoId()
    .withMessage('Driver ID must be a valid ID'),

  body('vehicleId')
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .isMongoId()
    .withMessage('Vehicle ID must be a valid ID'),

  validate,
];

export const validateCancelDelivery = [
  param('id')
    .isMongoId()
    .withMessage('Invalid delivery ID'),

  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Cancellation reason must be between 3 and 500 characters'),

  validate,
];

export const validateUpdateDeliveryStatus = [
  param('id')
    .isMongoId()
    .withMessage('Invalid delivery ID'),

  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'PENDING', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'])
    .withMessage('Invalid delivery status'),

  validate,
];
