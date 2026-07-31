// FleetHub – Environment Configuration
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Resolve .env relative to the server root regardless of cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '..', '.env') });

/**
 * Centralised, validated environment variables.
 * Freeze the object to prevent accidental mutation at runtime.
 */
export const env = Object.freeze({
  // ── Server ────────────────────────────
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,

  // ── MongoDB ───────────────────────────
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/fleethub',

  // ── JWT ────────────────────────────────
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7,

  // ── Email (placeholders – used in later phases) ─
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@fleethub.com',
  FROM_NAME: process.env.FROM_NAME || 'FleetHub',

  // ── Cloudinary (placeholders – used in later phases) ─
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // ── CORS ──────────────────────────────
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // ── Rate Limiting ─────────────────────
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  // ── Logging ───────────────────────────
  LOG_LEVEL: process.env.LOG_LEVEL || 'dev',
});
