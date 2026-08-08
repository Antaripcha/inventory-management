import { AuditLog } from "../models/index.js";
import { logger } from "../utils/logger.js";

/** Fire-and-forget audit trail entry. Never throws to the caller. */
export async function recordAudit({ user, action, entity, entityId = null, description = "", metadata = {}, ip = "" }) {
  try {
    await AuditLog.create({ user, action, entity, entityId, description, metadata, ip });
  } catch (err) {
    logger.warn(`Failed to write audit log: ${err.message}`);
  }
}
