import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Send, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle, 
  LogIn, 
  LogOut, 
  AlertOctagon, 
  ScrollText,
  Info
} from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Resource Listed',
    role: 'Owner',
    desc: 'Owner specifies availability, required certs & supervision rules.',
    icon: PlusCircle,
    color: 'text-indigo-600 border-indigo-200 bg-indigo-50'
  },
  {
    step: 2,
    title: 'Eligibility Check',
    role: 'User & System',
    desc: 'System pre-checks user training, safety badges & remaining quota.',
    icon: Search,
    color: 'text-sky-600 border-sky-200 bg-sky-50'
  },
  {
    step: 3,
    title: 'Request Submitted',
    role: 'User',
    desc: 'Booking requested with project purpose, timeslot & supervisor.',
    icon: Send,
    color: 'text-blue-600 border-blue-200 bg-blue-50'
  },
  {
    step: 4,
    title: 'Fair Allocation',
    role: 'AI Engine',
    desc: 'System computes explainable fairness score & detects conflicts.',
    icon: ShieldCheck,
    color: 'text-indigo-600 border-indigo-200 bg-indigo-50'
  },
  {
    step: 5,
    title: 'Manager Review',
    role: 'Lab Manager',
    desc: 'Human oversight verifies project feasibility & safety risks.',
    icon: UserCheck,
    color: 'text-purple-600 border-purple-200 bg-purple-50'
  },
  {
    step: 6,
    title: 'Decision & Pass',
    role: 'System',
    desc: 'Approved with pass code or transparently placed in queue.',
    icon: CheckCircle,
    color: 'text-emerald-600 border-emerald-200 bg-emerald-50'
  },
  {
    step: 7,
    title: 'Check-In Baseline',
    role: 'Station Pass',
    desc: 'Pre-use checklist, photo verification & pre-existing wear recorded.',
    icon: LogIn,
    color: 'text-amber-600 border-amber-200 bg-amber-50'
  },
  {
    step: 8,
    title: 'Return Handover',
    role: 'User & Tech',
    desc: 'Post-use inspection, consumables logged & deposit released.',
    icon: LogOut,
    color: 'text-teal-600 border-teal-200 bg-teal-50'
  },
  {
    step: 9,
    title: 'Damage Review',
    role: 'AI & Safety',
    desc: 'Wear vs damage discrepancy flagged by AI, deposit hold resolved.',
    icon: AlertOctagon,
    color: 'text-rose-600 border-rose-200 bg-rose-50'
  },
  {
    step: 10,
    title: 'Immutable Ledger',
    role: 'Consortium',
    desc: 'Tamper-evident history timeline viewable by all parties.',
    icon: ScrollText,
    color: 'text-slate-700 border-slate-200 bg-slate-100'
  }
];

export default function LifecycleStepper({ currentStep = 2 }) {
  const [selectedInfo, setSelectedInfo] = useState(null);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-700">
            End-to-End Resource Sharing Lifecycle
          </span>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            10-Step Hackathon Workflow Verified
          </span>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">
          Click any step to inspect governance &amp; accountability rules
        </p>
      </div>

      {/* 10 Step Pipeline Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isCurrent = s.step === currentStep;
          return (
            <button
              key={s.step}
              onClick={() => setSelectedInfo(s)}
              className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between group cursor-pointer ${
                isCurrent 
                  ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs' 
                  : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-indigo-600">
                  0{s.step}
                </span>
                <div className={`p-1 rounded-lg border ${s.color}`}>
                  <Icon className="w-3 h-3" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">
                  {s.title}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {s.role}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Popover Modal / Drawer if clicked */}
      {selectedInfo && (
        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl border ${selectedInfo.color} shrink-0`}>
              <selectedInfo.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">
                  Step {selectedInfo.step}: {selectedInfo.title}
                </h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200 font-semibold">
                  Actor: {selectedInfo.role}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {selectedInfo.desc}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedInfo(null)}
            className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
