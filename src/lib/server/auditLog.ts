import { db } from '$lib/server/db';

/**
 * Creates an audit log entry in the database
 */
export async function createAuditLog(data: {
  userId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
}) {
  try {
    // Generate unique ID for the log entry
    const id = crypto.randomUUID();
    
    await db.$executeRaw`
      INSERT INTO "AuditLog" (
        id, timestamp, userId, action, entityType, entityId, details, ipAddress
      ) VALUES (
        ${id},
        datetime('now'),
        ${data.userId || null},
        ${data.action},
        ${data.entityType},
        ${data.entityId || null},
        ${data.details || null},
        ${data.ipAddress || null}
      )
    `;
    console.log(`Audit log created: ${data.action}`);
    return true;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return false;
  }
}
