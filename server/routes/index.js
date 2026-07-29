// FleetHub – API Routes Index (v1)
import express from 'express';
import { env } from '../config/env.js';

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
// Module routes (will be added in future phases)
// ════════════════════════════════════════
// router.use('/auth',          authRoutes);
// router.use('/users',         userRoutes);
// router.use('/clients',       clientRoutes);
// router.use('/branches',      branchRoutes);
// router.use('/vehicles',      vehicleRoutes);
// router.use('/drivers',       driverRoutes);
// router.use('/deliveries',    deliveryRoutes);
// router.use('/routes',        routeRoutes);
// router.use('/maintenance',   maintenanceRoutes);
// router.use('/reports',       reportRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/settings',      settingsRoutes);
// router.use('/dashboard',     dashboardRoutes);
// router.use('/documents',     documentRoutes);

export default router;
