// FleetHub – Maintenance Model
import mongoose from 'mongoose';
import { MAINTENANCE_TYPES } from '../utils/constants.js';

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },

    maintenanceType: {
      type: String,
      default: 'routine',
      trim: true,
      lowercase: true,
    },

    title: {
      type: String,
      required: [true, 'Maintenance title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters'],
      default: null,
    },

    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      default: 0,
    },

    status: {
      type: String,
      enum: {
        values: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'scheduled', 'in_progress', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid maintenance status',
      },
      default: 'scheduled',
      set: (v) => (v ? v.toLowerCase() : v),
    },

    odometer: {
      type: Number,
      min: [0, 'Odometer reading cannot be negative'],
      default: 0,
    },

    serviceCenter: {
      type: String,
      trim: true,
      default: null,
    },

    serviceProvider: {
      type: String,
      trim: true,
      default: null,
    },

    performedBy: {
      type: String,
      trim: true,
      default: null,
    },

    maintenanceDate: {
      type: Date,
      default: Date.now,
    },

    scheduledDate: {
      type: Date,
      default: Date.now,
    },

    startedDate: {
      type: Date,
      default: null,
    },

    completedDate: {
      type: Date,
      default: null,
    },

    nextMaintenanceDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must not exceed 1000 characters'],
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Cancellation reason must not exceed 500 characters'],
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

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
        if (!ret.scheduledDate && ret.maintenanceDate) ret.scheduledDate = ret.maintenanceDate;
        if (!ret.serviceProvider && ret.serviceCenter) ret.serviceProvider = ret.serviceCenter;
        return ret;
      },
    },
  }
);

maintenanceSchema.index({ vehicle: 1 });
maintenanceSchema.index({ client: 1 });
maintenanceSchema.index({ branch: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ maintenanceDate: -1 });
maintenanceSchema.index({ scheduledDate: -1 });
maintenanceSchema.index({ client: 1, branch: 1, status: 1 });
maintenanceSchema.index({ vehicle: 1, status: 1 });

maintenanceSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

maintenanceSchema.pre('countDocuments', function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;
