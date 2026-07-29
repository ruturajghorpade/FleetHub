// FleetHub – MongoDB Connection
import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Establish a connection to MongoDB with recommended production settings.
 * Registers event listeners for runtime connection issues.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      // Connection-pool defaults (tuneable via env if needed later)
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database : ${conn.connection.name}`);

    // ── Runtime event listeners ────────────────
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Gracefully close the Mongoose connection (used during shutdown).
 */
export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
};

export default connectDB;
