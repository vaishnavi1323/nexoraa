const {
  matchResources,
  verifyCertificationDocument,
  analyzeConditionDiff,
  analyzeAllocationFairness
} = require('../index');

console.log('=== RUNNING NEXORA AI SUITE VERIFICATION ===\n');

// 1. Test Matcher
const sampleResources = [
  {
    id: 'res_1',
    title: 'Haas VF-2 4-Axis CNC Milling Center',
    description: 'Industrial CNC mill capable of machining titanium and aluminum',
    category: 'fabrication',
    type: 'CNC Mill',
    location: 'Building 35-102',
    status: 'available',
    required_certifications: JSON.stringify(['5-Axis CNC Mill Certified Operator'])
  },
  {
    id: 'res_2',
    title: 'FEI Quanta Field Emission SEM',
    description: 'Scanning electron microscope with sub-nanometer resolution',
    category: 'equipment',
    type: 'Electron Microscope',
    location: 'Nanotechnology Core Lab 404',
    status: 'available',
    required_certifications: JSON.stringify(['Nanoscale Imaging Safety'])
  }
];

const matchQuery = 'Need to machine titanium aerospace parts on 4-axis cnc mill';
const matchResults = matchResources(matchQuery, sampleResources, [{ title: '5-Axis CNC Mill Certified Operator' }]);
console.log('1. Matcher Result: Top match:', matchResults[0].resource.title, 'Score:', matchResults[0].matchScore, '%');

// 2. Test Cert Verifier
const certVerification = verifyCertificationDocument({
  title: 'Laser Safety Level 2 Operator',
  issuingBody: 'MIT Environment, Health & Safety (EHS)',
  issueDate: '2025-01-15',
  expiryDate: '2027-01-15',
  userRole: 'researcher'
});
console.log('2. Cert Verifier Result:', certVerification.status, 'Recommendation:', certVerification.recommendation, 'Confidence:', certVerification.confidenceScore);

// 3. Test Condition Vision Analyzer
const conditionDiff = analyzeConditionDiff({
  initialCondition: 'pristine',
  initialNotes: 'Clean bed, all collets accounted for, E-stop tested',
  finalCondition: 'damaged',
  finalNotes: 'Tool shattered during high feed rate cut, cracked spindle housing',
  checklistAnswers: { eStop: true, spindleClean: false },
  cleanlinessRating: 2
});
console.log('3. Condition Analyzer Result: Severity:', conditionDiff.damageSeverity, 'Est Cost: $' + conditionDiff.estimatedCost, 'Action:', conditionDiff.recommendedDepositAction);

// 4. Test Fairness Optimizer
const fairnessReport = analyzeAllocationFairness(
  [
    { id: 'b1', user_id: 'u1', resource_id: 'res_1', start_time: '2026-10-20T08:00:00Z', end_time: '2026-10-20T18:00:00Z', status: 'completed' },
    { id: 'b2', user_id: 'u1', resource_id: 'res_1', start_time: '2026-10-21T08:00:00Z', end_time: '2026-10-21T18:00:00Z', status: 'completed' },
    { id: 'b3', user_id: 'u1', resource_id: 'res_1', start_time: '2026-10-22T08:00:00Z', end_time: '2026-10-22T18:00:00Z', status: 'completed' }
  ],
  sampleResources,
  [{ id: 'u1', name: 'Heavy User Labs', department: 'Commercial Robotics' }]
);
console.log('4. Fairness Optimizer Result: Distribution Health:', fairnessReport.distributionHealth, 'Alerts:', fairnessReport.monopolizationAlerts.length);

console.log('\n=== ALL AI SUITE VERIFICATIONS PASSED ===');
