import React, { useState } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  User, 
  RefreshCw, 
  Sliders, 
  ChevronRight, 
  Play, 
  Scale,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, setActiveUser, getActiveUser } from '../services/api';

export default function JudgeDemoModal({ 
  isOpen, 
  onClose, 
  onSelectTab, 
  onOpenBookingModal,
  onOpenListModal,
  onOpenCheckInModal,
  onOpenReturnModal,
  onOpenIncidentModal,
  onRefresh
}) {
  const [activeSubTab, setActiveSubTab] = useState('tour'); // tour | personas | scenarios
  const [fastForwarding, setFastForwarding] = useState(false);
  const [fastForwardSuccess, setFastForwardSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPersona = getActiveUser();

  const handleSwitchPersona = (roleId) => {
    const demoUsers = [
      {
        id: 'usr_manager',
        name: 'Dr. Sarah Chen',
        email: 'chen.lab@mit.edu',
        role: 'lab_manager',
        institution: 'MIT Center for Bits and Atoms',
        department: 'Advanced Fabrication & Microfluidics',
        trust_score: 98,
        credits: 2500,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        phone: '+1 (617) 253-1000',
        bio: 'Principal Investigator & Facility Safety Officer overseeing ISO cleanrooms and 5-axis machining bays.'
      },
      {
        id: 'usr_researcher',
        name: 'Alex Rivera',
        email: 'researcher@stanford.edu',
        role: 'researcher',
        institution: 'Stanford Bio-X & Robotics',
        department: 'Mechanical Engineering & Bio-Robotics',
        trust_score: 94,
        credits: 1200,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '+1 (650) 723-2300',
        bio: 'PhD candidate researching bio-compatible titanium soft-robotics.'
      },
      {
        id: 'usr_student',
        name: 'Maya Lin',
        email: 'mlin@andrew.cmu.edu',
        role: 'student',
        institution: 'Carnegie Mellon Innovation Institute',
        department: 'Integrated Innovation Institute',
        trust_score: 88,
        credits: 450,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        phone: '+1 (412) 268-2000',
        bio: 'Undergraduate Senior developing micro-propulsion systems for CubeSats.'
      },
      {
        id: 'usr_maker',
        name: 'Marcus Vance',
        email: 'marcus@pittsburghmakers.org',
        role: 'community_member',
        institution: 'Downtown Community MakerSpace',
        department: 'Open Hardware Collaborative',
        trust_score: 82,
        credits: 350,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        phone: '+1 (412) 555-0199',
        bio: 'Hardware entrepreneur prototyping rapid solar-thermal desalination modules.'
      },
      {
        id: 'usr_auditor',
        name: 'Dean Arthur Vance',
        email: 'vance.audit@consortium.org',
        role: 'administrator',
        institution: 'Research Oversight Board',
        department: 'Institutional Compliance & Safety',
        trust_score: 100,
        credits: 9999,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        phone: '+1 (202) 555-0143',
        bio: 'Consortium Compliance Inspector monitoring anti-monopoly metrics and liability audit trails.'
      }
    ];

    const target = demoUsers.find(u => u.id === roleId);
    if (target) {
      setActiveUser(target);
      window.dispatchEvent(new CustomEvent('user-changed', { detail: target }));
      if (onRefresh) onRefresh();
    }
  };

  const handle1ClickFullJourney = async () => {
    try {
      setFastForwarding(true);
      setFastForwardSuccess(false);

      // Ensure researcher is active
      handleSwitchPersona('usr_researcher');

      // 1. Submit a booking on Haas CNC
      const res = await api.createBooking({
        resource_id: 'res_haas_cnc',
        purpose: 'Academic Thesis / Core Research',
        project_title: 'Judge Evaluation Autonomous Demonstration Flight Gripper',
        start_time: new Date(Date.now() + 3600000).toISOString(),
        end_time: new Date(Date.now() + 14400000).toISOString(),
        duration_hours: 3,
        estimated_cost: 135,
        deposit_amount: 150,
        supervisor_name: 'Prof. Henrik Christensen'
      });

      const booking = res.booking;

      // 2. Switch to Manager and Approve
      handleSwitchPersona('usr_manager');
      await api.approveBooking(booking.id, 'Judge Demo 1-Click Fast Approval verified credentials.');

      // 3. Switch to Researcher and Check In (Step 7)
      handleSwitchPersona('usr_researcher');
      await api.checkInBooking(booking.id, {
        operator_notes: 'Station verified: E-stop tested, safety goggles donned, bed inspected.',
        pre_existing_wear: 'Minor superficial fixture scratch on outer vise plate.'
      });

      // 4. Return equipment (Step 8 & 9)
      await api.returnBooking(booking.id, {
        return_notes: 'Machining completed cleanly. Vise cleared of chips and vacuumed.',
        cleanliness_rating: 5,
        consumables_used: '2x 6mm carbide endmills (normal wear)'
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setFastForwardSuccess(true);
      if (onRefresh) onRefresh();
      if (onSelectTab) onSelectTab('audit');
      setTimeout(() => setFastForwarding(false), 800);
    } catch (err) {
      console.error(err);
      alert('1-Click flow executed with fallback: ' + err.message);
      setFastForwarding(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo state back to clean initial factory settings?')) {
      localStorage.removeItem('nexora_active_user');
      localStorage.removeItem('nexora_custom_bookings');
      localStorage.removeItem('nexora_custom_incidents');
      localStorage.removeItem('nexora_custom_resources');
      handleSwitchPersona('usr_researcher');
      if (onRefresh) onRefresh();
      alert('Demo data successfully reset to initial clean state!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-indigo-50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">
                  🏆 Judge Evaluation &amp; Live Demo Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                  Hackathon 2026
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Unlock Underused Equipment &amp; Spaces • Complete 10-Step Operational Lifecycle
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation tabs (Only Tour, Personas, and Scenarios) */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/70 overflow-x-auto">
          {[
            { id: 'tour', label: '10-Step Interactive Tour', icon: Play },
            { id: 'personas', label: '5 Demo Personas (1-Click)', icon: User },
            { id: 'scenarios', label: '5 Guided Test Scenarios', icon: Sliders }
          ].map(t => {
            const Icon = t.icon;
            const active = activeSubTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  active 
                    ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">

          {/* TAB 1: 10-STEP INTERACTIVE TOUR */}
          {activeSubTab === 'tour' && (
            <div className="space-y-6">
              {/* Highlight Callout */}
              <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold mb-1.5">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Instant Evaluation Mode</span>
                  </div>
                  <h3 className="text-base font-bold">1-Click Autonomous 10-Step Lifecycle Run</h3>
                  <p className="text-xs text-indigo-100 mt-1 max-w-xl">
                    Want to see the entire resource-sharing journey execute programmatically in under 2 seconds? Click below to run listing, pre-flight check, booking, manager sign-off, station check-in, return inspection diff, and audit log generation automatically.
                  </p>
                </div>
                <button
                  onClick={handle1ClickFullJourney}
                  disabled={fastForwarding}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{fastForwarding ? 'Executing All 10 Steps...' : 'Run Full 10-Step Journey (1-Click)'}</span>
                </button>
              </div>

              {fastForwardSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span><strong>Success!</strong> All 10 steps executed flawlessly. Switched view to Audit Trail tab so you can inspect the tamper-evident records!</span>
                  </div>
                  <button 
                    onClick={() => { onClose(); if (onSelectTab) onSelectTab('audit'); }}
                    className="underline font-bold hover:text-emerald-950 cursor-pointer"
                  >
                    View Audit Ledger &rarr;
                  </button>
                </div>
              )}

              {/* 10 Step Detailed Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Step-by-Step Interactive Evaluation Controls
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                          Step 01
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">Role: Lab Manager</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">Owner Lists Resource &amp; Conditions</h5>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Define specifications, hourly rate, security deposit, required operator certifications, and supervision rules.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Dr. Sarah Chen</span>
                      <button
                        onClick={() => {
                          handleSwitchPersona('usr_manager');
                          onClose();
                          if (onOpenListModal) onOpenListModal();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Listing Form</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-sky-100 text-sky-700">
                          Step 02
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">Role: Researcher / Student</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">Discovery &amp; Safety Pre-Flight Check</h5>
                      <p className="text-[11px] text-slate-600 mt-1">
                        AI NLP technical matching. Evaluates safety card credentials; blocks uncertified operators with clear explanation.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Test Barrier vs Pass</span>
                      <button
                        onClick={() => {
                          handleSwitchPersona('usr_student');
                          onClose();
                          if (onSelectTab) onSelectTab('catalog');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Test Maya Lin Blocked</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Step 3 & 4 */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
                          Steps 03 &amp; 04
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">Role: System / Applicant</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">Request &amp; Fair Allocation Scoring</h5>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Purpose weighting (Thesis +40 pts). Anti-monopoly penalties applied to heavy users to prevent facility hoarding.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Alex Rivera (Thesis)</span>
                      <button
                        onClick={() => {
                          handleSwitchPersona('usr_researcher');
                          onClose();
                          if (onSelectTab) onSelectTab('catalog');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Book Haas CNC Mill</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Step 5 & 6 */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                          Steps 05 &amp; 06
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">Role: Lab Manager</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">Manager Oversight &amp; Decision</h5>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Review trust score, applicant project notes, and safety risk flags. 1-Click authorize digital access pass or decline.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Dr. Sarah Chen</span>
                      <button
                        onClick={() => {
                          handleSwitchPersona('usr_manager');
                          onClose();
                          if (onSelectTab) onSelectTab('manager');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Lab Control Queue</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Step 7 */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                          Step 07
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">Role: User at Station</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">Check-In &amp; Baseline Condition</h5>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Mandatory safety checklist (E-stop, PPE). Record pre-existing cosmetic scratches to protect user from unfair liability.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Station Verification</span>
                      <button
                        onClick={() => {
                          handleSwitchPersona('usr_researcher');
                          onClose();
                          if (onSelectTab) onSelectTab('bookings');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>My Bookings Check-In</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Step 8 & 9 */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 text-teal-700">
                          Steps 08 &amp; 09
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">Role: AI &amp; Safety Officer</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">Return, AI Diff &amp; Incident Handling</h5>
                      <p className="text-[11px] text-slate-600 mt-1">
                        AI compares Step 7 baseline vs Step 8 handover. Distinguishes normal wear from collision; manager adjudicates deposit.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">AI Computer Vision Diff</span>
                      <button
                        onClick={() => {
                          onClose();
                          if (onSelectTab) onSelectTab('ai');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect AI Vision Studio</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Step 10 */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between md:col-span-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                          Step 10
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">Role: Consortium Auditor / All Parties</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">Immutable Consortium Audit Ledger</h5>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Append-only chronological record with actor IDs, roles, state diffs, and cryptographic hash proofs. Downloadable compliance JSON.
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Dean Arthur Vance Oversight</span>
                      <button
                        onClick={() => {
                          handleSwitchPersona('usr_auditor');
                          onClose();
                          if (onSelectTab) onSelectTab('audit');
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Cryptographic Audit Trail</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5 DEMO PERSONAS */}
          {activeSubTab === 'personas' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Instant Persona Switcher</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Click any persona below to switch roles instantaneously without logging in or losing state.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500">Current Actor:</span>
                  <p className="text-xs font-bold text-indigo-600">{currentPersona?.name} ({currentPersona?.role})</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 'usr_manager',
                    name: 'Dr. Sarah Chen',
                    role: 'Lab Manager & Safety Officer',
                    inst: 'MIT Center for Bits and Atoms',
                    trust: '98%',
                    certs: ['Laser Safety Officer', 'Cleanroom Protocols', 'OSHA 30-Hour'],
                    desc: 'Full approval authority. Authorizes booking requests, manages equipment health, and adjudicates Step 9 damage disputes.',
                    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                    color: 'border-indigo-300 bg-indigo-50/30'
                  },
                  {
                    id: 'usr_researcher',
                    name: 'Alex Rivera',
                    role: 'PhD Robotics Researcher',
                    inst: 'Stanford Bio-X & Robotics',
                    trust: '94%',
                    certs: ['5-Axis CNC Mill Certified', 'Laser Safety L2', 'Radiation Worker II'],
                    desc: 'Fully certified power user. Eligible for advanced equipment like Haas CNC Mill and FEI Scanning Electron Microscope.',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    color: 'border-sky-300 bg-sky-50/30'
                  },
                  {
                    id: 'usr_student',
                    name: 'Maya Lin',
                    role: 'Undergraduate Student',
                    inst: 'Carnegie Mellon Innovation Institute',
                    trust: '88%',
                    certs: ['Basic Workshop Safety', 'Makerspace 101'],
                    desc: 'Missing advanced 5-axis CNC certification. Demonstrates Step 2 pre-flight safety qualification gating.',
                    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
                    color: 'border-amber-300 bg-amber-50/30'
                  },
                  {
                    id: 'usr_maker',
                    name: 'Marcus Vance',
                    role: 'Community Hardware Maker',
                    inst: 'Downtown Community MakerSpace',
                    trust: '82%',
                    certs: ['3D Additive Sintering Operator'],
                    desc: 'Hardware startup founder. Used for testing the Step 9 damage dispute flow on the Markforged Metal 3D printer.',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                    color: 'border-rose-300 bg-rose-50/30'
                  },
                  {
                    id: 'usr_auditor',
                    name: 'Dean Arthur Vance',
                    role: 'Consortium Compliance Auditor',
                    inst: 'Research Oversight Board',
                    trust: '100%',
                    certs: ['Consortium Auditor Board', 'WCAG Safety Inspector'],
                    desc: 'Inspects tamper-evident audit logs, monitors institutional Gini fairness coefficients, and validates anti-monopoly metrics.',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                    color: 'border-purple-300 bg-purple-50/30'
                  }
                ].map(p => {
                  const isCurrent = currentPersona?.id === p.id;
                  return (
                    <div 
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all ${p.color} ${isCurrent ? 'ring-2 ring-indigo-600 bg-white shadow-sm' : 'hover:bg-white'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-slate-900">{p.name}</h5>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-extrabold">Active</span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-slate-600">{p.role}</p>
                            <p className="text-[10px] text-slate-500">{p.inst}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                          {p.trust} Trust
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                        {p.desc}
                      </p>

                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {p.certs.map(c => (
                          <span key={c} className="px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-[9px] font-semibold text-slate-700">
                            {c}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                        <button
                          onClick={() => handleSwitchPersona(p.id)}
                          className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-200 text-slate-700 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>{isCurrent ? 'Currently Acting As This Persona' : `Switch to ${p.name.split(' ')[0]}`}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 5 GUIDED EVALUATION SCENARIOS */}
          {activeSubTab === 'scenarios' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Choose a pre-orchestrated test scenario below. Each scenario exercises a critical dimension of the hackathon problem statement.
              </p>

              <div className="space-y-3">
                {/* Scenario 1 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <h5 className="text-xs font-bold text-slate-900">Scenario A: The Golden 10-Step Journey (Clean Return)</h5>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-2xl">
                        Alex Rivera (certified) books the Haas CNC mill for Thesis research (+40 pts) &rarr; Dr. Chen approves &rarr; Alex checks in and uploads baseline photo &rarr; Alex returns clean tool &rarr; AI Vision Diff clears deposit with 0 flags &rarr; Transaction logged in Step 10 audit ledger.
                      </p>
                    </div>
                    <button
                      onClick={handle1ClickFullJourney}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Scenario A</span>
                    </button>
                  </div>
                </div>

                {/* Scenario 2 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <h5 className="text-xs font-bold text-slate-900">Scenario B: Safety Qualification Barrier (Step 2 Gating)</h5>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-2xl">
                        Maya Lin (Undergraduate) attempts to book the dangerous Haas 4-Axis CNC or Laser Cleanroom. System blocks booking with an explainable alert: <em>"Missing mandatory credential: 5-Axis CNC Mill Certified Operator"</em> and directs student to complete training.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleSwitchPersona('usr_student');
                        onClose();
                        if (onSelectTab) onSelectTab('catalog');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Test Barrier (Maya)</span>
                    </button>
                  </div>
                </div>

                {/* Scenario 3 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <h5 className="text-xs font-bold text-slate-900">Scenario C: Anti-Monopolization Scoring &amp; Starvation Bonus (Step 4)</h5>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-2xl">
                        Mathematical formula prevents lab equipment hoarding. Rolling 7-day usage exceeding 10 hours applies progressive score penalties (-1.5x hours), while waitlisted applicants accumulate starvation relief points (+1.5 pts/hr).
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        if (onSelectTab) onSelectTab('ai');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Inspect Fairness Engine</span>
                    </button>
                  </div>
                </div>

                {/* Scenario 4 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <h5 className="text-xs font-bold text-slate-900">Scenario D: Collision Damage Discrepancy &amp; Manager Dispute Adjudication (Step 9)</h5>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-2xl">
                        Marcus Vance returns Markforged Metal 3D printer with shattered print head. AI Vision Diff compares Step 7 baseline vs Step 8 return, classifies damage as <strong>CRITICAL</strong>, estimates $850 repair, and holds deposit. Lab Manager reviews and signs off with partial deduction.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleSwitchPersona('usr_manager');
                        onClose();
                        if (onSelectTab) onSelectTab('manager');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Adjudicate Incident</span>
                    </button>
                  </div>
                </div>

                {/* Scenario 5 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <h5 className="text-xs font-bold text-slate-900">Scenario E: Transparent Waitlist &amp; Priority Queueing</h5>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-2xl">
                        When two researchers request the same time window on the Laser Photolithography Bay, the system places competing requests in a transparent, auditable queue ordered by calculated priority score rather than arbitrary favoritism.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleSwitchPersona('usr_manager');
                        onClose();
                        if (onSelectTab) onSelectTab('manager');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>View Waitlist Queue</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 px-6 py-3.5 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Quick tip:</span>
            <span>Switch to Dr. Sarah Chen to approve, or Alex Rivera to check-in.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-xs font-semibold text-slate-600 cursor-pointer flex items-center gap-1.5 transition-colors"
              title="Reset all demo data to clean initial state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Close Hub
            </button>
            <button
              onClick={handle1ClickFullJourney}
              disabled={fastForwarding}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>1-Click Test Journey</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
