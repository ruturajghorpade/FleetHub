// FleetHub – Server Entry Point
import app from './app.js';
import connectDB, { disconnectDB } from './config/db.js';
import { env } from './config/env.js';

// ════════════════════════════════════════
// Handle uncaught exceptions (sync throws)
// Must be registered before any other code executes.
// ════════════════════════════════════════
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// ════════════════════════════════════════
// Bootstrap: connect to DB → start server
// ════════════════════════════════════════
const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`\n⚡ FleetHub API Server`);
    console.log(`   Environment : ${env.NODE_ENV}`);
    console.log(`   Port        : ${env.PORT}`);
    console.log(`   URL         : http://localhost:${env.PORT}`);
    console.log(`   Health      : http://localhost:${env.PORT}/api/v1/health\n`);
  });

  // ── Unhandled promise rejections ───────────
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  });

  // ── Graceful shutdown (SIGTERM / SIGINT) ───
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      console.log('Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
