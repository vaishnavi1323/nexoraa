const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { recordAudit } = require('../services/auditService');

const JWT_SECRET = process.env.JWT_SECRET || 'nexusequip-dev-secret-key-9988';

/**
 * GET /api/auth/users
 * Returns all seeded and user-created accounts
 */
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, role, institution, department, trust_score, credits, avatar, phone, bio, created_at 
      FROM users
      ORDER BY created_at ASC
    `).all();

    // Attach certification count to each user
    const certCountStmt = db.prepare("SELECT COUNT(*) as count FROM certifications WHERE user_id = ? AND status = 'verified'");
    const enriched = users.map(u => ({
      ...u,
      verifiedCertCount: certCountStmt.get(u.id).count
    }));

    res.json({ success: true, users: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/register (or /users)
 * Create your own custom profile manually
 */
router.post('/register', (req, res) => {
  try {
    const {
      name,
      email,
      role = 'researcher',
      institution = 'Community Innovation Lab',
      department = 'Applied Engineering',
      trust_score = 90,
      credits = 1000,
      avatar,
      phone = '+1 (555) 019-2831',
      bio = 'Passionate builder and researcher sharing specialized hardware.',
      password = 'password123'
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required to create a profile.' });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A profile with this email already exists.' });
    }

    const id = `usr_${uuidv4().slice(0, 8)}`;
    const passwordHash = bcrypt.hashSync(password, 8);
    const avatarUrl = avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`;

    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, institution, department, trust_score, credits, avatar, phone, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name,
      email,
      passwordHash,
      role,
      institution,
      department,
      Number(trust_score),
      Number(credits),
      avatarUrl,
      phone,
      bio
    );

    // Record in immutable audit log
    recordAudit({
      entityType: 'user',
      entityId: id,
      action: 'USER_PROFILE_CREATED',
      actorId: id,
      actorName: name,
      actorRole: role,
      details: { institution, department, role, credits }
    });

    const token = jwt.sign(
      { id, email, role, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const newUser = db.prepare('SELECT id, name, email, role, institution, department, trust_score, credits, avatar, phone, bio FROM users WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      message: 'Profile created successfully!',
      user: { ...newUser, verifiedCertCount: 0 },
      token
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/auth/users/:id
 * Manually edit all details of a user profile
 */
router.put('/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    const {
      name = user.name,
      role = user.role,
      institution = user.institution,
      department = user.department,
      phone = user.phone,
      bio = user.bio,
      avatar = user.avatar,
      credits = user.credits,
      trust_score = user.trust_score
    } = req.body;

    db.prepare(`
      UPDATE users
      SET name = ?, role = ?, institution = ?, department = ?, phone = ?, bio = ?, avatar = ?, credits = ?, trust_score = ?
      WHERE id = ?
    `).run(
      name,
      role,
      institution,
      department,
      phone,
      bio,
      avatar,
      Number(credits),
      Number(trust_score),
      userId
    );

    // Record in immutable audit log
    recordAudit({
      entityType: 'user',
      entityId: userId,
      action: 'USER_PROFILE_UPDATED',
      actorId: userId,
      actorName: name,
      actorRole: role,
      details: { institution, department, role, trust_score, credits }
    });

    const updated = db.prepare('SELECT id, name, email, role, institution, department, trust_score, credits, avatar, phone, bio FROM users WHERE id = ?').get(userId);
    res.json({ success: true, message: 'Profile updated successfully!', user: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid user email credentials' });
    }

    if (password && !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Invalid password credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = req.headers['x-user-id'] || (authHeader ? jwt.decode(authHeader.replace('Bearer ', ''))?.id : null);

    if (!userId) {
      const defaultUser = db.prepare('SELECT * FROM users WHERE id = "usr_researcher"').get();
      const { password_hash, ...safe } = defaultUser;
      const certs = db.prepare("SELECT * FROM certifications WHERE user_id = ? AND status = 'verified'").all(defaultUser.id);
      return res.json({ success: true, user: { ...safe, certifications: certs } });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { password_hash, ...safe } = user;
    const certs = db.prepare("SELECT * FROM certifications WHERE user_id = ?").all(userId);
    res.json({ success: true, user: { ...safe, certifications: certs } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
