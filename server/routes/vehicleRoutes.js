// FleetHub – Vehicle Routes
import express from 'express';
import {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js';
import {
  createVehicleValidator,
  updateVehicleValidator,
  vehicleIdValidator,
} from '../validators/vehicleValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All vehicle routes require authentication
router.use(protect);

// ════════════════════════════════════════
// /api/v1/vehicles
// ════════════════════════════════════════
router
  .route('/')
  .post(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.BRANCH_MANAGER),
    createVehicleValidator,
    createVehicle
  )
  .get(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.BRANCH_MANAGER, ROLES.DISPATCHER, ROLES.DRIVER),
    getVehicles
  );

// ════════════════════════════════════════
// /api/v1/vehicles/:id
// ════════════════════════════════════════
router
  .route('/:id')
  .get(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.BRANCH_MANAGER, ROLES.DISPATCHER, ROLES.DRIVER),
    vehicleIdValidator,
    getVehicle
  )
  .put(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.BRANCH_MANAGER),
    updateVehicleValidator,
    updateVehicle
  )
  .delete(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.BRANCH_MANAGER),
    vehicleIdValidator,
    deleteVehicle
  );

export default router;
