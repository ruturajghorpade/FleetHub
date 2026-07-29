// FleetHub – CORS Configuration
import cors from 'cors';
import { env } from './env.js';

/**
 * Build the CORS whitelist from the CLIENT_URL env var.
 * In development, all origins are accepted for convenience.
 */
const allowedOrigins = [env.CLIENT_URL];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);

    // In development, accept every origin
    if (env.NODE_ENV === 'development') return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // Pre-flight cache – 24 hours
};

export const corsMiddleware = cors(corsOptions);
