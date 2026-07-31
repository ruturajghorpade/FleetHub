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

const router = express.Router();

// All client routes require authentication
router.use(protect);

// ════════════════════════════════════════
// /api/v1/clients
// ════════════════════════════════════════
router
  .route('/')
  .post(createClientValidator, createClient)
  .get(getClients);

// ════════════════════════════════════════
// /api/v1/clients/:id
// ════════════════════════════════════════
router
  .route('/:id')
  .get(clientIdValidator, getClient)
  .put(updateClientValidator, updateClient)
  .delete(clientIdValidator, deleteClient);

export default router;
