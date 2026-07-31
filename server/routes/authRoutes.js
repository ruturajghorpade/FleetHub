// FleetHub – Auth Routes
import express from 'express';
import { register, login, logout, refreshToken, getMe } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ════════════════════════════════════════
// Public Routes
// ════════════════════════════════════════
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/refresh', refreshToken);

// ════════════════════════════════════════
// Protected Routes (require valid JWT)
// ════════════════════════════════════════
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
