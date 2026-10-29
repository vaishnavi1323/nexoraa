import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  Sparkles
} from 'lucide-react';
import { api, getActiveUser } from '../services/api';
import confetti from 'canvas-confetti';

export default function ManagerDashboard({ onOpenResolveIncident, refreshCount = 0 }) {
  const currentUser = getActiveUser();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [waitlistedBookings, setWaitlistedBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('requests'); // requests | incidents | waitlist
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [currentUser, refreshCount]);

  const loadDashboardData = async () => {
    try {
      const [allBookings, allIncidents] = await Promise.all([
        api.getBookings(),
        api.getIncidents()
      ]);

      setPendingBookings(allBookings.filter(b => b.status === 'pending_approval'));
      setWaitlistedBookings(allBookings.filter(b => b.status === 'waitlisted'));
      setIncidents(allIncidents);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (b) => {
    try {
      await api.approveBooking(b.id, actionNotes || 'Approved following standard facility safety protocol.');
      confetti({ particleCount: 50, spread: 50 });
      setActionNotes('');
      loadDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (b) => {
    const reason = prompt('Please provide transparent reason for decline (required by Consortium):', 'Priority allocated to departmental capstone exam.');
    if (!reason) return;
    try {
      await api.rejectBooking(b.id, reason);
      loadDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700">
            Institutional Safety &amp; Resource Governance
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Lab Manager &amp; Safety Officer Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant credentials, authorize access passes, monitor fair usage curves, and adjudicate damage reports.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Requests ({pendingBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Incidents ({incidents.filter(i => i.status !== 'resolved').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('waitlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'waitlist'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Waitlist ({waitlistedBookings.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        
        /* Pending Requests Queue (Steps 5 & 6) */
        <div className="space-y-4">
          {pendingBookings.length === 0 ? (
            <div className="p-16 text-center rounded-2xl border border-slate-200 bg-white shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">All Request Queues Cleared!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No bookings are currently pending human manager review. Switch to researcher persona to submit a new test request.
              </p>
            </div>
          ) : (
            pendingBookings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                        {b.booking_code}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Awaiting Manager Oversight (Step 5)
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
                      {b.resource_title}
                    </h3>

                    <p className="text-xs text-slate-700">
                      <strong>Applicant:</strong> {b.user_name} ({b.user_institution}) • Trust Rating: <span className="text-emerald-700 font-bold">{b.user_trust_score}%</span>
                    </p>

                    <p className="text-xs text-slate-600">
                      <strong>Project:</strong> {b.project_title} ({b.purpose})
                    </p>

                    <p className="text-xs text-slate-500 font-medium">
                      <strong>Time Window:</strong> {new Date(b.start_time).toLocaleString()} to {new Date(b.end_time).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Fairness Score Breakdown Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 lg:w-72 shrink-0 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-indigo-700">
                        Fairness Priority Score
                      </span>
                      <span className="text-sm font-extrabold text-emerald-700">
                        {b.fairness_priority_score} / 100
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {b.fairness_breakdown?.explanation || "Calculated using rolling 7-day usage & purpose weight."}
                    </p>
                    <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Monopolization Risk:</span>
                      <span className="text-emerald-700 font-semibold">Low (Clean Access)</span>
                    </div>
                  </div>

                </div>

                {/* Manager Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleReject(b)}
                    className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline with Reason (Step 6)</span>
                  </button>

                  <button
                    onClick={() => handleApprove(b)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Authorize Access Pass (Step 6)</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      ) : activeTab === 'incidents' ? (
        
        /* Incidents & Damage Queue (Step 9) */
        <div className="space-y-4">
          {incidents.length === 0 ? (
            <div className="p-16 text-center rounded-2xl border border-slate-200 bg-white shadow-xs">
              <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">Zero Active Equipment Incidents</h3>
              <p className="text-xs text-slate-500 mt-1">All facilities operating without reported hardware disputes.</p>
            </div>
          ) : (
            incidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-rose-700 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                        {inc.id}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        inc.status === 'resolved' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {inc.resource_title} — {inc.incident_type.replace('_', ' ').toUpperCase()}
                    </h3>
                  </div>

                  {inc.status !== 'resolved' && (
                    <button
                      onClick={() => onOpenResolveIncident(inc)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Adjudicate Incident (Step 9)
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600">
                  {inc.description}
                </p>

                {inc.ai_analysis_summary && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <span className="text-indigo-700 font-bold flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      AI Vision Root Cause:
                    </span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{inc.ai_analysis_summary}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      ) : (

        /* Waitlist & Prioritization (Anti-Monopolization) */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Explainable Dynamic Waitlist Algorithm Active</p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Queue positions are ordered mathematically based on purpose weights (Thesis &gt; Coursework &gt; Commercial), 
                institutional trust scores, starvation protection bonus (+1.5 pts/hour waiting), and anti-monopolization usage penalties.
              </p>
            </div>
          </div>

          {waitlistedBookings.length === 0 ? (
            <div className="p-16 text-center rounded-2xl border border-slate-200 bg-white shadow-xs">
              <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Bookings Currently Waitlisted</h3>
              <p className="text-xs text-slate-500 mt-1">Available slots accommodate all current reservation demand.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitlistedBookings.map((wb, idx) => (
                <div
                  key={wb.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 font-extrabold flex items-center justify-center text-sm border border-purple-200">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{wb.resource_title}</h4>
                      <p className="text-[11px] text-slate-500">{wb.user_name} • {wb.purpose}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-700 block">{wb.fairness_priority_score} pts</span>
                    <span className="text-[10px] text-slate-500">Fairness Rank</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      )}

    </div>
  );
}
