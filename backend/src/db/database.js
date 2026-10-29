const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'nexusequip.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'researcher', 'lab_manager', 'admin', 'community_member')),
      institution TEXT NOT NULL,
      department TEXT,
      trust_score INTEGER DEFAULT 85 CHECK(trust_score >= 0 AND trust_score <= 100),
      credits INTEGER DEFAULT 500,
      avatar TEXT,
      phone TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      issuing_body TEXT NOT NULL,
      issue_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      status TEXT DEFAULT 'verified' CHECK(status IN ('verified', 'pending', 'expired', 'rejected')),
      document_url TEXT,
      verification_notes TEXT,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('equipment', 'space', 'testing_rig', 'computing', 'fabrication')),
      type TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      institution TEXT NOT NULL,
      location TEXT NOT NULL,
      images TEXT DEFAULT '[]',
      specs TEXT DEFAULT '{}',
      hourly_rate REAL DEFAULT 0,
      deposit REAL DEFAULT 0,
      min_hours INTEGER DEFAULT 1,
      max_hours INTEGER DEFAULT 8,
      max_advance_days INTEGER DEFAULT 30,
      requires_supervision INTEGER DEFAULT 0,
      supervision_notes TEXT,
      required_certifications TEXT DEFAULT '[]',
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'maintenance', 'reserved', 'decommissioned')),
      current_condition TEXT DEFAULT 'good' CHECK(current_condition IN ('pristine', 'good', 'fair', 'needs_inspection')),
      condition_notes TEXT,
      tags TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_code TEXT UNIQUE NOT NULL,
      resource_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      purpose TEXT NOT NULL,
      project_title TEXT NOT NULL,
      supervisor_name TEXT,
      status TEXT DEFAULT 'pending_approval' CHECK(status IN (
        'pending_approval',
        'approved',
        'rejected',
        'waitlisted',
        'checked_in',
        'returned_pending_inspection',
        'completed',
        'cancelled',
        'incident_reported'
      )),
      rejection_reason TEXT,
      approval_notes TEXT,
      waitlist_position INTEGER,
      fairness_priority_score REAL DEFAULT 0,
      fairness_breakdown TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      booking_id TEXT UNIQUE NOT NULL,
      checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      checked_in_by TEXT NOT NULL,
      initial_condition_status TEXT NOT NULL CHECK(initial_condition_status IN ('pristine', 'good', 'fair', 'pre_existing_damage')),
      initial_notes TEXT,
      initial_photos TEXT DEFAULT '[]',
      checklist_answers TEXT DEFAULT '{}',
      pass_code TEXT,
      supervisor_signature TEXT,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY,
      booking_id TEXT UNIQUE NOT NULL,
      returned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      returned_by TEXT NOT NULL,
      final_condition_status TEXT NOT NULL CHECK(final_condition_status IN ('pristine', 'good', 'wear_detected', 'damaged')),
      final_notes TEXT,
      final_photos TEXT DEFAULT '[]',
      consumables_used TEXT DEFAULT '{}',
      cleanliness_rating INTEGER DEFAULT 5 CHECK(cleanliness_rating >= 1 AND cleanliness_rating <= 5),
      damage_detected INTEGER DEFAULT 0,
      damage_description TEXT,
      deposit_refund_status TEXT DEFAULT 'refunded' CHECK(deposit_refund_status IN ('refunded', 'partially_retained', 'held_for_review')),
      inspector_id TEXT,
      inspected_at DATETIME,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      reporter_id TEXT NOT NULL,
      incident_type TEXT NOT NULL CHECK(incident_type IN ('hardware_damage', 'late_return', 'safety_violation', 'missing_accessories', 'unclean_station')),
      severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'critical')),
      description TEXT NOT NULL,
      photo_urls TEXT DEFAULT '[]',
      estimated_cost REAL DEFAULT 0,
      ai_analysis_summary TEXT,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'investigating', 'resolved', 'escalated')),
      resolution_notes TEXT,
      resolved_by TEXT,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      details TEXT DEFAULT '{}',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
    CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_resource ON bookings(resource_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_time, end_time);
    CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
  `);
}

initSchema();

module.exports = db;
