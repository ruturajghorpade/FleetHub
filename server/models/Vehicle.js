// FleetHub – Vehicle Model
import mongoose from 'mongoose';
import { VEHICLE_TYPES, FUEL_TYPES, VEHICLE_STATUSES } from '../utils/constants.js';

const vehicleSchema = new mongoose.Schema(
  {
    // ── Relationships ──────────────────────
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
    },

    // ── Core Details ───────────────────────
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Vehicle number must be at least 3 characters'],
      maxlength: [20, 'Vehicle number must not exceed 20 characters'],
    },

    vehicleType: {
      type: String,
      enum: {
        values: [
          'BIKE', 'SCOOTER', 'EV_BIKE',
          'bike', 'scooter', 'ev_bike',
          ...Object.values(VEHICLE_TYPES),
        ],
        message: '{VALUE} is not a valid vehicle type',
      },
      default: 'BIKE',
    },

    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand must not exceed 100 characters'],
      default: null,
    },

    model: {
      type: String,
      trim: true,
      maxlength: [100, 'Model must not exceed 100 characters'],
      default: null,
    },

    manufacturingYear: {
      type: Number,
      min: [1900, 'Manufacturing year must be 1900 or later'],
      max: [2100, 'Manufacturing year must not exceed 2100'],
      default: null,
    },

    fuelType: {
      type: String,
      enum: {
        values: Object.values(FUEL_TYPES),
        message: '{VALUE} is not a valid fuel type',
      },
      default: null,
    },

    // ── Identification ─────────────────────
    engineNumber: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [50, 'Engine number must not exceed 50 characters'],
    },

    chassisNumber: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [50, 'Chassis number must not exceed 50 characters'],
    },

    // ── Operational ────────────────────────
    capacity: {
      type: String,
      trim: true,
      maxlength: [50, 'Capacity must not exceed 50 characters'],
      default: null,
    },

    odometer: {
      type: Number,
      min: [0, 'Odometer reading cannot be negative'],
      default: 0,
    },

    // ── Insurance & Compliance ─────────────
    insuranceNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Insurance number must not exceed 100 characters'],
      default: null,
    },

    insuranceExpiry: {
      type: Date,
      default: null,
    },

    fitnessExpiry: {
      type: Date,
      default: null,
    },

    pollutionExpiry: {
      type: Date,
      default: null,
    },

    permitExpiry: {
      type: Date,
      default: null,
    },

    // ── Purchase & Registration ────────────
    registrationDate: {
      type: Date,
      default: null,
    },

    purchaseDate: {
      type: Date,
      default: null,
    },

    purchasePrice: {
      type: Number,
      min: [0, 'Purchase price cannot be negative'],
      default: null,
    },

    // ── Status ─────────────────────────────
    status: {
      type: String,
      enum: {
        values: Object.values(VEHICLE_STATUSES),
        message: '{VALUE} is not a valid vehicle status',
      },
      default: VEHICLE_STATUSES.AVAILABLE,
    },

    availability: {
      type: String,
      enum: {
        values: ['AVAILABLE', 'ON_DELIVERY', 'MAINTENANCE', 'available', 'on_delivery', 'maintenance'],
        message: '{VALUE} is not a valid vehicle availability',
      },
      default: 'AVAILABLE',
      set: (v) => (v ? v.toUpperCase() : v),
    },

    // ── Assignment ─────────────────────────
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters'],
      default: null,
    },

    // ── Audit Fields ───────────────────────
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

    // ── Soft Delete ────────────────────────
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
vehicleSchema.index({ vehicleNumber: 1 }, { unique: true });
vehicleSchema.index({ client: 1 });
vehicleSchema.index({ branch: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ assignedDriver: 1 });
vehicleSchema.index({ client: 1, branch: 1, status: 1 });
vehicleSchema.index({ engineNumber: 1 }, { unique: true, sparse: true });
vehicleSchema.index({ chassisNumber: 1 }, { unique: true, sparse: true });

// ════════════════════════════════════════
// Query Middleware – Auto-exclude soft-deleted
// ════════════════════════════════════════
vehicleSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

vehicleSchema.pre('countDocuments', function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
