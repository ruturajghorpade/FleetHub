// FleetHub – Driver Model
import mongoose from 'mongoose';
import { DRIVER_STATUSES, GENDERS, BLOOD_GROUPS, LICENSE_TYPES } from '../utils/constants.js';

const driverSchema = new mongoose.Schema(
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

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Identity ───────────────────────────
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, 'Employee ID must be at least 2 characters'],
      maxlength: [30, 'Employee ID must not exceed 30 characters'],
    },

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [100, 'First name must not exceed 100 characters'],
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name must be at least 1 character'],
      maxlength: [100, 'Last name must not exceed 100 characters'],
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

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: {
        values: Object.values(GENDERS),
        message: '{VALUE} is not a valid gender',
      },
      default: null,
    },

    // ── Address ────────────────────────────
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

    // ── License ────────────────────────────
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [5, 'License number must be at least 5 characters'],
      maxlength: [30, 'License number must not exceed 30 characters'],
    },

    licenseType: {
      type: String,
      enum: {
        values: Object.values(LICENSE_TYPES),
        message: '{VALUE} is not a valid license type',
      },
      default: null,
    },

    licenseIssueDate: {
      type: Date,
      default: null,
    },

    licenseExpiryDate: {
      type: Date,
      default: null,
    },

    licenseDocument: {
      type: String,
      default: null,
    },

    // ── KYC ────────────────────────────────
    aadhaarNumber: {
      type: String,
      trim: true,
      maxlength: [12, 'Aadhaar number must not exceed 12 characters'],
      default: null,
    },

    aadhaarDocument: {
      type: String,
      default: null,
    },

    // ── Employment ─────────────────────────
    joiningDate: {
      type: Date,
      default: null,
    },

    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },

    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
      default: null,
    },

    // ── Health & Emergency ─────────────────
    bloodGroup: {
      type: String,
      enum: {
        values: Object.values(BLOOD_GROUPS),
        message: '{VALUE} is not a valid blood group',
      },
      default: null,
    },

    emergencyContactName: {
      type: String,
      trim: true,
      maxlength: [100, 'Emergency contact name must not exceed 100 characters'],
      default: null,
    },

    emergencyContactNumber: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Assignment ─────────────────────────
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },

    // ── Status ─────────────────────────────
    status: {
      type: String,
      enum: {
        values: Object.values(DRIVER_STATUSES),
        message: '{VALUE} is not a valid driver status',
      },
      default: DRIVER_STATUSES.AVAILABLE,
    },

    availability: {
      type: String,
      enum: {
        values: ['AVAILABLE', 'BUSY', 'OFFLINE', 'available', 'busy', 'offline'],
        message: '{VALUE} is not a valid driver availability',
      },
      default: 'AVAILABLE',
      set: (v) => (v ? v.toUpperCase() : v),
    },

    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks must not exceed 1000 characters'],
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
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ════════════════════════════════════════
// Virtuals
// ════════════════════════════════════════
driverSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// ════════════════════════════════════════
// Indexes
// ════════════════════════════════════════
driverSchema.index({ employeeId: 1 }, { unique: true });
driverSchema.index({ licenseNumber: 1 }, { unique: true });
driverSchema.index({ client: 1 });
driverSchema.index({ branch: 1 });
driverSchema.index({ assignedVehicle: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ client: 1, branch: 1, status: 1 });

// ════════════════════════════════════════
// Query Middleware – Auto-exclude soft-deleted
// ════════════════════════════════════════
driverSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

driverSchema.pre('countDocuments', function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;
