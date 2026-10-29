const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { verifyCertificationDocument } = require('../../../ai/cert_verifier');
const { recordAudit } = require('../services/auditService');

/**
 * GET /api/certifications
 */
router.get('/', (req, res) => {
  try {
    const { userId } = req.query;
    let query = `
      SELECT c.*, u.name as user_name, u.email as user_email, u.institution as user_institution
      FROM certifications c
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ` AND c.user_id = ?`;
      params.push(userId);
    }

    query += ` ORDER BY c.issue_date DESC`;

    const certs = db.prepare(query).all(...params);
    res.json({ success: true, count: certs.length, certifications: certs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/certifications/upload
 * Upload/register certification with instant AI verification scan
 */
router.post('/upload', (req, res) => {
  try {
    const {
      title,
      issuing_body,
      issue_date,
      expiry_date,
      document_url = 'https://example.com/certs/sample-cert.pdf',
      raw_text_extract = ''
    } = req.body;

    const userId = req.headers['x-user-id'] || 'usr_student';
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Run AI Document Verifier
    const aiResult = verifyCertificationDocument({
      title,
      issuingBody: issuing_body,
      issueDate: issue_date,
      expiryDate: expiry_date,
      userRole: user.role,
      rawTextExtract: raw_text_extract
    });

    const certId = `cert_${uuidv4().slice(0, 8)}`;

    db.prepare(`
      INSERT INTO certifications (
        id, user_id, title, issuing_body, issue_date, expiry_date,
        status, document_url, verification_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      certId,
      userId,
      title,
      issuing_body,
      issue_date,
      expiry_date,
      aiResult.status,
      document_url,
      aiResult.aiAnalysisNote
    );

    // Record immutable audit log
    recordAudit({
      entityType: 'certification',
      entityId: certId,
      action: aiResult.status === 'verified' ? 'CERTIFICATE_AI_VERIFIED' : 'CERTIFICATE_SUBMITTED_PENDING',
      actorId: userId,
      actorName: user.name,
      actorRole: user.role,
      details: {
        title,
        issuing_body,
        aiConfidence: aiResult.confidenceScore,
        aiRecommendation: aiResult.recommendation
      }
    });

    res.status(201).json({
      success: true,
      message: aiResult.status === 'verified'
        ? 'Certification automatically verified by AI Safety Protocol.'
        : 'Certification submitted. Requires manual sign-off by Lab Safety Officer.',
      certificationId: certId,
      aiVerification: aiResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/certifications/:id/verify
 * Manual manager verification sign-off
 */
router.post('/:id/verify', (req, res) => {
  try {
    const cert = db.prepare('SELECT * FROM certifications WHERE id = ?').get(req.params.id);
    if (!cert) return res.status(404).json({ success: false, error: 'Certification not found' });

    const managerId = req.headers['x-user-id'] || 'usr_manager';
    const manager = db.prepare('SELECT * FROM users WHERE id = ?').get(managerId);

    const { status = 'verified', notes = 'Verified through department safety records.' } = req.body;

    db.prepare(`
      UPDATE certifications 
      SET status = ?, verification_notes = ?, verified_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, notes, cert.id);

    // Record immutable audit log
    recordAudit({
      entityType: 'certification',
      entityId: cert.id,
      action: 'CERTIFICATE_MANUAL_VERIFY',
      actorId: managerId,
      actorName: manager ? manager.name : 'Lab Manager',
      actorRole: manager ? manager.role : 'lab_manager',
      details: { status, notes, title: cert.title }
    });

    res.json({ success: true, message: `Certification status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
