// FleetHub – Maintenance Routes (Food Delivery Fleet Logistics)
import express from 'express';
import {
  getMaintenanceRecords,
  getMaintenanceRecord,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  startMaintenanceRecord,
  completeMaintenanceRecord,
  cancelMaintenanceRecord,
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
  .route('/:id/start')
  .patch(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER),
    startMaintenanceRecord
  );

router
  .route('/:id/complete')
  .patch(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER),
    completeMaintenanceRecord
  );

router
  .route('/:id/cancel')
  .patch(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER),
    cancelMaintenanceRecord
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
