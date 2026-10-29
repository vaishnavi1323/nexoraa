import React, { useState } from 'react';
import { 
  Award, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Play, 
  X, 
  Minimize2, 
  Maximize2, 
  User, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { getActiveUser, setActiveUser } from '../services/api';

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Owner Lists Resource',
    role: 'Lab Manager (Dr. Sarah Chen)',
    roleId: 'usr_manager',
    tab: 'catalog',
    instruction: 'Dr. Sarah Chen defines safety qualifications, rates, and deposits for equipment.',
    actionLabel: 'List Resource Form',
    actionType: 'open_list'
  },
  {
    step: 2,
    title: 'Discovery & Pre-Flight Gating',
    role: 'Student (Maya Lin) vs Researcher',
    roleId: 'usr_student',
    tab: 'catalog',
    instruction: 'Maya Lin lacks 5-Axis CNC cert (blocked). Alex Rivera holds cert (eligible).',
    actionLabel: 'Test Pre-Flight Check',
    actionType: 'nav_catalog'
  },
  {
    step: 3,
    title: 'Purpose-Weighted Request',
    role: 'Researcher (Alex Rivera)',
    roleId: 'usr_researcher',
    tab: 'catalog',
    instruction: 'Alex submits thesis research request with supervisor endorsement (+40 pts).',
    actionLabel: 'Book Haas CNC',
    actionType: 'nav_catalog'
  },
  {
    step: 4,
    title: 'Fair Allocation Scoring',
    role: 'Consortium Fairness Engine',
    roleId: 'usr_researcher',
    tab: 'ai',
    instruction: 'Formula penalizes heavy 7-day rolling usage and rewards waiting starvation.',
    actionLabel: 'Inspect Fairness Math',
    actionType: 'nav_ai'
  },
  {
    step: 5,
    title: 'Manager Oversight & Review',
    role: 'Lab Manager (Dr. Sarah Chen)',
    roleId: 'usr_manager',
    tab: 'manager',
    instruction: 'Dr. Sarah Chen inspects applicant trust rating and project abstract.',
    actionLabel: 'Open Review Queue',
    actionType: 'nav_manager'
  },
  {
    step: 6,
    title: 'Digital Pass Authorization',
    role: 'Lab Manager (Dr. Sarah Chen)',
    roleId: 'usr_manager',
    tab: 'manager',
    instruction: 'Manager authorizes access pass NX-PASS-XXXX or declines with transparent reason.',
    actionLabel: 'Authorize Pass',
    actionType: 'nav_manager'
  },
  {
    step: 7,
    title: 'Station Check-In & Baseline',
    role: 'Researcher (Alex Rivera)',
    roleId: 'usr_researcher',
    tab: 'bookings',
    instruction: 'Operator verifies E-stop/PPE checklist and logs pre-existing wear baseline photo.',
    actionLabel: 'Go to Check-In',
    actionType: 'nav_bookings'
  },
  {
    step: 8,
    title: 'Station Return & Handover',
    role: 'Researcher (Alex Rivera)',
    roleId: 'usr_researcher',
    tab: 'bookings',
    instruction: 'Operator records clean return, logs consumables used, and rates cleanliness.',
    actionLabel: 'Go to Return',
    actionType: 'nav_bookings'
  },
  {
    step: 9,
    title: 'AI Vision Diff & Damage Handling',
    role: 'AI Engine & Safety Officer',
    roleId: 'usr_manager',
    tab: 'ai',
    instruction: 'AI compares Step 7 baseline vs Step 8 return. Flagged damage holds deposit.',
    actionLabel: 'View Vision Diff',
    actionType: 'nav_ai'
  },
  {
    step: 10,
    title: 'Immutable Audit Ledger',
    role: 'Consortium Auditor (Dean Arthur Vance)',
    roleId: 'usr_auditor',
    tab: 'audit',
    instruction: 'Chronological append-only record of every state change with SHA256 integrity proofs.',
    actionLabel: 'Inspect Audit Ledger',
    actionType: 'nav_audit'
  }
];

