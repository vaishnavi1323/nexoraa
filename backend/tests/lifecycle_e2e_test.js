/**
 * Nexora End-to-End 10-Step Lifecycle Verification Test
 * Executes all 10 hackathon stages via the live backend API and asserts success.
 */

const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('===========================================================');
  console.log('🧪 RUNNING END-TO-END 10-STEP LIFECYCLE VERIFICATION TEST');
  console.log('===========================================================\n');

  // Step 1: Owner lists resource
  console.log('▶ Step 1: Owner lists specialized resource with safety prerequisites...');
  const createRes = await fetch(`${API_BASE}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_manager' },
    body: JSON.stringify({
      title: 'Kuka KR CYBERTECH 6-Axis Industrial Robot',
      description: 'Industrial robotic arm for heavy payload composite handling.',
      category: 'testing_rig',
      type: 'Industrial Robot Arm',
      location: 'Robotics Bay 4',
      hourly_rate: 40,
      deposit: 200,
      min_hours: 1,
      max_hours: 4,
      required_certifications: ['5-Axis CNC Mill Certified Operator'],
      specs: { 'Payload': '16 kg', 'Reach': '2013 mm' }
    })
  });
  const createResData = await createRes.json();
  if (!createResData.success) throw new Error('Step 1 Failed: ' + createResData.error);
  const resourceId = createResData.resourceId;
  console.log(`✅ Step 1 Passed: Resource listed with ID: ${resourceId}\n`);

  // Step 2: User discovers & checks eligibility
  console.log('▶ Step 2: Researcher discovers resource and checks pre-flight safety eligibility...');
  const eligRes = await fetch(`${API_BASE}/resources/${resourceId}/eligibility?userId=usr_researcher`);
  const eligData = await eligRes.json();
  if (!eligData.success || !eligData.isEligible) throw new Error('Step 2 Failed: Eligibility expected true');
  console.log(`✅ Step 2 Passed: Pre-flight eligibility verified. Satisfied certs: ${eligData.requirements.satisfiedCertifications.join(', ')}\n`);

  // Step 3 & 4: User submits request & Fair Allocation engine evaluates
  console.log('▶ Steps 3 & 4: User submits request; Fair Allocation engine computes explainable score...');
  const bookRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_researcher' },
    body: JSON.stringify({
      resource_id: resourceId,
      start_time: '2026-11-05T10:00:00Z',
      end_time: '2026-11-05T13:00:00Z',
      purpose: 'Academic Thesis / Core Research',
      project_title: 'End-Effector Dynamics Experiment',
      supervisor_name: 'Dr. Sarah Chen'
    })
  });
  const bookData = await bookRes.json();
  if (!bookData.success) throw new Error('Step 3/4 Failed: ' + bookData.error);
  const bookingId = bookData.booking.id;
  console.log(`✅ Steps 3 & 4 Passed: Booking code ${bookData.booking.bookingCode} submitted. Fairness Priority Score: ${bookData.booking.fairnessScore} pts.\n`);

  // Step 5 & 6: Lab Manager reviews & authorizes pass
  console.log('▶ Steps 5 & 6: Lab Manager reviews request & authorizes access pass...');
  const approveRes = await fetch(`${API_BASE}/bookings/${bookingId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_manager' },
    body: JSON.stringify({ approval_notes: 'Safety inspection complete. Access granted for thesis run.' })
  });
  const approveData = await approveRes.json();
  if (!approveData.success || approveData.status !== 'approved') throw new Error('Step 5/6 Failed');
  console.log(`✅ Steps 5 & 6 Passed: Manager authorized access pass. Status: ${approveData.status}\n`);

  // Step 7: User check-in & condition baseline
  console.log('▶ Step 7: User arrives at station, verifies safety checklist, logs initial condition baseline...');
  const checkinRes = await fetch(`${API_BASE}/bookings/${bookingId}/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_researcher' },
    body: JSON.stringify({
      initial_condition_status: 'pristine',
      initial_notes: 'Robot arm zero-point calibrated. Estop tested. Safety perimeter active.',
      checklist_answers: { estop: true, perimeterClear: true },
      initial_photos: ['https://example.com/robot-clean.jpg']
    })
  });
  const checkinData = await checkinRes.json();
  if (!checkinData.success || !checkinData.checkin.passCode) throw new Error('Step 7 Failed');
  console.log(`✅ Step 7 Passed: Station Check-In complete. Digital Pass Code: ${checkinData.checkin.passCode}\n`);

  // Step 8 & 9: User returns, AI Vision condition diff runs
  console.log('▶ Steps 8 & 9: User returns equipment, logs handover, AI Vision Diff analyzes wear vs damage...');
  const returnRes = await fetch(`${API_BASE}/bookings/${bookingId}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_researcher' },
    body: JSON.stringify({
      final_condition_status: 'good',
      final_notes: 'Completed 3 test cycles. Workspace swept, emergency stop reset, arm parked at home position.',
      cleanliness_rating: 5,
      consumables_used: { operationalMinutes: 120 }
    })
  });
  const returnData = await returnRes.json();
  if (!returnData.success) throw new Error('Step 8 Failed: ' + returnData.error);
  console.log(`✅ Steps 8 & 9 Passed: Return verified. AI Executive Summary: "${returnData.aiConditionAnalysis.executiveSummary}"\n`);

  // Step 10: Complete Audit Ledger Verification
  console.log('▶ Step 10: Verifying immutable chronological audit trail ledger...');
  const auditRes = await fetch(`${API_BASE}/audit?entityId=${bookingId}`);
  const auditData = await auditRes.json();
  if (!auditData.success || auditData.count < 3) throw new Error('Step 10 Failed: Incomplete audit trail');
  console.log(`✅ Step 10 Passed: ${auditData.count} tamper-evident lifecycle events recorded in ledger:`);
  auditData.auditLogs.forEach(l => {
    console.log(`   - [${l.timestamp}] ${l.action} by ${l.actor_name} (${l.actor_role})`);
  });

  console.log('\n🎉 ALL 10 STEPS OF THE HACKATHON RESOURCE-SHARING LIFECYCLE VERIFIED WITH 100% SUCCESS!');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
