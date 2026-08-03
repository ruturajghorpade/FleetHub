// FleetHub – User Routes
import express from 'express';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  updateUserRole,
  resetUserPassword,
} from '../controllers/userController.js';
import {
  createUserValidator,
  updateUserValidator,
  userIdValidator,
  updateRoleValidator,
  resetPasswordValidator,
} from '../validators/userValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// ════════════════════════════════════════
// /api/v1/users
// ════════════════════════════════════════
router
  .route('/')
  .post(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.BRANCH_MANAGER),
    createUserValidator,
    createUser
  )
  .get(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.BRANCH_MANAGER, ROLES.DISPATCHER),
    getUsers
  );

// ════════════════════════════════════════
// /api/v1/users/:id
// ════════════════════════════════════════
router
  .route('/:id')
  .get(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.BRANCH_MANAGER, ROLES.DISPATCHER, ROLES.DRIVER),
    userIdValidator,
    getUser
  )
  .put(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
    updateUserValidator,
    updateUser
  )
  .delete(
    authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
    userIdValidator,
    deleteUser
  );

// ════════════════════════════════════════
// /api/v1/users/:id/activate
// ════════════════════════════════════════
router.patch(
  '/:id/activate',
  authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
  userIdValidator,
  activateUser
);

// ════════════════════════════════════════
// /api/v1/users/:id/deactivate
// ════════════════════════════════════════
router.patch(
  '/:id/deactivate',
  authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
  userIdValidator,
  deactivateUser
);

// ════════════════════════════════════════
// /api/v1/users/:id/role
// ════════════════════════════════════════
router.patch(
  '/:id/role',
  authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
  updateRoleValidator,
  updateUserRole
);

// ════════════════════════════════════════
// /api/v1/users/:id/reset-password
// ════════════════════════════════════════
router.patch(
  '/:id/reset-password',
  authorize(ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN),
  resetPasswordValidator,
  resetUserPassword
);

export default router;
