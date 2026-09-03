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
      enum: ['ASSIGNMENT', 'CANCELLATION', 'STATUS_UPDATE', 'ALERT'],
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
        return ret;
      },
    },
  }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ targetRole: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
