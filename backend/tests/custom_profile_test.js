const API_BASE = 'http://localhost:5000/api';

async function testCustomProfile() {
  console.log('🧪 Testing Custom User Profile Creation & Manual Editing...');

  const uniqueEmail = `creator_${Date.now()}@innovation.org`;

  // 1. Create custom user profile
  const createRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Shivam Sharma',
      email: uniqueEmail,
      role: 'student',
      institution: 'Indian Institute of Technology',
      department: 'Robotics & Advanced Fabrication',
      phone: '+91 98765 43210',
      bio: 'Building autonomous aerial robotics and custom carbon fiber frames.',
      credits: 1500,
      trust_score: 95
    })
  });
  const createData = await createRes.json();
  if (!createData.success || !createData.user.id) {
    throw new Error('Profile creation failed: ' + createData.error);
  }
  const userId = createData.user.id;
  console.log(`✅ 1. Custom Profile Created: ${createData.user.name} (${createData.user.id}) at ${createData.user.institution}`);

  // 2. Edit profile details manually
  const editRes = await fetch(`${API_BASE}/auth/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({
      name: 'Shivam Sharma (Lead Fellow)',
      role: 'researcher',
      department: 'Robotics, Mechatronics & AI',
      phone: '+91 98765 00000',
      credits: 2000,
      trust_score: 98
    })
  });
  const editData = await editRes.json();
  if (!editData.success || editData.user.role !== 'researcher') {
    throw new Error('Profile editing failed: ' + editData.error);
  }
  console.log(`✅ 2. Profile Details Updated Manually: Role changed to ${editData.user.role}, Credits: ${editData.user.credits}`);

  // 3. Verify user list contains new profile
  const listRes = await fetch(`${API_BASE}/auth/users`);
  const listData = await listRes.json();
  const found = listData.users.find(u => u.id === userId);
  if (!found) throw new Error('User not found in global directory');
  console.log(`✅ 3. User successfully verified in global institutional directory!`);

  console.log('\n🎉 Custom Profile & Manual Details System Verified with 100% Success!\n');
}

testCustomProfile().catch(err => {
  console.error(err);
  process.exit(1);
});
