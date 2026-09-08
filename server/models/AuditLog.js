// FleetHub – Audit Log Model (Security & Operational Traceability)
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    userName: {
      type: String,
      trim: true,
      default: null,
    },

    userRole: {
      type: String,
      trim: true,
      default: null,
    },

    action: {
      type: String,
      required: [true, 'Audit action is required'],
      trim: true,
    },

    entity: {
      type: String,
      required: [true, 'Entity type is required'],
      trim: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    description: {
      type: String,
      required: [true, 'Audit description is required'],
      trim: true,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

    ipAddress: {
      type: String,
      default: null,
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

auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ client: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
