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

    maintenanceType: {
      type: String,
      enum: {
        values: Object.values(MAINTENANCE_TYPES),
        message: '{VALUE} is not a valid maintenance type',
      },
      default: MAINTENANCE_TYPES.ROUTINE,
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

    performedBy: {
      type: String,
      trim: true,
      default: null,
    },

    maintenanceDate: {
      type: Date,
      default: Date.now,
    },

    completedDate: {
      type: Date,
      default: null,
    },

    nextMaintenanceDate: {
      type: Date,
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
        return ret;
      },
    },
  }
);

maintenanceSchema.index({ vehicle: 1 });
maintenanceSchema.index({ client: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ maintenanceDate: -1 });

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
