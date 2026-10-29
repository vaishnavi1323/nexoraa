const db = require('../db/database');

/**
 * Transparent Fair Allocation & Anti-Monopolization Engine
 * Provides mathematically explainable priority scoring for resource requests.
 */

// Weights and quotas
const WEEKLY_HOURLY_QUOTA_WARN = 10;
const WEEKLY_HOURLY_QUOTA_MAX = 20;

const PURPOSE_SCORES = {
  'Academic Thesis / Core Research': 40,
  'Coursework Laboratory': 30,
  'Student Innovation / Capstone': 25,
  'Exploratory Prototyping': 15,
  'Commercial / External Partner': 10
};

/**
 * Calculate rolling usage in the last 7 days for a user on this resource or category
 */
function getRecentUsageHours(userId, resourceId) {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // Find all completed or active bookings in past 7 days
    const stmt = db.prepare(`
      SELECT start_time, end_time FROM bookings
      WHERE user_id = ?
        AND resource_id = ?
        AND status IN ('approved', 'checked_in', 'completed')
        AND start_time >= ?
    `);
    
    const rows = stmt.all(userId, resourceId, oneWeekAgo);
    let totalHours = 0;
    
    for (const row of rows) {
      const start = new Date(row.start_time).getTime();
      const end = new Date(row.end_time).getTime();
      const durationHours = (end - start) / (1000 * 60 * 60);
      totalHours += Math.max(0, durationHours);
    }
    
    return parseFloat(totalHours.toFixed(1));
  } catch (err) {
    console.error('Error computing recent usage hours:', err);
    return 0;
  }
}

/**
 * Check if a time slot has a scheduling conflict with an existing booking
 */
function detectConflicts(resourceId, startTime, endTime, excludeBookingId = null) {
  try {
    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.resource_id = ?
        AND b.status IN ('approved', 'checked_in')
        AND NOT (b.end_time <= ? OR b.start_time >= ?)
    `;
    const params = [resourceId, startTime, endTime];

    if (excludeBookingId) {
      query += ` AND b.id != ?`;
      params.push(excludeBookingId);
    }

    const stmt = db.prepare(query);
    return stmt.all(...params);
  } catch (err) {
    console.error('Error detecting conflicts:', err);
    return [];
  }
}

/**
 * Compute transparent fair allocation score
 */
function calculateFairnessScore({ userId, resourceId, purpose, waitingHours = 0 }) {
  // 1. Fetch user data
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const trustScore = user ? user.trust_score : 80;

  // 2. Purpose points
  let purposePoints = 20;
  for (const [key, val] of Object.entries(PURPOSE_SCORES)) {
    if (purpose && purpose.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
      purposePoints = val;
      break;
    }
  }

  // 3. Trust points (max 20 points from 100% trust)
  const trustPoints = parseFloat(((trustScore / 100) * 20).toFixed(1));

  // 4. Starvation prevention / Waitlist bonus (+1.5 pts per hour waiting, capped at 30)
  const waitlistBonus = parseFloat(Math.min(30, waitingHours * 1.5).toFixed(1));

  // 5. Anti-monopolization penalty based on rolling 7-day usage
  const recentHours = getRecentUsageHours(userId, resourceId);
  let monopolizationPenalty = 0;

  if (recentHours > WEEKLY_HOURLY_QUOTA_MAX) {
    monopolizationPenalty = parseFloat(((recentHours - WEEKLY_HOURLY_QUOTA_MAX) * 8 + (WEEKLY_HOURLY_QUOTA_MAX - WEEKLY_HOURLY_QUOTA_WARN) * 4).toFixed(1));
  } else if (recentHours > WEEKLY_HOURLY_QUOTA_WARN) {
    monopolizationPenalty = parseFloat(((recentHours - WEEKLY_HOURLY_QUOTA_WARN) * 4).toFixed(1));
  }

  // Final composite score (scale 0 - 100)
  const rawScore = purposePoints + trustPoints + waitlistBonus - monopolizationPenalty;
  const totalScore = Math.max(5, Math.min(100, parseFloat(rawScore.toFixed(1))));

  // Transparent human-readable explanation
  const explanation = [
    `Purpose '${purpose || 'Standard'}': +${purposePoints} pts`,
    `Institutional Trust (${trustScore}%): +${trustPoints} pts`,
    waitingHours > 0 ? `Waitlist Starvation Protection: +${waitlistBonus} pts (${waitingHours}h queued)` : null,
    recentHours > WEEKLY_HOURLY_QUOTA_WARN ? `Monopolization Penalty: -${monopolizationPenalty} pts (${recentHours}h used in last 7 days)` : `Fair Usage Status: Clean (${recentHours}h used this week)`
  ].filter(Boolean).join(' | ');

  return {
    score: totalScore,
    breakdown: {
      purposePoints,
      trustPoints,
      waitlistBonus,
      monopolizationPenalty,
      recentHoursUsed: recentHours,
      quotaWarning: recentHours >= WEEKLY_HOURLY_QUOTA_WARN,
      quotaExceeded: recentHours >= WEEKLY_HOURLY_QUOTA_MAX
    },
    explanation
  };
}

/**
 * Re-order waitlist transparently based on fairness score
 */
function prioritizeWaitlist(resourceId) {
  try {
    const entries = db.prepare(`
      SELECT b.*, u.created_at as user_created_at
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.resource_id = ? AND b.status = 'waitlisted'
      ORDER BY b.created_at ASC
    `).all(resourceId);

    const now = Date.now();
    const scored = entries.map(entry => {
      const waitHours = Math.max(0, (now - new Date(entry.created_at).getTime()) / (1000 * 60 * 60));
      const fairCalc = calculateFairnessScore({
        userId: entry.user_id,
        resourceId: entry.resource_id,
        purpose: entry.purpose,
        waitingHours: waitHours
      });
      return {
        ...entry,
        fairness_priority_score: fairCalc.score,
        fairness_breakdown: JSON.stringify(fairCalc)
      };
    });

    // Sort descending by priority score
    scored.sort((a, b) => b.fairness_priority_score - a.fairness_priority_score);

    // Update positions in database
    const updateStmt = db.prepare(`
      UPDATE bookings 
      SET waitlist_position = ?, fairness_priority_score = ?, fairness_breakdown = ?
      WHERE id = ?
    `);

    const updateMany = db.transaction((list) => {
      list.forEach((item, index) => {
        updateStmt.run(index + 1, item.fairness_priority_score, item.fairness_breakdown, item.id);
      });
    });

    updateMany(scored);
    return scored;
  } catch (err) {
    console.error('Error prioritizing waitlist:', err);
    return [];
  }
}

module.exports = {
  calculateFairnessScore,
  detectConflicts,
  getRecentUsageHours,
  prioritizeWaitlist
};
