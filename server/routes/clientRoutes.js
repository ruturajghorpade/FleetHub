// FleetHub – Client Routes
import express from 'express';
import {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import {
  createClientValidator,
  updateClientValidator,
  clientIdValidator,
} from '../validators/clientValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All client routes require authentication
router.use(protect);

// ════════════════════════════════════════
// /api/v1/clients
// ════════════════════════════════════════
router
  .route('/')
  .post(
    authorize(ROLES.SUPER_ADMIN),
    createClientValidator,
    createClient
  )
  .get(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER),
    getClients
  );

// ════════════════════════════════════════
// /api/v1/clients/:id
// ════════════════════════════════════════
router
  .route('/:id')
  .get(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER),
    clientIdValidator,
    getClient
  )
  .put(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
    updateClientValidator,
    updateClient
  )
  .delete(
    authorize(ROLES.SUPER_ADMIN),
    clientIdValidator,
    deleteClient
  );

export default router;
