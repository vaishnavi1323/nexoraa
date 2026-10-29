const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { recordAudit } = require('../services/auditService');

/**
 * GET /api/incidents
 */
router.get('/', (req, res) => {
  try {
    const { status, resourceId } = req.query;
    let query = `
      SELECT i.*, 
             r.title as resource_title, r.category as resource_category,
             u.name as reporter_name, u.role as reporter_role,
             b.booking_code,
             bu.name as booked_by_name, bu.email as booked_by_email
      FROM incidents i
      JOIN resources r ON i.resource_id = r.id
      JOIN users u ON i.reporter_id = u.id
      JOIN bookings b ON i.booking_id = b.id
      JOIN users bu ON b.user_id = bu.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND i.status = ?`;
      params.push(status);
    }
    if (resourceId) {
      query += ` AND i.resource_id = ?`;
      params.push(resourceId);
    }

    query += ` ORDER BY i.created_at DESC`;

    const rows = db.prepare(query).all(...params);

    const formatted = rows.map(r => ({
      ...r,
      photo_urls: JSON.parse(r.photo_urls || '[]')
    }));

    res.json({ success: true, count: formatted.length, incidents: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/incidents (Step 9 in Lifecycle)
 * Manually report an incident or damage
 */
router.post('/', (req, res) => {
  try {
    const {
      booking_id,
      resource_id,
      incident_type,
      severity = 'medium',
      description,
      photo_urls = [],
      estimated_cost = 0
    } = req.body;

    const reporterId = req.headers['x-user-id'] || 'usr_manager';
    const reporter = db.prepare('SELECT * FROM users WHERE id = ?').get(reporterId);
    const id = `inc_${uuidv4().slice(0, 8)}`;

    db.prepare(`
      INSERT INTO incidents (
        id, booking_id, resource_id, reporter_id, incident_type,
        severity, description, photo_urls, estimated_cost, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `).run(
      id,
      booking_id,
      resource_id,
      reporterId,
      incident_type || 'hardware_damage',
      severity,
      description,
      JSON.stringify(photo_urls),
      Number(estimated_cost)
    );

    // Update booking status
    db.prepare("UPDATE bookings SET status = 'incident_reported' WHERE id = ?").run(booking_id);

    // Record immutable audit log
    recordAudit({
      entityType: 'incident',
      entityId: id,
      action: 'STEP9_INCIDENT_REPORTED',
      actorId: reporterId,
      actorName: reporter ? reporter.name : 'Reporter',
      actorRole: reporter ? reporter.role : 'user',
      details: { incident_type, severity, description, estimated_cost }
    });

    res.status(201).json({ success: true, message: 'Incident reported successfully', incidentId: id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/incidents/:id/resolve
 * Lab manager / Safety officer resolves the dispute
 */
router.post('/:id/resolve', (req, res) => {
  try {
    const { resolution_notes = 'Issue addressed, machine recalibrated, deposit penalty waived.', deposit_action = 'refunded' } = req.body;
    const resolverId = req.headers['x-user-id'] || 'usr_manager';
    const resolver = db.prepare('SELECT * FROM users WHERE id = ?').get(resolverId);

    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
    if (!incident) return res.status(404).json({ success: false, error: 'Incident not found' });

    db.prepare(`
      UPDATE incidents
      SET status = 'resolved', resolution_notes = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(resolution_notes, resolver ? resolver.name : 'Lab Manager', incident.id);

    // Update booking return record if present
    db.prepare(`
      UPDATE returns SET deposit_refund_status = ? WHERE booking_id = ?
    `).run(deposit_action, incident.booking_id);

    // Update booking status to completed
    db.prepare(`
      UPDATE bookings SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(incident.booking_id);

    // Record immutable audit log
    recordAudit({
      entityType: 'incident',
      entityId: incident.id,
      action: 'INCIDENT_RESOLVED',
      actorId: resolverId,
      actorName: resolver ? resolver.name : 'Safety Officer',
      actorRole: resolver ? resolver.role : 'lab_manager',
      details: { resolution_notes, deposit_action, bookingId: incident.booking_id }
    });

    res.json({ success: true, message: 'Incident marked as resolved. Booking closed.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
