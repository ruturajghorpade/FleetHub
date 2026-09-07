// FleetHub – Driver Routes
import express from 'express';
import {
  createDriver,
  getDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
  assignVehicle,
  removeAssignedVehicle,
} from '../controllers/driverController.js';
import {
  createDriverValidator,
  updateDriverValidator,
  driverIdValidator,
  assignVehicleValidator,
} from '../validators/driverValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All driver routes require authentication
router.use(protect);

// ════════════════════════════════════════
// /api/v1/drivers
// ════════════════════════════════════════
router
  .route('/')
  .post(
    authorize(ROLES.SUPER_ADMIN, ROLES.DISPATCHER),
    createDriverValidator,
    createDriver
  )
  .get(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER, ROLES.DRIVER),
    getDrivers
  );

// ════════════════════════════════════════
// /api/v1/drivers/:id
// ════════════════════════════════════════
router
  .route('/:id')
  .get(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER, ROLES.DRIVER),
    driverIdValidator,
    getDriver
  )
  .put(
    authorize(ROLES.SUPER_ADMIN, ROLES.DISPATCHER),
    updateDriverValidator,
    updateDriver
  )
  .delete(
    authorize(ROLES.SUPER_ADMIN),
    driverIdValidator,
    deleteDriver
  );

// ════════════════════════════════════════
// /api/v1/drivers/:id/assign-vehicle
// ════════════════════════════════════════
router
  .route('/:id/assign-vehicle')
  .patch(
    authorize(ROLES.SUPER_ADMIN, ROLES.DISPATCHER),
    assignVehicleValidator,
    assignVehicle
  );

// ════════════════════════════════════════
// /api/v1/drivers/:id/remove-vehicle
// ════════════════════════════════════════
router
  .route('/:id/remove-vehicle')
  .patch(
    authorize(ROLES.SUPER_ADMIN, ROLES.DISPATCHER),
    driverIdValidator,
    removeAssignedVehicle
  );

export default router;
