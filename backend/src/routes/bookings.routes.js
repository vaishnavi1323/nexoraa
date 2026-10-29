const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { calculateFairnessScore, detectConflicts, prioritizeWaitlist } = require('../services/fairAllocationService');
const { recordAudit } = require('../services/auditService');
const { analyzeConditionDiff } = require('../../../ai/condition_analyzer');

router.get('/', (req, res) => {
  try {
    const { userId, resourceId, status } = req.query;
    let query = `
      SELECT b.*, 
             r.title as resource_title, r.category as resource_category, r.type as resource_type, 
             r.location as resource_location, r.deposit as resource_deposit,
             u.name as user_name, u.email as user_email, u.institution as user_institution,
             u.trust_score as user_trust_score,
             c.initial_condition_status, c.checked_in_at,
             ret.final_condition_status, ret.returned_at, ret.damage_detected
      FROM bookings b
      JOIN resources r ON b.resource_id = r.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN checkins c ON b.id = c.booking_id
      LEFT JOIN returns ret ON b.id = ret.booking_id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ` AND b.user_id = ?`;
      params.push(userId);
    }
    if (resourceId) {
      query += ` AND b.resource_id = ?`;
      params.push(resourceId);
    }
    if (status && status !== 'all') {
      query += ` AND b.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC`;

    const bookings = db.prepare(query).all(...params);

    const formatted = bookings.map(b => ({
      ...b,
      fairness_breakdown: JSON.parse(b.fairness_breakdown || '{}')
    }));

    res.json({ success: true, count: formatted.length, bookings: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const booking = db.prepare(`
      SELECT b.*, 
             r.title as resource_title, r.category as resource_category, r.type as resource_type,
             r.location as resource_location, r.specs as resource_specs, r.required_certifications,
             r.deposit as resource_deposit, r.hourly_rate as resource_hourly_rate,
             u.name as user_name, u.email as user_email, u.institution as user_institution,
             u.trust_score as user_trust_score, u.role as user_role
      FROM bookings b
      JOIN resources r ON b.resource_id = r.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `).get(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const checkin = db.prepare('SELECT * FROM checkins WHERE booking_id = ?').get(booking.id);
    const returnRecord = db.prepare('SELECT * FROM returns WHERE booking_id = ?').get(booking.id);
    const incident = db.prepare('SELECT * FROM incidents WHERE booking_id = ?').get(booking.id);
    const auditLogs = db.prepare('SELECT * FROM audit_logs WHERE entity_id = ? ORDER BY timestamp DESC').all(booking.id);

    res.json({
      success: true,
      booking: {
        ...booking,
        resource_specs: JSON.parse(booking.resource_specs || '{}'),
        required_certifications: JSON.parse(booking.required_certifications || '[]'),
        fairness_breakdown: JSON.parse(booking.fairness_breakdown || '{}'),
        checkin: checkin ? {
          ...checkin,
          initial_photos: JSON.parse(checkin.initial_photos || '[]'),
          checklist_answers: JSON.parse(checkin.checklist_answers || '{}')
        } : null,
        returnRecord: returnRecord ? {
          ...returnRecord,
          final_photos: JSON.parse(returnRecord.final_photos || '[]'),
          consumables_used: JSON.parse(returnRecord.consumables_used || '{}')
        } : null,
        incident: incident ? {
          ...incident,
          photo_urls: JSON.parse(incident.photo_urls || '[]')
        } : null,
        auditLogs: auditLogs.map(a => ({ ...a, details: JSON.parse(a.details || '{}') }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const {
      resource_id,
      user_id,
      start_time,
      end_time,
      purpose,
      project_title,
      supervisor_name
    } = req.body;

    const actorId = user_id || req.headers['x-user-id'] || 'usr_researcher';
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(actorId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(resource_id);
    if (!resource) return res.status(404).json({ success: false, error: 'Resource not found' });

    const requiredCerts = JSON.parse(resource.required_certifications || '[]');
    const userCerts = db.prepare("SELECT * FROM certifications WHERE user_id = ? AND status = 'verified'").all(actorId);
    const userCertTitles = userCerts.map(c => c.title.toLowerCase());

    const missingCerts = requiredCerts.filter(reqCert => 
      !userCertTitles.some(t => t.includes(reqCert.toLowerCase()) || reqCert.toLowerCase().includes(t))
    );

    if (missingCerts.length > 0) {
      return res.status(403).json({
        success: false,
        error: `Ineligible: Missing mandatory safety certifications: ${missingCerts.join(', ')}`,
        missingCertifications: missingCerts
      });
    }

    const fairness = calculateFairnessScore({
      userId: actorId,
      resourceId: resource_id,
      purpose: purpose || 'Academic Thesis / Core Research'
    });

    const conflicts = detectConflicts(resource_id, start_time, end_time);
    const isConflicted = conflicts.length > 0;

    const bookingId = `bk_${uuidv4().slice(0, 8)}`;
    const bookingCode = `NX-${Math.floor(1000 + Math.random() * 9000)}`;

    let status = isConflicted ? 'waitlisted' : 'pending_approval';
    let waitlistPosition = null;

    if (isConflicted) {
      const waitlistCount = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE resource_id = ? AND status = 'waitlisted'").get(resource_id);
      waitlistPosition = (waitlistCount ? waitlistCount.c : 0) + 1;
    }

    const insertStmt = db.prepare(`
      INSERT INTO bookings (
        id, booking_code, resource_id, user_id, start_time, end_time,
        purpose, project_title, supervisor_name, status, waitlist_position,
        fairness_priority_score, fairness_breakdown
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      bookingId,
      bookingCode,
      resource_id,
      actorId,
      start_time,
      end_time,
      purpose || 'Academic Thesis / Core Research',
      project_title || 'Institutional Research Project',
      supervisor_name || 'Department Safety Coordinator',
      status,
      waitlistPosition,
      fairness.score,
      JSON.stringify(fairness)
    );

    recordAudit({
      entityType: 'booking',
      entityId: bookingId,
      action: isConflicted ? 'REQUEST_WAITLISTED_DUE_TO_CONFLICT' : 'REQUEST_SUBMITTED',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      details: {
        bookingCode,
        resourceTitle: resource.title,
        fairnessScore: fairness.score,
        fairnessExplanation: fairness.explanation,
        hasConflict: isConflicted,
        waitlistPosition
      }
    });

    const notifyStmt = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    notifyStmt.run(
      uuidv4(),
      resource.owner_id,
      `New Request for ${resource.title}`,
      `${user.name} submitted request for ${new Date(start_time).toLocaleDateString()} (Fairness Score: ${fairness.score}).`,
      'request',
      '/lab-management'
    );

    res.status(201).json({
      success: true,
      message: isConflicted 
        ? `Time conflict detected. You have been placed on the transparent waitlist at position #${waitlistPosition}.` 
        : 'Booking request submitted successfully for lab manager review.',
      booking: {
        id: bookingId,
        bookingCode,
        status,
        waitlistPosition,
        fairnessScore: fairness.score,
        fairnessExplanation: fairness.explanation,
        fairnessBreakdown: fairness.breakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/approve', (req, res) => {
  try {
    const booking = db.prepare('SELECT b.*, r.title as resource_title, r.owner_id FROM bookings b JOIN resources r ON b.resource_id = r.id WHERE b.id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const managerId = req.body.managerId || req.headers['x-user-id'] || 'usr_manager';
    const manager = db.prepare('SELECT * FROM users WHERE id = ?').get(managerId);
    const { approval_notes = 'Approved for operation following standard safety protocol.' } = req.body;

    db.prepare(`
      UPDATE bookings 
      SET status = 'approved', approval_notes = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(approval_notes, booking.id);

    recordAudit({
      entityType: 'booking',
      entityId: booking.id,
      action: 'REQUEST_APPROVED',
      actorId: manager ? manager.id : 'usr_manager',
      actorName: manager ? manager.name : 'Lab Manager',
      actorRole: manager ? manager.role : 'lab_manager',
      details: { approval_notes, bookingCode: booking.booking_code, resourceTitle: booking.resource_title }
    });

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      booking.user_id,
      `Booking Confirmed: ${booking.resource_title}`,
      `Your request for ${booking.resource_title} is APPROVED. Access pass generated. Complete Step 7 check-in upon arrival.`,
      'approval',
      '/bookings'
    );

    res.json({ success: true, message: 'Booking approved successfully', bookingId: booking.id, status: 'approved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/reject', (req, res) => {
  try {
    const booking = db.prepare('SELECT b.*, r.title as resource_title FROM bookings b JOIN resources r ON b.resource_id = r.id WHERE b.id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const managerId = req.body.managerId || req.headers['x-user-id'] || 'usr_manager';
    const manager = db.prepare('SELECT * FROM users WHERE id = ?').get(managerId);
    const { rejection_reason = 'Scheduling priority allocated to curriculum lab coursework.' } = req.body;

    db.prepare(`
      UPDATE bookings 
      SET status = 'rejected', rejection_reason = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(rejection_reason, booking.id);

    recordAudit({
      entityType: 'booking',
      entityId: booking.id,
      action: 'REQUEST_REJECTED',
      actorId: manager ? manager.id : 'usr_manager',
      actorName: manager ? manager.name : 'Lab Manager',
      actorRole: manager ? manager.role : 'lab_manager',
      details: { rejection_reason, bookingCode: booking.booking_code, resourceTitle: booking.resource_title }
    });

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      booking.user_id,
      `Booking Update: Request Declined`,
      `Your request for ${booking.resource_title} was not approved. Reason: ${rejection_reason}`,
      'rejection',
      '/bookings'
    );

    res.json({ success: true, message: 'Booking rejected with documented reason', bookingId: booking.id, status: 'rejected' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/checkin', (req, res) => {
  try {
    const booking = db.prepare('SELECT b.*, r.title as resource_title FROM bookings b JOIN resources r ON b.resource_id = r.id WHERE b.id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    if (booking.status !== 'approved') {
      return res.status(400).json({ success: false, error: `Cannot check in a booking with status '${booking.status}'. Must be 'approved'.` });
    }

    const {
      initial_condition_status = 'good',
      initial_notes = 'Equipment station inspected. Emergency stops operational, workspace clean.',
      initial_photos = [],
      checklist_answers = {},
      supervisor_signature = null
    } = req.body;

    const checkinId = `chk_${uuidv4().slice(0, 8)}`;
    const passCode = `NX-PASS-${Math.floor(1000 + Math.random() * 9000)}`;

    const insertCheckin = db.prepare(`
      INSERT INTO checkins (
        id, booking_id, checked_in_by, initial_condition_status, initial_notes,
        initial_photos, checklist_answers, pass_code, supervisor_signature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCheckin.run(
      checkinId,
      booking.id,
      booking.user_id,
      initial_condition_status,
      initial_notes,
      JSON.stringify(initial_photos),
      JSON.stringify(checklist_answers),
      passCode,
      supervisor_signature || 'Digital Self-Verification Certified'
    );

    db.prepare("UPDATE bookings SET status = 'checked_in', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(booking.id);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(booking.user_id);
    recordAudit({
      entityType: 'booking',
      entityId: booking.id,
      action: 'STEP7_CHECKIN_COMPLETED',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      details: {
        bookingCode: booking.booking_code,
        initialCondition: initial_condition_status,
        passCode,
        initialNotes: initial_notes
      }
    });

    res.json({
      success: true,
      message: 'Check-in completed successfully. Digital access pass active.',
      checkin: {
        id: checkinId,
        passCode,
        status: 'checked_in',
        initialCondition: initial_condition_status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/return', (req, res) => {
  try {
    const booking = db.prepare('SELECT b.*, r.title as resource_title, r.owner_id, r.deposit FROM bookings b JOIN resources r ON b.resource_id = r.id WHERE b.id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    if (booking.status !== 'checked_in') {
      return res.status(400).json({ success: false, error: `Cannot return a booking with status '${booking.status}'. Must be 'checked_in'.` });
    }

    const {
      final_condition_status = 'good',
      final_notes = 'Job completed cleanly, tools returned to toolholder, chips swept.',
      final_photos = [],
      consumables_used = {},
      cleanliness_rating = 5,
      inspector_id = null
    } = req.body;

    const returnId = `ret_${uuidv4().slice(0, 8)}`;

    const checkin = db.prepare('SELECT * FROM checkins WHERE booking_id = ?').get(booking.id);
    const initialCondition = checkin ? checkin.initial_condition_status : 'good';
    const initialNotes = checkin ? checkin.initial_notes : '';

    const aiAnalysis = analyzeConditionDiff({
      initialCondition,
      initialNotes,
      finalCondition: final_condition_status,
      finalNotes: final_notes,
      checklistAnswers: consumables_used,
      cleanlinessRating: Number(cleanliness_rating)
    });

    const isDamageDetected = aiAnalysis.requiresIncidentReport || final_condition_status === 'damaged';
    const depositStatus = aiAnalysis.recommendedDepositAction;
    const nextBookingStatus = isDamageDetected ? 'incident_reported' : 'completed';

    const insertReturn = db.prepare(`
      INSERT INTO returns (
        id, booking_id, returned_by, final_condition_status, final_notes,
        final_photos, consumables_used, cleanliness_rating, damage_detected,
        damage_description, deposit_refund_status, inspector_id, inspected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    insertReturn.run(
      returnId,
      booking.id,
      booking.user_id,
      final_condition_status,
      final_notes,
      JSON.stringify(final_photos),
      JSON.stringify(consumables_used),
      Number(cleanliness_rating),
      isDamageDetected ? 1 : 0,
      isDamageDetected ? (aiAnalysis.findings.join('; ')) : null,
      depositStatus,
      inspector_id || booking.owner_id
    );

    let incidentId = null;
    if (isDamageDetected) {
      incidentId = `inc_${uuidv4().slice(0, 8)}`;
      db.prepare(`
        INSERT INTO incidents (
          id, booking_id, resource_id, reporter_id, incident_type,
          severity, description, photo_urls, estimated_cost, ai_analysis_summary, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'investigating')
      `).run(
        incidentId,
        booking.id,
        booking.resource_id,
        booking.owner_id,
        aiAnalysis.suggestedIncidentType || 'hardware_damage',
        aiAnalysis.damageSeverity === 'critical' ? 'critical' : 'medium',
        `Discrepancy detected upon return of ${booking.resource_title}. ${final_notes}`,
        JSON.stringify(final_photos),
        aiAnalysis.estimatedCost,
        aiAnalysis.executiveSummary
      );

      recordAudit({
        entityType: 'incident',
        entityId: incidentId,
        action: 'STEP9_DAMAGE_INCIDENT_FLAGGED',
        actorId: 'ai_engine',
        actorName: 'Nexora AI Safety Guard',
        actorRole: 'automated_system',
        details: {
          bookingCode: booking.booking_code,
          aiSeverity: aiAnalysis.damageSeverity,
          estimatedCost: aiAnalysis.estimatedCost,
          findings: aiAnalysis.findings
        }
      });
    }

    db.prepare('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(nextBookingStatus, booking.id);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(booking.user_id);
    recordAudit({
      entityType: 'booking',
      entityId: booking.id,
      action: isDamageDetected ? 'STEP8_RETURNED_WITH_DAMAGE' : 'STEP8_RETURN_COMPLETED',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      details: {
        bookingCode: booking.booking_code,
        finalCondition: final_condition_status,
        cleanlinessRating: cleanliness_rating,
        depositStatus,
        aiSummary: aiAnalysis.executiveSummary
      }
    });

    prioritizeWaitlist(booking.resource_id);

    res.json({
      success: true,
      message: isDamageDetected 
        ? 'Resource returned with damage or cleanliness flag. Incident report opened for human review.' 
        : 'Resource returned successfully. Security deposit refund triggered.',
      bookingStatus: nextBookingStatus,
      depositRefundStatus: depositStatus,
      aiConditionAnalysis: aiAnalysis
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
