// FleetHub – Branch Model
import mongoose from 'mongoose';
import { STATUSES } from '../utils/constants.js';

const branchSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
    },

    branchName: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      minlength: [2, 'Branch name must be at least 2 characters'],
      maxlength: [200, 'Branch name must not exceed 200 characters'],
    },

    branchCode: {
      type: String,
      required: [true, 'Branch code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, 'Branch code must be at least 2 characters'],
      maxlength: [20, 'Branch code must not exceed 20 characters'],
      match: [/^[A-Z0-9_-]+$/, 'Branch code may only contain letters, numbers, hyphens, and underscores'],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    address: {
      type: String,
      trim: true,
      default: null,
    },

    city: {
      type: String,
      trim: true,
      default: null,
    },

    state: {
      type: String,
      trim: true,
      default: null,
    },

    country: {
      type: String,
      trim: true,
      default: 'India',
    },

    postalCode: {
      type: String,
      trim: true,
      default: null,
    },

    latitude: {
      type: Number,
      default: null,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },

    longitude: {
      type: Number,
      default: null,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },

    operatingHours: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(STATUSES),
        message: '{VALUE} is not a valid status',
      },
      default: STATUSES.ACTIVE,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters'],
      default: null,
    },

    maxVehicles: {
      type: Number,
      default: 5,
      min: [1, 'Must allow at least 1 vehicle'],
    },

    maxDrivers: {
      type: Number,
      default: 5,
      min: [1, 'Must allow at least 1 driver'],
    },

    // ── Audit Fields ────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Soft Delete ─────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },

    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;
        return ret;
      },
    },
  }
);

// ════════════════════════════════════════
// Indexes
// ════════════════════════════════════════
branchSchema.index({ client: 1 });
branchSchema.index({ branchCode: 1 }, { unique: true });
branchSchema.index({ status: 1 });
branchSchema.index({ client: 1, status: 1 });

// ════════════════════════════════════════
// Query Middleware – Auto-exclude soft-deleted
// ════════════════════════════════════════
branchSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

branchSchema.pre('countDocuments', function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
