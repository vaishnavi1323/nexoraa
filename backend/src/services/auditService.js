const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Audit Logger Service
 * Records an immutable event in the audit trail.
 */
function recordAudit({ entityType, entityId, action, actorId, actorName, actorRole, details = {} }) {
  try {
    const id = uuidv4();
    const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_name, actor_role, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(id, entityType, entityId, action, actorId, actorName, actorRole, detailsStr);
    return id;
  } catch (err) {
    console.error('Audit log error:', err);
    return null;
  }
}

/**
 * Fetch complete audit trail for a specific entity or whole system
 */
function getAuditLogs({ entityType, entityId, limit = 50 }) {
  try {
    if (entityType && entityId) {
      const stmt = db.prepare(`
        SELECT * FROM audit_logs 
        WHERE entity_type = ? AND entity_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `);
      return stmt.all(entityType, entityId, limit);
    } else {
      const stmt = db.prepare(`
        SELECT * FROM audit_logs 
        ORDER BY timestamp DESC
        LIMIT ?
      `);
      return stmt.all(limit);
    }
  } catch (err) {
    console.error('Failed to retrieve audit logs:', err);
    return [];
  }
}

module.exports = {
  recordAudit,
  getAuditLogs
};
