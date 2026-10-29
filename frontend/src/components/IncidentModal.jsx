import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function IncidentModal({ incident, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('Reviewed g-code logs. Mechanical collision verified. Operator scheduled for 30-min refresher safety orientation. Partial repair cost deducted from deposit.');
  const [depositAction, setDepositAction] = useState('partially_retained');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleResolve = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await api.resolveIncident(incident.id, resolutionNotes, depositAction);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resolve incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
              Step 9: Incident &amp; Safety Governance Review
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Resolve Incident #{incident.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleResolve} className="p-6 space-y-4">
          
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Resource: <strong className="text-slate-900">{incident.resource_title}</strong></span>
              <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                {incident.severity} Severity
              </span>
            </div>
            <p className="text-slate-700">
              <strong>Reported Issue:</strong> {incident.description}
            </p>
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-medium">
              <span>Reported by: {incident.reporter_name}</span>
              <span>Booking Code: <span className="font-mono text-indigo-700 font-bold">{incident.booking_code}</span></span>
            </div>
          </div>

          {/* AI Analysis Box */}
          {incident.ai_analysis_summary && (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Vision &amp; Discrepancy Assessment</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {incident.ai_analysis_summary}
              </p>
              <p className="text-amber-800 font-semibold text-[11px]">
                Estimated Hardware Repair Cost: ${incident.estimated_cost || 220}
              </p>
            </div>
          )}

          {/* Deposit Resolution Action */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deposit &amp; Accountability Decision
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'refunded', label: 'Waive Penalty (Full Refund)' },
                { id: 'partially_retained', label: 'Partial Repair Deduction' },
                { id: 'held_for_review', label: 'Hold For Consortium Review' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDepositAction(opt.id)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    depositAction === opt.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Official Governance &amp; Resolution Notes
            </label>
            <textarea
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Resolving...' : 'Sign Off & Close Incident'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
