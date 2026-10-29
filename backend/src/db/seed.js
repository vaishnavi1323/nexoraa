const db = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function seed() {
  console.log('Clearing existing records...');
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM notifications;
    DELETE FROM incidents;
    DELETE FROM returns;
    DELETE FROM checkins;
    DELETE FROM bookings;
    DELETE FROM certifications;
    DELETE FROM resources;
    DELETE FROM users;
  `);

  console.log('Seeding Users...');
  const passwordHash = bcrypt.hashSync('password123', 8);

  const users = [
    {
      id: 'usr_manager',
      name: 'Dr. Sarah Chen',
      email: 'manager@mit.edu',
      password_hash: passwordHash,
      role: 'lab_manager',
      institution: 'MIT Center for Bits and Atoms',
      department: 'FabLab & Shared Facilities',
      trust_score: 98,
      credits: 2500,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      phone: '+1 (617) 253-1000',
      bio: 'Director of Shared Advanced Fabrication and Nanotechnology Facilities with 14 years in academic safety governance.'
    },
    {
      id: 'usr_researcher',
      name: 'Alex Rivera',
      email: 'researcher@stanford.edu',
      password_hash: passwordHash,
      role: 'researcher',
      institution: 'Stanford Bio-X & Robotics',
      department: 'Mechanical Engineering & Bio-Robotics',
      trust_score: 94,
      credits: 1200,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '+1 (650) 723-2300',
      bio: 'PhD candidate researching bio-compatible titanium soft-robotics. Qualified on 4-axis CNC and Laser Safety.'
    },
    {
      id: 'usr_student',
      name: 'Maya Lin',
      email: 'student@cmu.edu',
      password_hash: passwordHash,
      role: 'student',
      institution: 'Carnegie Mellon University',
      department: 'Integrated Innovation Institute',
      trust_score: 88,
      credits: 450,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      phone: '+1 (412) 268-2000',
      bio: 'Undergraduate senior engineering student developing an assistive robotic prosthetic prototype.'
    },
    {
      id: 'usr_creator',
      name: 'Marcus Vance',
      email: 'creator@makerhub.org',
      password_hash: passwordHash,
      role: 'community_member',
      institution: 'Downtown Community MakerSpace',
      department: 'Hardware Innovation Cohort',
      trust_score: 82,
      credits: 300,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      phone: '+1 (415) 555-0192',
      bio: 'Community hardware entrepreneur prototyping renewable solar energy monitors.'
    },
    {
      id: 'usr_admin',
      name: 'Dean Arthur Vance',
      email: 'admin@inst.edu',
      password_hash: passwordHash,
      role: 'admin',
      institution: 'Inter-Institutional Research Consortium',
      department: 'Safety & Resource Oversight Board',
      trust_score: 100,
      credits: 9999,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      phone: '+1 (617) 555-8900',
      bio: 'Chief Academic Resources Officer presiding over fair-access resource sharing protocols.'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, institution, department, trust_score, credits, avatar, phone, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  users.forEach(u => insertUser.run(u.id, u.name, u.email, u.password_hash, u.role, u.institution, u.department, u.trust_score, u.credits, u.avatar, u.phone, u.bio));

  console.log('Seeding Certifications...');
  const certifications = [
    {
      id: 'cert_1',
      user_id: 'usr_researcher',
      title: '5-Axis CNC Mill Certified Operator',
      issuing_body: 'MIT Environment, Health & Safety (EHS)',
      issue_date: '2025-02-10',
      expiry_date: '2027-02-10',
      status: 'verified',
      document_url: 'https://example.com/certs/cnc-rivera.pdf',
      verification_notes: 'Verified via EHS Central Database. Practical machining examination passed with distinction.'
    },
    {
      id: 'cert_2',
      user_id: 'usr_researcher',
      title: 'Class 3B/4 Laser Safety Operator',
      issuing_body: 'Laser Safety Officer Board (LSO)',
      issue_date: '2024-09-01',
      expiry_date: '2026-09-01',
      status: 'verified',
      document_url: 'https://example.com/certs/laser-rivera.pdf',
      verification_notes: 'Class 4 alignment and optical safety protocols confirmed.'
    },
    {
      id: 'cert_3',
      user_id: 'usr_student',
      title: 'MakerSpace Basic Safety Orientation',
      issuing_body: 'MakerSpace Safety Alliance',
      issue_date: '2026-01-15',
      expiry_date: '2027-01-15',
      status: 'verified',
      document_url: 'https://example.com/certs/basic-safety.pdf',
      verification_notes: 'Standard shop safety orientation completed.'
    },
    {
      id: 'cert_4',
      user_id: 'usr_student',
      title: '5-Axis CNC Mill Certified Operator',
      issuing_body: 'Haas Technical Education Community',
      issue_date: '2026-10-01',
      expiry_date: '2027-10-01',
      status: 'pending',
      document_url: 'https://example.com/certs/pending-cnc.pdf',
      verification_notes: 'Uploaded by student. Awaiting Lab Manager hands-on practical sign-off.'
    },
    {
      id: 'cert_5',
      user_id: 'usr_creator',
      title: '3D Additive Sintering Operator',
      issuing_body: 'MakerSpace Safety Alliance',
      issue_date: '2025-06-20',
      expiry_date: '2027-06-20',
      status: 'verified',
      document_url: 'https://example.com/certs/metal-3d.pdf',
      verification_notes: 'Certified for metal sintering powder handling and ventilation safety.'
    }
  ];

  const insertCert = db.prepare(`
    INSERT INTO certifications (id, user_id, title, issuing_body, issue_date, expiry_date, status, document_url, verification_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  certifications.forEach(c => insertCert.run(c.id, c.user_id, c.title, c.issuing_body, c.issue_date, c.expiry_date, c.status, c.document_url, c.verification_notes));

  console.log('Seeding Resources...');
  const resources = [
    {
      id: 'res_cnc_haas',
      title: 'Haas VF-2 4-Axis CNC Milling Center',
      description: 'Industrial high-speed 4-axis vertical machining center with 30-hp vector drive, 10,000-rpm spindle, and 24-station side-mount tool changer. Capable of precision machining in aerospace grade aluminum, brass, delrin, and titanium alloys.',
      category: 'fabrication',
      type: 'CNC Mill',
      owner_id: 'usr_manager',
      institution: 'MIT Center for Bits and Atoms',
      location: 'Building 35, Advanced Fabrication Bay 102',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800'
      ]),
      specs: JSON.stringify({
        'Travel X/Y/Z': '762 x 406 x 508 mm',
        'Spindle Taper': 'CT or BT 40',
        'Max Spindle Speed': '10,000 RPM',
        'Max Tool Weight': '5.4 kg',
        'Coolant': 'Flood coolant + Minimum Quantity Lubrication (MQL)'
      }),
      hourly_rate: 35.0,
      deposit: 150.0,
      min_hours: 2,
      max_hours: 6,
      max_advance_days: 14,
      requires_supervision: 1,
      supervision_notes: 'Lab supervisor or TA must be present during initial tool touch-off and first-article cut.',
      required_certifications: JSON.stringify(['5-Axis CNC Mill Certified Operator']),
      status: 'available',
      current_condition: 'pristine',
      condition_notes: 'Spindle calibrated on Oct 24. Tram checked within 0.0002 inches.',
      tags: JSON.stringify(['cnc', 'milling', 'metal', 'fabrication', 'aerospace', 'subtractive'])
    },
    {
      id: 'res_sem_microscope',
      title: 'FEI Quanta 250 Field Emission SEM',
      description: 'High-resolution field emission scanning electron microscope (FE-SEM) equipped with secondary electron (SE), backscattered electron (BSE), and Energy Dispersive X-ray Spectroscopy (EDS) microanalysis for elemental mapping down to 1.2nm resolution.',
      category: 'equipment',
      type: 'Electron Microscope',
      owner_id: 'usr_manager',
      institution: 'MIT Center for Bits and Atoms',
      location: 'Nanotechnology Core Facility, Cleanroom Annex 404',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800',
        'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800'
      ]),
      specs: JSON.stringify({
        'Resolution': '1.2 nm at 30 kV',
        'Magnification': '14x to 1,000,000x',
        'Vacuum Modes': 'High vacuum, Low vacuum, ESEM',
        'Detectors': 'Everhart-Thornley SED, Solid-State BSED, Oxford EDS',
        'Stage': '5-axis motorized eucentric'
      }),
      hourly_rate: 65.0,
      deposit: 250.0,
      min_hours: 1,
      max_hours: 4,
      max_advance_days: 21,
      requires_supervision: 1,
      supervision_notes: 'Non-conductive samples must be sputter-coated with gold-palladium prior to chamber loading.',
      required_certifications: JSON.stringify(['Nanoscale Imaging Safety', 'Class 3B/4 Laser Safety Operator']),
      status: 'available',
      current_condition: 'good',
      condition_notes: 'Chamber vacuum baseline optimal. Filaments inspected.',
      tags: JSON.stringify(['microscopy', 'nanotechnology', 'materials', 'sem', 'imaging'])
    },
    {
      id: 'res_confocal_microscope',
      title: 'Leica TCS SP8 Confocal Laser Microscope',
      description: 'Inverted spectral confocal microscope designed for high-resolution 3D live-cell fluorescent imaging, FRET, FRAP, and multicolor colocalization with continuous white light laser (470-670 nm) and resonant scanner.',
      category: 'equipment',
      type: 'Confocal Microscope',
      owner_id: 'usr_manager',
      institution: 'Stanford Bio-X & Robotics',
      location: 'James H. Clark Center, Bio-Imaging Wing Room S-108',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
      ]),
      specs: JSON.stringify({
        'Laser Lines': '405 nm UV, White Light Laser 470-670 nm, 442 nm diode',
        'Detectors': '2x HyD hybrid high-sensitivity detectors + 2x PMT',
        'Objectives': '10x, 20x multi-immersion, 63x 1.40 Oil DIC',
        'Incubation': 'Full temperature & CO2 atmospheric chamber'
      }),
      hourly_rate: 55.0,
      deposit: 200.0,
      min_hours: 1,
      max_hours: 5,
      max_advance_days: 14,
      requires_supervision: 0,
      supervision_notes: 'Available for unassisted booking after Level 2 optical training sign-off.',
      required_certifications: JSON.stringify(['Class 3B/4 Laser Safety Operator']),
      status: 'available',
      current_condition: 'pristine',
      condition_notes: 'All objectives cleaned with spectroscopic grade methanol.',
      tags: JSON.stringify(['biology', 'laser', 'fluorescence', 'live-cells', 'imaging'])
    },
    {
      id: 'res_markforged_metal',
      title: 'Markforged Metal X 3D Metal Printer',
      description: 'Atomic Diffusion Additive Manufacturing (ADAM) printer that prints metal powder bound in plastic matrix. Directly produces functional end-use prototypes in 17-4 PH Stainless Steel, Inconel 625, and Copper.',
      category: 'fabrication',
      type: 'Additive 3D Printer',
      owner_id: 'usr_manager',
      institution: 'Downtown Community MakerSpace',
      location: 'Rapid Prototyping Hall, Station M-3',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1631556097152-c39479cbfeab?w=800'
      ]),
      specs: JSON.stringify({
        'Build Volume': '300 x 220 x 180 mm',
        'Materials': '17-4 PH Stainless Steel, Copper, Tool Steel H13',
        'Layer Height': '50 - 125 microns',
        'Post-Processing': 'Requires Wash-1 solvent debind and Sinter-2 furnace'
      }),
      hourly_rate: 28.0,
      deposit: 100.0,
      min_hours: 2,
      max_hours: 8,
      max_advance_days: 10,
      requires_supervision: 0,
      supervision_notes: 'Solvent wash cycle must be scheduled synchronously with print completion.',
      required_certifications: JSON.stringify(['3D Additive Sintering Operator']),
      status: 'available',
      current_condition: 'good',
      condition_notes: 'Vacuum seals inspected and release sheet renewed.',
      tags: JSON.stringify(['3d-printing', 'additive', 'metal', 'prototyping', 'stainless-steel'])
    },
    {
      id: 'res_phantom_camera',
      title: 'Phantom v2512 Ultra High-Speed Camera',
      description: 'World-class ultra-high-speed camera recording up to 25,700 frames per second at full 1 Megapixel resolution, with exposure times down to 265 nanoseconds. Ideal for fluid cavitation, ballistics, micro-droplets, and combustion research.',
      category: 'equipment',
      type: 'High-Speed Camera',
      owner_id: 'usr_manager',
      institution: 'MIT Center for Bits and Atoms',
      location: 'Optics & High-Speed Dynamics Core, Lab 33-219',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'
      ]),
      specs: JSON.stringify({
        'Max Resolution': '1280 x 800 at 25,700 fps',
        'Reduced Resolution': 'Up to 1,000,000 fps at 128 x 32',
        'Memory': '72 GB internal CineMag buffer',
        'Lens Mount': 'Nikon F-mount and Canon EF with electronic control'
      }),
      hourly_rate: 45.0,
      deposit: 300.0,
      min_hours: 2,
      max_hours: 6,
      max_advance_days: 14,
      requires_supervision: 1,
      supervision_notes: 'High-power continuous LED lighting arrays must be operated with heat sinks active.',
      required_certifications: JSON.stringify(['MakerSpace Basic Safety Orientation']),
      status: 'available',
      current_condition: 'pristine',
      condition_notes: 'Sensor calibration dark frames verified. 10G Ethernet transfer verified.',
      tags: JSON.stringify(['camera', 'high-speed', 'photonics', 'fluids', 'optics'])
    },
    {
      id: 'res_cleanroom_bay',
      title: 'ISO Class 5 Cleanroom Photolithography Bay',
      description: 'Certified ISO Class 5 (Class 100) clean environment bay with yellow filtered illumination, Brewer Science automated spin coater, Suss MicroTec mask aligner, convection soft-bake ovens, and HMDS vapor priming.',
      category: 'space',
      type: 'Cleanroom Facility',
      owner_id: 'usr_manager',
      institution: 'Carnegie Mellon University',
      location: 'Nanofabrication Facility, Roberts Hall Cleanroom Bay C',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800'
      ]),
      specs: JSON.stringify({
        'Cleanliness Class': 'ISO 14644-1 Class 5 (max 3,520 particles/m³ >= 0.5µm)',
        'Substrate Sizes': 'Pieces up to 150mm (6-inch) silicon wafers',
        'Mask Aligner': 'Sub-micron overlay accuracy with UV 365/405nm exposure',
        'Chemical Handling': 'Dedicated exhaust solvent and developer wet benches'
      }),
      hourly_rate: 80.0,
      deposit: 400.0,
      min_hours: 2,
      max_hours: 6,
      max_advance_days: 30,
      requires_supervision: 1,
      supervision_notes: 'Full cleanroom gowning protocol strictly enforced. No paper or cosmetic products allowed.',
      required_certifications: JSON.stringify(['Cleanroom Class 1000 Orientation', 'Hazardous Chemical Handling']),
      status: 'available',
      current_condition: 'pristine',
      condition_notes: 'Particle counters reading 42 particles/m³ (far exceeding standard).',
      tags: JSON.stringify(['cleanroom', 'semiconductor', 'microfabrication', 'space', 'wafers'])
    },
    {
      id: 'res_audio_studio',
      title: 'Spatial Audio & Acoustic Recording Chamber',
      description: 'Fully floating acoustic room-within-a-room with 7.1.4 Dolby Atmos surround monitoring, Genelec smart active monitors, Soundcraft Vi3000 mixing console, and ultra-low noise floor (NC-15 rating).',
      category: 'space',
      type: 'Acoustic Studio',
      owner_id: 'usr_manager',
      institution: 'Stanford Bio-X & Robotics',
      location: 'CCRMA / Media Arts Complex Studio A',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'
      ]),
      specs: JSON.stringify({
        'Noise Floor': 'NC-15 (<20 dBA)',
        'Monitoring': '7.1.4 Genelec Smart Active Monitor System with GLM calibration',
        'Preamps': 'Grace Design 8-channel + Rupert Neve Shelford Channels',
        'Microphones': 'Neumann U87, Sennheiser AMBEO VR Ambisonic Mic'
      }),
      hourly_rate: 30.0,
      deposit: 100.0,
      min_hours: 2,
      max_hours: 8,
      max_advance_days: 21,
      requires_supervision: 0,
      supervision_notes: 'Leave all calibrated faders in zero-detent after session concludes.',
      required_certifications: JSON.stringify(['MakerSpace Basic Safety Orientation']),
      status: 'available',
      current_condition: 'good',
      condition_notes: 'Monitor alignment recalibrated on Oct 20.',
      tags: JSON.stringify(['audio', 'acoustic', 'spatial-audio', 'studio', 'soundcraft', 'space'])
    },
    {
      id: 'res_robotics_arena',
      title: 'Autonomous Drone & Robotics Flight Arena',
      description: 'Enclosed 12m x 8m x 6m netted high-ceiling testing volume equipped with a 24-camera Vicon Vantage motion capture optical tracking system providing millimeter-precise ground-truth positioning at 330 Hz.',
      category: 'testing_rig',
      type: 'Robotics Arena',
      owner_id: 'usr_manager',
      institution: 'Carnegie Mellon University',
      location: 'Newell-Simon Hall, High-Bay Autonomous Systems Lab',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'
      ]),
      specs: JSON.stringify({
        'Volume': '12 x 8 x 6 meters netted safety perimeter',
        'Mocap': '24x Vicon Vantage V16 cameras (16 Megapixel)',
        'Position Accuracy': '< 0.5 mm at 330 frames per second',
        'Safety': 'Full ceiling-suspended emergency power cut kill-switches'
      }),
      hourly_rate: 50.0,
      deposit: 200.0,
      min_hours: 1,
      max_hours: 4,
      max_advance_days: 14,
      requires_supervision: 1,
      supervision_notes: 'All flight firmware must have geofence boundaries configured within the safety netting.',
      required_certifications: JSON.stringify(['MakerSpace Basic Safety Orientation']),
      status: 'available',
      current_condition: 'pristine',
      condition_notes: 'Vicon cameras recalibrated with calibration wand. Netting inspected.',
      tags: JSON.stringify(['robotics', 'arena', 'drone', 'vicon', 'motion-capture', 'testing_rig'])
    }
  ];

  const insertResource = db.prepare(`
    INSERT INTO resources (
      id, title, description, category, type, owner_id, institution, location,
      images, specs, hourly_rate, deposit, min_hours, max_hours, max_advance_days,
      requires_supervision, supervision_notes, required_certifications, status,
      current_condition, condition_notes, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  resources.forEach(r => insertResource.run(
    r.id, r.title, r.description, r.category, r.type, r.owner_id, r.institution, r.location,
    r.images, r.specs, r.hourly_rate, r.deposit, r.min_hours, r.max_hours, r.max_advance_days,
    r.requires_supervision, r.supervision_notes, r.required_certifications, r.status,
    r.current_condition, r.condition_notes, r.tags
  ));

  console.log('Seeding Bookings across the complete 10-step lifecycle...');

  // 1. Step 3 & 4: Pending Booking (submitted, awaiting approval, fair score computed)
  const booking1 = {
    id: 'bk_step3_pending',
    booking_code: 'NX-8921',
    resource_id: 'res_cnc_haas',
    user_id: 'usr_researcher',
    start_time: '2026-11-02T13:00:00Z',
    end_time: '2026-11-02T16:00:00Z',
    purpose: 'Academic Thesis / Core Research',
    project_title: 'Bio-Inspired Soft Robotic Gripper Finger Machining',
    supervisor_name: 'Prof. Henrik Christensen',
    status: 'pending_approval',
    rejection_reason: null,
    approval_notes: null,
    waitlist_position: null,
    fairness_priority_score: 82.5,
    fairness_breakdown: JSON.stringify({
      score: 82.5,
      breakdown: {
        purposePoints: 40,
        trustPoints: 18.8,
        waitlistBonus: 0,
        monopolizationPenalty: 0,
        recentHoursUsed: 2.5
      },
      explanation: "Purpose 'Academic Thesis': +40 pts | Institutional Trust (94%): +18.8 pts | Clean Usage: 2.5h this week"
    })
  };

  // 2. Step 5 & 6: Approved Booking (ready for check-in)
  const booking2 = {
    id: 'bk_step5_approved',
    booking_code: 'NX-8922',
    resource_id: 'res_confocal_microscope',
    user_id: 'usr_researcher',
    start_time: '2026-10-29T10:00:00Z',
    end_time: '2026-10-29T13:00:00Z',
    purpose: 'Academic Thesis / Core Research',
    project_title: 'Live Cell Fluorescent Protein Colocalization Study',
    supervisor_name: 'Dr. Sarah Chen',
    status: 'approved',
    rejection_reason: null,
    approval_notes: 'Approved by Dr. Chen. Laser alignment checklist assigned.',
    waitlist_position: null,
    fairness_priority_score: 88.0,
    fairness_breakdown: JSON.stringify({ score: 88.0, breakdown: { purposePoints: 40, trustPoints: 18.8 } })
  };

  // 3. Step 7: Checked-in Active Booking (User has completed digital check-in and condition report)
  const booking3 = {
    id: 'bk_step7_checkedin',
    booking_code: 'NX-8923',
    resource_id: 'res_phantom_camera',
    user_id: 'usr_student',
    start_time: '2026-10-28T09:00:00Z',
    end_time: '2026-10-28T14:00:00Z',
    purpose: 'Student Innovation / Capstone',
    project_title: 'Aerodynamic Drone Propeller Cavitation Analysis',
    supervisor_name: 'Prof. Miller',
    status: 'checked_in',
    rejection_reason: null,
    approval_notes: 'Approved for senior capstone session.',
    waitlist_position: null,
    fairness_priority_score: 75.0,
    fairness_breakdown: JSON.stringify({ score: 75.0, breakdown: { purposePoints: 25, trustPoints: 17.6 } })
  };

  // 4. Step 8: Completed Return with flawless inspection record
  const booking4 = {
    id: 'bk_step8_completed',
    booking_code: 'NX-8920',
    resource_id: 'res_robotics_arena',
    user_id: 'usr_researcher',
    start_time: '2026-10-25T14:00:00Z',
    end_time: '2026-10-25T17:00:00Z',
    purpose: 'Academic Thesis / Core Research',
    project_title: 'Autonomous Swarm Obstacle Avoidance Trials',
    supervisor_name: 'Dr. Sarah Chen',
    status: 'completed',
    rejection_reason: null,
    approval_notes: 'Approved and monitored via Vicon station.',
    waitlist_position: null,
    fairness_priority_score: 90.0,
    fairness_breakdown: JSON.stringify({ score: 90.0 })
  };

  // 5. Step 9: Incident Reported Booking (Damage discrepancy detected, AI analyzed)
  const booking5 = {
    id: 'bk_step9_incident',
    booking_code: 'NX-8918',
    resource_id: 'res_markforged_metal',
    user_id: 'usr_creator',
    start_time: '2026-10-24T11:00:00Z',
    end_time: '2026-10-24T16:00:00Z',
    purpose: 'Exploratory Prototyping',
    project_title: 'Titanium Heat Exchanger Shell',
    supervisor_name: 'Lab Assistant Josh',
    status: 'incident_reported',
    rejection_reason: null,
    approval_notes: 'Conditional approval granted.',
    waitlist_position: null,
    fairness_priority_score: 64.0,
    fairness_breakdown: JSON.stringify({ score: 64.0 })
  };

  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      id, booking_code, resource_id, user_id, start_time, end_time, purpose,
      project_title, supervisor_name, status, rejection_reason, approval_notes,
      waitlist_position, fairness_priority_score, fairness_breakdown
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [booking1, booking2, booking3, booking4, booking5].forEach(b => insertBooking.run(
    b.id, b.booking_code, b.resource_id, b.user_id, b.start_time, b.end_time, b.purpose,
    b.project_title, b.supervisor_name, b.status, b.rejection_reason, b.approval_notes,
    b.waitlist_position, b.fairness_priority_score, b.fairness_breakdown
  ));

  console.log('Seeding Check-in Records (Step 7)...');
  const insertCheckin = db.prepare(`
    INSERT INTO checkins (id, booking_id, checked_in_by, initial_condition_status, initial_notes, initial_photos, checklist_answers, pass_code, supervisor_signature)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Checkin for booking 3 (Active)
  insertCheckin.run(
    'chk_3',
    'bk_step7_checkedin',
    'usr_student',
    'good',
    'Lens clean, CineMag buffer mounted, safety power supply tested. Pre-existing cosmetic scuff on bottom mounting plate noted.',
    JSON.stringify(['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400']),
    JSON.stringify({ powerTest: true, lensCapInspected: true, tripodLocked: true }),
    'NX-PASS-7729',
    'Dr. Sarah Chen (Signed Digitally)'
  );

  // Checkin for booking 4 (Completed)
  insertCheckin.run(
    'chk_4',
    'bk_step8_completed',
    'usr_researcher',
    'pristine',
    'Safety netting intact, all 24 Vicon markers active and tracking cleanly.',
    JSON.stringify([]),
    JSON.stringify({ nettingInspected: true, emergencyKillWorking: true }),
    'NX-PASS-6610',
    'Self-Checked Verified'
  );

  // Checkin for booking 5 (Incident)
  insertCheckin.run(
    'chk_5',
    'bk_step9_incident',
    'usr_creator',
    'good',
    'Print bed leveled, vacuum seal holding, print head clean.',
    JSON.stringify([]),
    JSON.stringify({ nozzleClear: true, bedLeveled: true }),
    'NX-PASS-5541',
    'Josh Miller (Shop Tech)'
  );

  console.log('Seeding Return Records (Step 8)...');
  const insertReturn = db.prepare(`
    INSERT INTO returns (id, booking_id, returned_by, final_condition_status, final_notes, final_photos, consumables_used, cleanliness_rating, damage_detected, damage_description, deposit_refund_status, inspector_id, inspected_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Return for booking 4 (flawless)
  insertReturn.run(
    'ret_4',
    'bk_step8_completed',
    'usr_researcher',
    'pristine',
    'Session completed without issues. Quadcopters landed safely, floor swept, markers returned to storage drawer.',
    JSON.stringify([]),
    JSON.stringify({ flightHours: '2.5 hrs', batteryCycles: '4 cycles' }),
    5,
    0,
    null,
    'refunded',
    'usr_manager',
    '2026-10-25T17:15:00Z'
  );

  // Return for booking 5 (damage reported)
  insertReturn.run(
    'ret_5',
    'bk_step9_incident',
    'usr_creator',
    'damaged',
    'Filament jammed during extruder retract cycle. Nozzle collided with print bed causing cracked ceramic heating block.',
    JSON.stringify(['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400']),
    JSON.stringify({ metalFilamentSpoolMeters: '18.4m' }),
    2,
    1,
    'Ceramic extruder heating core cracked from bed collision. Print bed release sheet deeply gouged.',
    'held_for_review',
    'usr_manager',
    '2026-10-24T16:30:00Z'
  );

  console.log('Seeding Incidents & Damage Reports (Step 9)...');
  const insertIncident = db.prepare(`
    INSERT INTO incidents (id, booking_id, resource_id, reporter_id, incident_type, severity, description, photo_urls, estimated_cost, ai_analysis_summary, status, resolution_notes, resolved_by, resolved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertIncident.run(
    'inc_1',
    'bk_step9_incident',
    'res_markforged_metal',
    'usr_manager',
    'hardware_damage',
    'medium',
    'Extruder print head collision with build plate at layer 42. Replacement of ceramic heater core and PEI sheet required.',
    JSON.stringify(['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400']),
    220.0,
    'AI VISION SUMMARY: Discrepancy confirmed between pristine check-in and return state. Severity: MEDIUM. Root cause identified as rapid z-axis collision during manual feed override. Recommended deposit hold: $100 partial deduction, remaining $120 covered by Department Safety Contingency Fund.',
    'investigating',
    'Dr. Chen reviewing machine logs and gcode feedrate. Student scheduled for refresher orientation.',
    null,
    null
  );

  console.log('Seeding Immutable Audit Logs (Step 10)...');
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_name, actor_role, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const auditEvents = [
    {
      id: 'aud_1',
      entity_type: 'resource',
      entity_id: 'res_cnc_haas',
      action: 'LISTING_CREATED',
      actor_id: 'usr_manager',
      actor_name: 'Dr. Sarah Chen',
      actor_role: 'lab_manager',
      details: JSON.stringify({ resource: 'Haas VF-2 CNC Mill', hourlyRate: 35, requiredCert: '5-Axis CNC Mill Certified Operator' }),
      timestamp: '2026-10-20 09:00:00'
    },
    {
      id: 'aud_2',
      entity_type: 'booking',
      entity_id: 'bk_step3_pending',
      action: 'REQUEST_SUBMITTED',
      actor_id: 'usr_researcher',
      actor_name: 'Alex Rivera',
      actor_role: 'researcher',
      details: JSON.stringify({ purpose: 'Academic Thesis', fairnessScore: 82.5, timeWindow: '2026-11-02 13:00 to 16:00' }),
      timestamp: '2026-10-26 14:15:00'
    },
    {
      id: 'aud_3',
      entity_type: 'booking',
      entity_id: 'bk_step5_approved',
      action: 'REQUEST_APPROVED',
      actor_id: 'usr_manager',
      actor_name: 'Dr. Sarah Chen',
      actor_role: 'lab_manager',
      details: JSON.stringify({ decision: 'Approved', notes: 'Laser alignment checklist assigned' }),
      timestamp: '2026-10-27 10:30:00'
    },
    {
      id: 'aud_4',
      entity_type: 'booking',
      entity_id: 'bk_step7_checkedin',
      action: 'STEP7_CHECKIN_COMPLETED',
      actor_id: 'usr_student',
      actor_name: 'Maya Lin',
      actor_role: 'student',
      details: JSON.stringify({ initialCondition: 'good', passCode: 'NX-PASS-7729', initialNotes: 'Pre-existing cosmetic scuff noted.' }),
      timestamp: '2026-10-28 09:05:00'
    },
    {
      id: 'aud_5',
      entity_type: 'incident',
      entity_id: 'inc_1',
      action: 'STEP9_INCIDENT_FLAGGED',
      actor_id: 'usr_manager',
      actor_name: 'Dr. Sarah Chen',
      actor_role: 'lab_manager',
      details: JSON.stringify({ incidentType: 'hardware_damage', severity: 'medium', aiEstimatedCost: 220 }),
      timestamp: '2026-10-24 16:45:00'
    }
  ];

  auditEvents.forEach(a => insertAudit.run(a.id, a.entity_type, a.entity_id, a.action, a.actor_id, a.actor_name, a.actor_role, a.details, a.timestamp));

  console.log('Seeding Notifications...');
  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, is_read, link)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotification.run(
    'notif_1',
    'usr_researcher',
    'Booking Approved: Confocal Microscope',
    'Your request for Leica TCS SP8 Confocal Laser Microscope has been approved by Dr. Sarah Chen.',
    'approval',
    0,
    '/bookings'
  );
  insertNotification.run(
    'notif_2',
    'usr_manager',
    'New Booking Request: Haas CNC Mill',
    'Alex Rivera requested Haas VF-2 4-Axis CNC Milling Center for Nov 2, 2026 (Fairness Score: 82.5).',
    'request',
    0,
    '/lab-management'
  );
  insertNotification.run(
    'notif_3',
    'usr_creator',
    'Damage Review Pending: Markforged Metal X',
    'An incident report has been filed for booking NX-8918. Security deposit held pending inspection.',
    'damage_flag',
    0,
    '/incidents'
  );

  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
}

seed();
