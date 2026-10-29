const express = require('express');
const router = express.Router();
const db = require('../db/database');

/**
 * GET /api/audit
 * Immutable audit logs queryable by entity, actor, or timeline
 */
router.get('/', (req, res) => {
  try {
    const { entityType, entityId, limit = 100 } = req.query;
    let query = `SELECT * FROM audit_logs WHERE 1=1`;
    const params = [];

    if (entityType) {
      query += ` AND entity_type = ?`;
      params.push(entityType);
    }
    if (entityId) {
      query += ` AND entity_id = ?`;
      params.push(entityId);
    }

    query += ` ORDER BY timestamp DESC LIMIT ?`;
    params.push(Number(limit));

    const rows = db.prepare(query).all(...params);

    const formatted = rows.map(r => ({
      ...r,
      details: JSON.parse(r.details || '{}')
    }));

    res.json({ success: true, count: formatted.length, auditLogs: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
