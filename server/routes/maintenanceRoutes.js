// FleetHub – Maintenance Routes
import express from 'express';
import {
  getMaintenanceRecords,
  getMaintenanceRecord,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from '../controllers/maintenanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getMaintenanceRecords)
  .post(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER),
    createMaintenanceRecord
  );

router
  .route('/:id')
  .get(getMaintenanceRecord)
  .put(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER),
    updateMaintenanceRecord
  )
  .delete(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
    deleteMaintenanceRecord
  );

export default router;
