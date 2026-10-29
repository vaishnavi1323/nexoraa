/**
 * Nexora AI Condition & Damage Vision Analyzer
 * Compares pre-booking check-in records against post-use return records.
 * Identifies wear & tear vs negligence, calculates damage severity,
 * and drafts structured incident reports for human safety officers.
 */

const SEVERITY_TRIGGERS = {
  critical: [
    'crack', 'shattered', 'broken spindle', 'overheat', 'burnt', 'fire', 
    'collision', 'head crash', 'laser tube puncture', 'lens fracture', 'motor stall'
  ],
  medium: [
    'deep scratch', 'stripped screw', 'misaligned', 'wobble', 'dent', 
    'missing cable', 'missing lens', 'coolant leak', 'alarm triggered'
  ],
  low: [
    'scuff', 'minor scratch', 'dirty lens', 'dust', 'debris', 
    'fingerprints', 'resin residue', 'filament tangle', 'tape residue'
  ]
};

/**
 * Compare check-in and return state to detect discrepancies and damage
 */
function analyzeConditionDiff({
  initialCondition,
  initialNotes = '',
  finalCondition,
  finalNotes = '',
  checklistAnswers = {},
  cleanlinessRating = 5,
  consumablesReported = {}
}) {
  const combinedFinalText = `${finalNotes} ${JSON.stringify(checklistAnswers)}`.toLowerCase();
  const initialText = `${initialNotes}`.toLowerCase();

  const detectedCritical = SEVERITY_TRIGGERS.critical.filter(t => combinedFinalText.includes(t) && !initialText.includes(t));
  const detectedMedium = SEVERITY_TRIGGERS.medium.filter(t => combinedFinalText.includes(t) && !initialText.includes(t));
  const detectedLow = SEVERITY_TRIGGERS.low.filter(t => combinedFinalText.includes(t) && !initialText.includes(t));

  let damageSeverity = 'none';
  let estimatedCost = 0;
  let depositAction = 'refunded';
  let requiresIncidentReport = false;
  let incidentType = null;
  const findings = [];

  // Evaluate degradation
  const conditionRank = { pristine: 4, good: 3, fair: 2, needs_inspection: 1, wear_detected: 2, damaged: 0, pre_existing_damage: 2 };
  const initialRank = conditionRank[initialCondition] || 3;
  const finalRank = conditionRank[finalCondition] || 3;

  if (detectedCritical.length > 0 || finalCondition === 'damaged') {
    damageSeverity = 'critical';
    estimatedCost = 850;
    depositAction = 'held_for_review';
    requiresIncidentReport = true;
    incidentType = 'hardware_damage';
    findings.push(`CRITICAL HARDWARE DAMAGE DETECTED: [${detectedCritical.join(', ') || 'Severe mechanical fault reported'}]. Immediate maintenance inspection required.`);
  } else if (detectedMedium.length > 0 || finalRank < initialRank - 1) {
    damageSeverity = 'medium';
    estimatedCost = 220;
    depositAction = 'partially_retained';
    requiresIncidentReport = true;
    incidentType = 'hardware_damage';
    findings.push(`Notable physical damage or misalignment: [${detectedMedium.join(', ') || 'Condition downgraded significantly'}]. Requires shop technician recalibration.`);
  } else if (cleanlinessRating <= 2 || detectedLow.length > 0) {
    damageSeverity = 'low';
    estimatedCost = 45;
    depositAction = 'refunded';
    requiresIncidentReport = cleanlinessRating <= 1;
    incidentType = 'unclean_station';
    findings.push(`Station returned below cleanliness standards (Rating ${cleanlinessRating}/5). Minor residue or surface scuffs detected.`);
  } else {
    findings.push('Equipment returned in expected, acceptable condition. Normal operating wear within safety tolerances.');
  }

  // Pre-existing condition check to protect user from false blame
  if (initialText.includes('scratch') || initialText.includes('wear') || initialCondition === 'pre_existing_damage') {
    findings.push('User correctly documented pre-existing imperfections during Step 7 Check-in; user exonerated from historical wear.');
  }

  const aiDraftSummary = {
    evaluatedAt: new Date().toISOString(),
    damageSeverity,
    estimatedCost,
    recommendedDepositAction: depositAction,
    requiresIncidentReport,
    suggestedIncidentType: incidentType,
    cleanlinessRating,
    findings,
    executiveSummary: requiresIncidentReport
      ? `AI ALERT: Discrepancy detected between Check-in (${initialCondition}) and Return (${finalCondition}). Severity: ${damageSeverity.toUpperCase()}. Recommended action: ${depositAction}. Review required by Lab Manager.`
      : `Check-in/Return comparison passed cleanly. Deposit refund approved with zero safety flags.`
  };

  return aiDraftSummary;
}

module.exports = {
  analyzeConditionDiff,
  SEVERITY_TRIGGERS
};
