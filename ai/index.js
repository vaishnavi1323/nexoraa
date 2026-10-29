/**
 * Nexora AI Suite Entry Point
 */

const { matchResources, KEYWORD_TAXONOMY } = require('./matcher');
const { verifyCertificationDocument, TRUSTED_ISSUERS } = require('./cert_verifier');
const { analyzeConditionDiff, SEVERITY_TRIGGERS } = require('./condition_analyzer');
const { analyzeAllocationFairness } = require('./fairness_optimizer');

module.exports = {
  matchResources,
  KEYWORD_TAXONOMY,
  verifyCertificationDocument,
  TRUSTED_ISSUERS,
  analyzeConditionDiff,
  SEVERITY_TRIGGERS,
  analyzeAllocationFairness
};
