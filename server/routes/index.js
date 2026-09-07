// FleetHub – API Routes Index (v1)
import express from 'express';
import { env } from '../config/env.js';
import authRoutes from './authRoutes.js';
import clientRoutes from './clientRoutes.js';
import branchRoutes from './branchRoutes.js';
import userRoutes from './userRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import driverRoutes from './driverRoutes.js';
import deliveryRoutes from './deliveryRoutes.js';
import reportRoutes from './reportRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';

const router = express.Router();

// ════════════════════════════════════════
// Health Check
// ════════════════════════════════════════
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'FleetHub API is running – Food Delivery Logistics Edition',
    version: 'v1',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ════════════════════════════════════════
// Module Routes
// ════════════════════════════════════════
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/clients', clientRoutes);
router.use('/branches', branchRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/maintenance', maintenanceRoutes);

export default router;
