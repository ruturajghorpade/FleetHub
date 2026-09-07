// FleetHub – Branch Routes
import express from 'express';
import {
  createBranch,
  getBranches,
  getBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branchController.js';
import {
  createBranchValidator,
  updateBranchValidator,
  branchIdValidator,
} from '../validators/branchValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All branch routes require authentication
router.use(protect);

// ════════════════════════════════════════
// /api/v1/branches
// ════════════════════════════════════════
router
  .route('/')
  .post(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
    createBranchValidator,
    createBranch
  )
  .get(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER),
    getBranches
  );

// ════════════════════════════════════════
// /api/v1/branches/:id
// ════════════════════════════════════════
router
  .route('/:id')
  .get(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER),
    branchIdValidator,
    getBranch
  )
  .put(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
    updateBranchValidator,
    updateBranch
  )
  .delete(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
    branchIdValidator,
    deleteBranch
  );

export default router;
