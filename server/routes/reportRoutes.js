// FleetHub – Report Routes
import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER));

router.get('/daily-deliveries', reportController.getDailyDeliveries);
router.get('/restaurants', reportController.getRestaurantReport);
router.get('/drivers', reportController.getDriverReport);
router.get('/vehicle-usage', reportController.getVehicleUsageReport);
router.get('/cancelled-deliveries', reportController.getCancelledDeliveries);

export default router;
