// FleetHub – Delivery Model (Food Delivery Logistics)
import mongoose from 'mongoose';
import { DELIVERY_STATUSES } from '../utils/constants.js';

const deliveryTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: false }
);

const deliveryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    // ── Order Identification ────────────────
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    trackingId: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    // ── Client / Restaurant ─────────────────
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client (restaurant) is required'],
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },

    // ── Customer Details ────────────────────
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },

    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },

    // ── Pickup Location (Restaurant) ────────
    pickupLocation: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, default: null },
      instructions: { type: String, default: null },
    },

    // ── Delivery Location (Customer) ────────
    deliveryLocation: {
      address: { type: String, required: true },
      landmark: { type: String, default: null },
      city: { type: String, default: null },
      instructions: { type: String, default: null },
    },

    // ── Schedule & Estimates ────────────────
    estimatedDeliveryTime: {
      type: String,
      default: '30-40 mins',
    },

    scheduledTime: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    // ── Status ──────────────────────────────
    status: {
      type: String,
      enum: {
        values: [
          'PENDING', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
          ...Object.values(DELIVERY_STATUSES),
        ],
        message: '{VALUE} is not a valid delivery status',
      },
      default: DELIVERY_STATUSES.PENDING,
      set: (v) => (v ? v.toLowerCase() : v),
    },

    // ── Assignment ──────────────────────────
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },

    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    // ── Cancellation ────────────────────────
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    // ── Order Contents ──────────────────────
    items: [deliveryItemSchema],

    totalAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ['PREPAID', 'COD', 'UPI', 'CARD'],
      default: 'PREPAID',
    },

    // ── Timeline ────────────────────────────
    timeline: [deliveryTimelineSchema],

    // ── Audit & Metadata ────────────────────
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

// ════════════════════════════════════════
// Indexes
// ════════════════════════════════════════
deliverySchema.index({ client: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ assignedDriver: 1 });
deliverySchema.index({ assignedVehicle: 1 });
deliverySchema.index({ createdAt: -1 });
deliverySchema.index({ client: 1, status: 1 });

// Auto-exclude soft-deleted
deliverySchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
