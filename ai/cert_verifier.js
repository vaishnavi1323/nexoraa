/**
 * Nexora AI Document & Certification Verifier
 * Simulates intelligent OCR parsing, safety badge extraction, 
 * expiration auditing, and human-in-the-loop review recommendations.
 */

const TRUSTED_ISSUERS = [
  'MIT Environment, Health & Safety (EHS)',
  'Stanford Environmental Health & Safety',
  'Laser Safety Officer Board (LSO)',
  'OSHA Safety Training Institute',
  'Cleanroom Operations Standard Council',
  'National Biosafety Advisory Board',
  'MakerSpace Safety Alliance',
  'Carnegie Mellon Robotics Safety Commission'
];

/**
 * Verify a user's uploaded training or safety certification document
 */
function verifyCertificationDocument({
  title,
  issuingBody,
  issueDate,
  expiryDate,
  userRole,
  rawTextExtract = ''
}) {
  const issues = [];
  const flags = [];
  let confidenceScore = 95;

  const now = new Date();
  const expDateObj = new Date(expiryDate);
  const issDateObj = new Date(issueDate);

  // 1. Expiration check
  if (isNaN(expDateObj.getTime())) {
    issues.push('Invalid or unparseable expiration date on certificate');
    confidenceScore -= 30;
  } else if (expDateObj < now) {
    issues.push(`Certificate expired on ${expiryDate}`);
    confidenceScore -= 50;
  } else {
    const daysUntilExpiry = Math.ceil((expDateObj - now) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 30) {
      flags.push(`Certificate expiring soon (${daysUntilExpiry} days remaining)`);
    }
  }

  // 2. Issue date timeline sanity check
  if (!isNaN(issDateObj.getTime()) && issDateObj > now) {
    issues.push('Issue date is set in the future - possible document anomaly');
    confidenceScore -= 40;
  }

  // 3. Known issuer verification
  const isTrustedIssuer = TRUSTED_ISSUERS.some(
    issuer => issuingBody.toLowerCase().includes(issuer.toLowerCase()) || issuer.toLowerCase().includes(issuingBody.toLowerCase())
  );

  if (!isTrustedIssuer) {
    flags.push(`Issuing organization '${issuingBody}' is not in the automatic pre-verified registry. Requires lab manager validation.`);
    confidenceScore -= 15;
  }

  // 4. Competency extraction
  const competenciesDetected = [];
  const textToScan = `${title} ${issuingBody} ${rawTextExtract}`.toLowerCase();

  if (textToScan.includes('laser')) competenciesDetected.push('Class 3B/4 Laser Radiation Protocols');
  if (textToScan.includes('bio') || textToScan.includes('bl2')) competenciesDetected.push('Biosafety Level 2 Biohazard Containment');
  if (textToScan.includes('cnc') || textToScan.includes('mill') || textToScan.includes('lathe')) competenciesDetected.push('Rotary Machinery & Emergency Stop Response');
  if (textToScan.includes('cleanroom') || textToScan.includes('iso')) competenciesDetected.push('ISO Class 5 Cleanroom Gowning & Particle Control');
  if (textToScan.includes('chemical') || textToScan.includes('solvent')) competenciesDetected.push('Hazardous Chemical Fume Hood Operations');

  // Decision logic
  let status = 'verified';
  let recommendation = 'AUTOMATIC_APPROVAL';

  if (issues.length > 0) {
    status = 'rejected';
    recommendation = 'REJECT_EXPIRED_OR_INVALID';
  } else if (flags.length > 0 || confidenceScore < 85) {
    status = 'pending';
    recommendation = 'FLAG_FOR_LAB_MANAGER_REVIEW';
  }

  return {
    verified: status === 'verified',
    status,
    confidenceScore: Math.max(0, confidenceScore),
    recommendation,
    competenciesDetected,
    issues,
    flags,
    aiAnalysisNote: issues.length > 0 
      ? `Verification Failed: ${issues.join('. ')}`
      : flags.length > 0
        ? `Pending Human Oversight: ${flags.join('. ')}`
        : `Verified successfully. Recognized competencies: ${competenciesDetected.join(', ') || title}.`
  };
}

module.exports = {
  verifyCertificationDocument,
  TRUSTED_ISSUERS
};
