// FleetHub – Logger Configuration (Morgan)
import morgan from 'morgan';
import { env } from './env.js';

/**
 * Register custom Morgan tokens for richer dev output.
 */

// Coloured status code
morgan.token('statusColor', (_req, res) => {
  const status = res.statusCode;
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // Red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // Yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // Cyan
  return `\x1b[32m${status}\x1b[0m`; // Green
});

// Pretty timestamp
morgan.token('timestamp', () => new Date().toISOString());

// ── Formats ──────────────────────────────────
const devFormat =
  ':timestamp  :method :url :statusColor :response-time ms - :res[content-length]';

/**
 * Export the configured middleware.
 * Dev  → coloured, human-readable single-line output.
 * Prod → Apache-style 'combined' log (suitable for log aggregators).
 */
export const logger = env.NODE_ENV === 'development'
  ? morgan(devFormat)
  : morgan('combined');
