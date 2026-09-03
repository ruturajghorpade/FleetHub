// FleetHub – Client Model
import mongoose from 'mongoose';
import { STATUSES } from '../utils/constants.js';

const clientSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [200, 'Company name must not exceed 200 characters'],
    },

    companyCode: {
      type: String,
      required: [true, 'Company code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, 'Company code must be at least 2 characters'],
      maxlength: [20, 'Company code must not exceed 20 characters'],
      match: [/^[A-Z0-9_-]+$/, 'Company code may only contain letters, numbers, hyphens, and underscores'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
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

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
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

    logo: {
      type: String,
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

    businessType: {
      type: String,
      enum: {
        values: ['RESTAURANT', 'CAFE', 'FAST_FOOD', 'BAKERY', 'restaurant', 'cafe', 'fast_food', 'bakery'],
        message: '{VALUE} is not a valid business type',
      },
      default: 'RESTAURANT',
      set: (v) => (v ? v.toUpperCase() : v),
    },

    // ── Subscription Details ────────────────
    subscriptionPlan: {
      type: String,
      enum: {
        values: ['free', 'starter', 'professional', 'enterprise'],
        message: '{VALUE} is not a valid subscription plan',
      },
      default: 'free',
    },

    subscriptionStartDate: {
      type: Date,
      default: null,
    },

    subscriptionEndDate: {
      type: Date,
      default: null,
    },

    // ── Usage Limits ────────────────────────
    maxBranches: {
      type: Number,
      default: 1,
      min: [1, 'Must allow at least 1 branch'],
    },

    maxVehicles: {
      type: Number,
      default: 5,
      min: [1, 'Must allow at least 1 vehicle'],
    },

    maxUsers: {
      type: Number,
      default: 5,
      min: [1, 'Must allow at least 1 user'],
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
      select: false, // Hidden from normal queries
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
clientSchema.index({ companyCode: 1 }, { unique: true });
clientSchema.index({ email: 1 }, { unique: true });
clientSchema.index({ status: 1 });
clientSchema.index({ companyName: 'text' });

// ════════════════════════════════════════
// Query Middleware – Auto-exclude soft-deleted
// ════════════════════════════════════════
clientSchema.pre(/^find/, function (next) {
  // Allow explicitly querying deleted records via { isDeleted: true }
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

clientSchema.pre('countDocuments', function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
