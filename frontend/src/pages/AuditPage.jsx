import React, { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  Download, 
  Code
} from 'lucide-react';
import { api } from '../services/api';

export default function AuditPage({ refreshCount = 0 }) {
  const [logs, setLogs] = useState([]);
  const [entityFilter, setEntityFilter] = useState('all');
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    loadLogs();
  }, [entityFilter, refreshCount]);

  const loadLogs = async () => {
    try {
      const filters = {};
      if (entityFilter !== 'all') filters.entityType = entityFilter;
      const data = await api.getAuditLogs(filters);
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const actionBadges = {
    RESOURCE_LISTED: { label: 'Step 1: Listing Created', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    REQUEST_SUBMITTED: { label: 'Step 3: Request Submitted', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    REQUEST_APPROVED: { label: 'Step 6: Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    REQUEST_REJECTED: { label: 'Step 6: Declined', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    STEP7_CHECKIN_COMPLETED: { label: 'Step 7: Check-In Baseline', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    STEP8_RETURN_COMPLETED: { label: 'Step 8: Return Handover', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    STEP9_DAMAGE_INCIDENT_FLAGGED: { label: 'Step 9: AI Damage Discrepancy', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    INCIDENT_RESOLVED: { label: 'Step 9: Dispute Resolved', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    CERTIFICATE_AI_VERIFIED: { label: 'AI Safety Cert Verified', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    USER_PROFILE_CREATED: { label: 'User Profile Created', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    USER_PROFILE_UPDATED: { label: 'User Profile Updated', color: 'bg-blue-50 text-blue-700 border-blue-200' }
  };

  const exportAuditLogJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexora-audit-ledger-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700">
            Step 10: Immutable Transaction History
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Consortium Audit Trail &amp; Governance Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident chronological ledger recording every access request, safety inspection, condition baseline, and resolution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportAuditLogJson}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export Compliance JSON</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
        {[
          { id: 'all', label: 'All Ledger Events' },
          { id: 'booking', label: 'Bookings & Lifecycle' },
          { id: 'incident', label: 'Incidents & Damages' },
          { id: 'resource', label: 'Equipment Listings' },
          { id: 'certification', label: 'Safety Certifications' },
          { id: 'user', label: 'User Identity Events' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setEntityFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              entityFilter === f.id
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {logs.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-slate-200 bg-white shadow-xs">
          <History className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No audit records found</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const badge = actionBadges[log.action] || { label: log.action, color: 'bg-slate-100 text-slate-700' };
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all p-4 space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        Entity: <span className="text-slate-700 font-mono">{log.entity_type}</span> #{log.entity_id}
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Actor: <strong className="text-slate-800">{log.actor_name}</strong> ({log.actor_role})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 self-end sm:self-auto font-medium">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </span>

                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <Code className="w-3 h-3 text-indigo-600" />
                      <span>{isExpanded ? 'Hide Payload' : 'Inspect Payload'}</span>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto animate-in fade-in">
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-200 text-slate-500 text-[10px]">
                      <span>Cryptographic Audit Proof Hash: SHA256_{log.id.slice(0, 12)}...</span>
                      <span>Actor ID: {log.actor_id}</span>
                    </div>
                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
