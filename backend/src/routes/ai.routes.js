const express = require('express');
const router = express.Router();
const db = require('../db/database');
const {
  matchResources,
  verifyCertificationDocument,
  analyzeConditionDiff,
  analyzeAllocationFairness
} = require('../../../ai/index');

/**
 * POST /api/ai/match
 * Natural language semantic search & capability matching
 */
router.post('/match', (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.headers['x-user-id'] || 'usr_researcher';

    const resources = db.prepare('SELECT * FROM resources').all();
    const userCerts = db.prepare("SELECT * FROM certifications WHERE user_id = ? AND status = 'verified'").all(userId);

    const matches = matchResources(query, resources, userCerts);

    res.json({
      success: true,
      query,
      resultsCount: matches.length,
      matches: matches.map(m => ({
        ...m,
        resource: {
          ...m.resource,
          images: JSON.parse(m.resource.images || '[]'),
          specs: JSON.parse(m.resource.specs || '{}'),
          required_certifications: JSON.parse(m.resource.required_certifications || '[]'),
          tags: JSON.parse(m.resource.tags || '[]')
        }
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/analyze-condition
 */
router.post('/analyze-condition', (req, res) => {
  try {
    const {
      initialCondition = 'good',
      initialNotes = '',
      finalCondition = 'good',
      finalNotes = '',
      checklistAnswers = {},
      cleanlinessRating = 5
    } = req.body;

    const analysis = analyzeConditionDiff({
      initialCondition,
      initialNotes,
      finalCondition,
      finalNotes,
      checklistAnswers,
      cleanlinessRating
    });

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/verify-cert
 */
router.post('/verify-cert', (req, res) => {
  try {
    const { title, issuingBody, issueDate, expiryDate, userRole, rawTextExtract } = req.body;
    const verification = verifyCertificationDocument({
      title,
      issuingBody,
      issueDate,
      expiryDate,
      userRole: userRole || 'researcher',
      rawTextExtract
    });

    res.json({ success: true, verification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai/fairness-report
 * System-wide equitable access & anti-monopolization audit
 */
router.get('/fairness-report', (req, res) => {
  try {
    const bookings = db.prepare('SELECT * FROM bookings').all();
    const resources = db.prepare('SELECT * FROM resources').all();
    const users = db.prepare('SELECT id, name, department, institution, trust_score FROM users').all();

    const report = analyzeAllocationFairness(bookings, resources, users);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
