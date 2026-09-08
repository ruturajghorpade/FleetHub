// FleetHub – Notification Model
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    targetRole: {
      type: String,
      enum: ['super_admin', 'client_admin', 'dispatcher', 'driver', 'all'],
      default: 'all',
    },

    type: {
      type: String,
      enum: [
        'DELIVERY_ASSIGNED',
        'DELIVERY_PICKED_UP',
        'DELIVERY_IN_TRANSIT',
        'DELIVERY_DELIVERED',
        'DELIVERY_CANCELLED',
        'MAINTENANCE_ALERT',
        'DRIVER_ASSIGNMENT',
        'SYSTEM_ALERT',
        'ASSIGNMENT',
        'CANCELLATION',
        'STATUS_UPDATE',
        'ALERT',
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null,
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

    relatedEntity: {
      type: String,
      enum: ['delivery', 'vehicle', 'driver', 'maintenance', 'system'],
      default: 'delivery',
    },

    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        ret.read = ret.isRead;
        return ret;
      },
    },
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ client: 1, targetRole: 1, createdAt: -1 });
notificationSchema.index({ targetRole: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
