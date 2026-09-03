// FleetHub – Delivery Routes
import express from 'express';
import * as deliveryController from '../controllers/deliveryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  validateCreateDelivery,
  validateAssignDelivery,
  validateCancelDelivery,
  validateUpdateDeliveryStatus,
} from '../validators/deliveryValidator.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/v1/deliveries — All authenticated roles
router.get('/', deliveryController.getDeliveries);

// GET /api/v1/deliveries/:id
router.get('/:id', deliveryController.getDelivery);

// POST /api/v1/deliveries — Client Admin & Super Admin create requests
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
  validateCreateDelivery,
  deliveryController.createDelivery
);

// POST /api/v1/deliveries/:id/assign — Dispatcher & Super Admin manual assign
router.post(
  '/:id/assign',
  authorize(ROLES.SUPER_ADMIN, ROLES.DISPATCHER),
  validateAssignDelivery,
  deliveryController.manualAssignDelivery
);

// POST /api/v1/deliveries/:id/auto-assign — Dispatcher & Super Admin auto assign
router.post(
  '/:id/auto-assign',
  authorize(ROLES.SUPER_ADMIN, ROLES.DISPATCHER),
  deliveryController.autoAssignDelivery
);

// PATCH /api/v1/deliveries/:id/status — Driver, Dispatcher, Super Admin status update
router.patch(
  '/:id/status',
  authorize(ROLES.SUPER_ADMIN, ROLES.DISPATCHER, ROLES.DRIVER),
  validateUpdateDeliveryStatus,
  deliveryController.updateDeliveryStatus
);

// POST /api/v1/deliveries/:id/cancel — Client Admin (before pickup), Dispatcher, Super Admin
router.post(
  '/:id/cancel',
  authorize(ROLES.SUPER_ADMIN, ROLES.DISPATCHER, ROLES.CLIENT_ADMIN),
  validateCancelDelivery,
  deliveryController.cancelDelivery
);

export default router;
