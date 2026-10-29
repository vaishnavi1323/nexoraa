const API_BASE = 'http://localhost:5000/api';

async function testDamageHandling() {
  console.log('🧪 Testing Step 9: Hardware Collision & AI Damage Discrepancy Flow...');

  // 1. Submit and approve booking
  const bookRes = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_creator' },
    body: JSON.stringify({
      resource_id: 'res_markforged_metal',
      start_time: '2026-11-10T14:00:00Z',
      end_time: '2026-11-10T18:00:00Z',
      purpose: 'Exploratory Prototyping',
      project_title: 'Damage Simulator Test Run',
      supervisor_name: 'Shop Tech Josh'
    })
  });
  const booking = (await bookRes.json()).booking;

  await fetch(`${API_BASE}/bookings/${booking.id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_manager' },
    body: JSON.stringify({ approval_notes: 'Approved' })
  });

  // 2. Check in pristine
  await fetch(`${API_BASE}/bookings/${booking.id}/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_creator' },
    body: JSON.stringify({
      initial_condition_status: 'pristine',
      initial_notes: 'Pristine bed, no issues',
      checklist_answers: { clean: true }
    })
  });

  // 3. Return damaged (Step 9 trigger)
  const returnRes = await fetch(`${API_BASE}/bookings/${booking.id}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_creator' },
    body: JSON.stringify({
      final_condition_status: 'damaged',
      final_notes: 'Extruder nozzle cracked the ceramic heating block and shattered print surface during print cycle.',
      cleanliness_rating: 1
    })
  });
  const returnData = await returnRes.json();

  console.log('✅ AI Damage Discrepancy Flagged:');
  console.log('   - Next Status:', returnData.bookingStatus);
  console.log('   - Deposit Status:', returnData.depositRefundStatus);
  console.log('   - Damage Severity:', returnData.aiConditionAnalysis.damageSeverity);
  console.log('   - Est Cost: $' + returnData.aiConditionAnalysis.estimatedCost);

  if (returnData.bookingStatus !== 'incident_reported' || returnData.depositRefundStatus !== 'held_for_review') {
    throw new Error('Damage detection did not trigger incident_reported or deposit hold');
  }

  console.log('🎉 Step 9 AI Damage Detection and Incident Creation Test Passed!\n');
}

testDamageHandling().catch(err => {
  console.error(err);
  process.exit(1);
});
