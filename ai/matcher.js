/**
 * Nexora AI Natural Language Resource Matcher
 * Parses user requirements, matches technical specifications, 
 * checks eligibility prerequisites, and ranks suitable resources.
 */

const KEYWORD_TAXONOMY = {
  milling: ['cnc', 'mill', 'haas', 'machining', 'titanium', 'aluminum', 'metal', 'spindle', 'axis', 'subtractive'],
  microscopy: ['sem', 'microscope', 'electron', 'confocal', 'imaging', 'magnification', 'fluorescence', 'laser', 'nanoscale', 'cells'],
  cleanroom: ['cleanroom', 'photolithography', 'wafer', 'semiconductor', 'iso', 'spin coater', 'mask aligner', 'etching'],
  optics: ['camera', 'high-speed', 'photonics', 'framerate', 'fps', 'optics', 'lens', 'illumination', 'laser'],
  additive: ['3d print', 'metal x', 'sintering', 'filament', 'resin', 'prototyping', 'fdm', 'sla', 'markforged'],
  audio: ['sound', 'recording', 'acoustic', 'spatial audio', 'studio', 'microphones', 'mixing', 'soundcraft'],
  robotics: ['robot', 'arena', 'vicon', 'motion capture', 'drone', 'autonomous', 'tracking', 'quadruped']
};

/**
 * Match a natural language query against a resource catalog
 */
function matchResources(query, resources, userCertifications = []) {
  if (!query || query.trim() === '') {
    return resources.map(r => ({ ...r, matchScore: 100, matchReason: 'Full catalog' }));
  }

  const queryLower = query.toLowerCase();
  const queryTokens = queryLower.split(/\W+/).filter(w => w.length > 2);

  const scoredResources = resources.map(resource => {
    let score = 0;
    const reasons = [];
    const missingRequirements = [];

    const resourceText = [
      resource.title,
      resource.description,
      resource.category,
      resource.type,
      resource.location,
      typeof resource.specs === 'string' ? resource.specs : JSON.stringify(resource.specs || {}),
      typeof resource.tags === 'string' ? resource.tags : JSON.stringify(resource.tags || [])
    ].join(' ').toLowerCase();

    // 1. Direct keyword match
    let matchedKeywords = 0;
    for (const token of queryTokens) {
      if (resourceText.includes(token)) {
        matchedKeywords++;
        score += 15;
      }
    }
    if (matchedKeywords > 0) {
      reasons.push(`Matched ${matchedKeywords} direct query terms`);
    }

    // 2. Semantic domain matching via taxonomy
    for (const [domain, keywords] of Object.entries(KEYWORD_TAXONOMY)) {
      const queryMatchesDomain = keywords.some(k => queryLower.includes(k));
      const resourceMatchesDomain = keywords.some(k => resourceText.includes(k));

      if (queryMatchesDomain && resourceMatchesDomain) {
        score += 35;
        reasons.push(`Domain synergy: ${domain.toUpperCase()} technical capabilities`);
        break;
      }
    }

    // 3. Category match boost
    if (queryLower.includes(resource.category.toLowerCase())) {
      score += 20;
      reasons.push(`Direct category match: ${resource.category}`);
    }

    // 4. Check user eligibility prerequisites
    let requiredCerts = [];
    try {
      requiredCerts = typeof resource.required_certifications === 'string' 
        ? JSON.parse(resource.required_certifications || '[]')
        : (resource.required_certifications || []);
    } catch {
      requiredCerts = [];
    }

    const userCertTitles = (userCertifications || []).map(c => (c.title || c.name || '').toLowerCase());
    
    let certsSatisfied = 0;
    for (const req of requiredCerts) {
      const hasCert = userCertTitles.some(c => c.includes(req.toLowerCase()) || req.toLowerCase().includes(c));
      if (hasCert) {
        certsSatisfied++;
      } else {
        missingRequirements.push(req);
      }
    }

    const isFullyEligible = missingRequirements.length === 0;
    if (isFullyEligible) {
      score += 15;
      reasons.push('User meets all safety & certification prerequisites');
    } else {
      score = Math.max(10, score - 20); // Penalty for missing certs
      reasons.push(`Missing prerequisites: ${missingRequirements.join(', ')}`);
    }

    // 5. Availability condition boost
    if (resource.status === 'available') {
      score += 10;
    } else {
      score -= 25;
      reasons.push(`Resource is currently ${resource.status}`);
    }

    const finalScore = Math.min(100, Math.max(5, Math.round(score)));

    return {
      resource,
      matchScore: finalScore,
      isFullyEligible,
      missingRequirements,
      matchReasons: reasons,
      aiSummary: `${finalScore}% match for "${query.slice(0, 40)}${query.length > 40 ? '...' : ''}". ${reasons.slice(0, 2).join('. ')}.`
    };
  });

  // Sort descending by score
  return scoredResources.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = {
  matchResources,
  KEYWORD_TAXONOMY
};
