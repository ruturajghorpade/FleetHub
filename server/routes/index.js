// FleetHub – API Routes Index (v1)
import express from 'express';
import { env } from '../config/env.js';
import authRoutes from './authRoutes.js';
import clientRoutes from './clientRoutes.js';
import branchRoutes from './branchRoutes.js';
import userRoutes from './userRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import driverRoutes from './driverRoutes.js';

const router = express.Router();

// ════════════════════════════════════════
// Health Check
// ════════════════════════════════════════
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'FleetHub API is running',
    version: 'v1',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ════════════════════════════════════════
// Module Routes
// ════════════════════════════════════════
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/branches', branchRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);

// ── Future phases ───────────────────────
// router.use('/deliveries',    deliveryRoutes);
// router.use('/routes',        routeRoutes);
// router.use('/maintenance',   maintenanceRoutes);
// router.use('/reports',       reportRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/settings',      settingsRoutes);
// router.use('/dashboard',     dashboardRoutes);
// router.use('/documents',     documentRoutes);

export default router;