export default function DemoTourBanner({
  onOpenJudgeHub,
  onSelectTab,
  onOpenListModal,
  onRefresh
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const activePersona = getActiveUser();
  const step = TOUR_STEPS[currentStepIdx];

  if (isDismissed) return null;

  const handleNext = () => {
    setCurrentStepIdx((prev) => (prev + 1) % TOUR_STEPS.length);
  };

  const handlePrev = () => {
    setCurrentStepIdx((prev) => (prev - 1 + TOUR_STEPS.length) % TOUR_STEPS.length);
  };

  const handleExecuteStep = () => {
    // 1. Switch persona if required
    if (step.roleId && activePersona.id !== step.roleId) {
      const demoUsers = {
        usr_manager: {
          id: 'usr_manager',
          name: 'Dr. Sarah Chen',
          email: 'chen.lab@mit.edu',
          role: 'lab_manager',
          institution: 'MIT Center for Bits and Atoms',
          department: 'Advanced Fabrication & Microfluidics',
          trust_score: 98,
          credits: 2500,
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          bio: 'Principal Investigator & Facility Safety Officer.'
        },
        usr_researcher: {
          id: 'usr_researcher',
          name: 'Alex Rivera',
          email: 'researcher@stanford.edu',
          role: 'researcher',
          institution: 'Stanford Bio-X & Robotics',
          department: 'Mechanical Engineering & Bio-Robotics',
          trust_score: 94,
          credits: 1200,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          bio: 'PhD candidate researching soft-robotics.'
        },
        usr_student: {
          id: 'usr_student',
          name: 'Maya Lin',
          email: 'mlin@andrew.cmu.edu',
          role: 'student',
          institution: 'Carnegie Mellon Innovation Institute',
          department: 'Integrated Innovation Institute',
          trust_score: 88,
          credits: 450,
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
          bio: 'Undergraduate Senior developing micro-propulsion.'
        },
        usr_auditor: {
          id: 'usr_auditor',
          name: 'Dean Arthur Vance',
          email: 'vance.audit@consortium.org',
          role: 'administrator',
          institution: 'Research Oversight Board',
          department: 'Institutional Compliance & Safety',
          trust_score: 100,
          credits: 9999,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          bio: 'Consortium Compliance Inspector.'
        }
      };

      const target = demoUsers[step.roleId];
      if (target) {
        setActiveUser(target);
        window.dispatchEvent(new CustomEvent('user-changed', { detail: target }));
        if (onRefresh) onRefresh();
      }
    }

    // 2. Navigate to appropriate tab / action
    if (step.actionType === 'open_list') {
      if (onSelectTab) onSelectTab('catalog');
      if (onOpenListModal) onOpenListModal();
    } else if (step.tab && onSelectTab) {
      onSelectTab(step.tab);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40 animate-in fade-in">
        <button
          onClick={() => setIsMinimized(false)}
          className="px-3 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer transition-all border border-indigo-400"
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Judge Guide: Step {step.step}/10</span>
          <Maximize2 className="w-3.5 h-3.5 text-indigo-200" />
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="Judge Demo Walkthrough" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-40 animate-in slide-in-from-bottom-3 duration-300">
      <div className="rounded-2xl border border-indigo-200 bg-white/95 backdrop-blur-md shadow-xl p-3.5 sm:p-4 text-slate-900 overflow-hidden">
        
        {/* Top Header in Banner */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-300" />
              <span>Step {step.step} of 10</span>
            </span>
            <span className="text-xs font-bold text-slate-900 truncate">
              {step.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenJudgeHub}
              className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
              title="Open full Judge Evaluation Hub modal"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Judge Hub</span>
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Minimize guide"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Close guide"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step description */}
        <p className="text-[11px] text-slate-600 leading-snug mb-3">
          {step.instruction}
        </p>

        {/* Navigation & Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs cursor-pointer"
              title="Previous step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] font-medium text-slate-500 px-1">
              {step.step}/10
            </span>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs cursor-pointer"
              title="Next step"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] text-slate-400">
              Ideal Actor: {step.role.split(' ')[0]}
            </span>

            <button
              onClick={handleExecuteStep}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{step.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
