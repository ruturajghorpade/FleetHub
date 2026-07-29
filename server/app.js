// FleetHub – Express Application Setup
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { corsMiddleware } from './config/cors.js';
import { logger } from './config/logger.js';
import { rateLimiter } from './config/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import routes from './routes/index.js';

const app = express();

// ════════════════════════════════════════
// Security Middleware
// ════════════════════════════════════════
app.use(helmet());                  // Secure HTTP headers
app.use(corsMiddleware);            // Cross-Origin Resource Sharing
app.use(mongoSanitize());          // Prevent NoSQL injection

// ════════════════════════════════════════
// Rate Limiting
// ════════════════════════════════════════
app.use('/api', rateLimiter);

// ════════════════════════════════════════
// Body Parsers & Cookies
// ════════════════════════════════════════
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ════════════════════════════════════════
// Response Compression
// ════════════════════════════════════════
app.use(compression());

// ════════════════════════════════════════
// HTTP Request Logging (Morgan)
// ════════════════════════════════════════
app.use(logger);

// ════════════════════════════════════════
// Static Files (uploads)
// ════════════════════════════════════════
app.use('/uploads', express.static('uploads'));

// ════════════════════════════════════════
// API Routes – v1
// ════════════════════════════════════════
app.use('/api/v1', routes);

// ════════════════════════════════════════
// Error Handling (must be last)
// ════════════════════════════════════════
app.use(notFound);
app.use(errorHandler);

export default app;
