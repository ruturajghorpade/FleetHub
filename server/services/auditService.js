// FleetHub – Audit Log Service
import AuditLog from '../models/AuditLog.js';

/**
 * Record an audit log entry (non-blocking).
 */
export const createAuditLog = async ({
  user,
  action,
  entity,
  entityId = null,
  description,
  details = {},
  client = null,
  branch = null,
  ipAddress = null,
}) => {
  try {
    const log = await AuditLog.create({
      user: user?._id || user || null,
      userName: user?.name || null,
      userRole: user?.role || null,
      action,
      entity,
      entityId,
      description,
      details,
      client: client || user?.client || null,
      branch: branch || user?.branch || null,
      ipAddress,
    });
    return log;
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
    return null;
  }
};

/**
 * Get recent audit logs for an entity
 */
export const getAuditLogsForEntity = async (entity, entityId, limit = 20) => {
  try {
    return await AuditLog.find({ entity, entityId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name role email');
  } catch (err) {
    console.error('[AuditLog] Failed to fetch audit logs:', err.message);
    return [];
  }
};

export default {
  createAuditLog,
  getAuditLogsForEntity,
};
