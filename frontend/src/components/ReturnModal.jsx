import React, { useState } from 'react';
import { 
  X, 
  LogOut, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  AlertOctagon
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function ReturnModal({ booking, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [finalCondition, setFinalCondition] = useState('good');
  const [finalNotes, setFinalNotes] = useState('Session concluded smoothly. Machine wiped down, tools racked in order, waste collected.');
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [consumables, setConsumables] = useState({
    operationalHours: '3.0',
    coolantRefilled: 'Yes',
    notes: 'None'
  });
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400');
  const [errorMsg, setErrorMsg] = useState(null);
  const [aiVerdict, setAiVerdict] = useState(null);

  const handleReturn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        final_condition_status: finalCondition,
        final_notes: finalNotes,
        final_photos: photoUrl ? [photoUrl] : [],
        cleanliness_rating: cleanlinessRating,
        consumables_used: consumables
      };

      const res = await api.returnBooking(booking.id, payload);
      setAiVerdict(res);
      if (!res.aiConditionAnalysis.requiresIncidentReport) {
        confetti({ particleCount: 70, spread: 60 });
      }
      setTimeout(() => {
        if (onSuccess) onSuccess(res);
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Return submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
              Steps 8 &amp; 9: Return, AI Condition Audit &amp; Deposit Refund
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Return Inspection &amp; Sign-Off
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {aiVerdict ? (
          <div className="p-8 space-y-4">
            <div className={`w-16 h-16 rounded-2xl border mx-auto flex items-center justify-center ${
              aiVerdict.aiConditionAnalysis.requiresIncidentReport
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {aiVerdict.aiConditionAnalysis.requiresIncidentReport ? (
                <AlertOctagon className="w-9 h-9" />
              ) : (
                <CheckCircle2 className="w-9 h-9" />
              )}
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                {aiVerdict.aiConditionAnalysis.requiresIncidentReport
                  ? 'Condition Discrepancy Flagged (Step 9 Active)'
                  : 'Return Complete & Deposit Refunded!'}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                {aiVerdict.message}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Vision &amp; Diff Analysis Verdict:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {aiVerdict.aiConditionAnalysis.executiveSummary}
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Severity: <strong className="uppercase text-slate-900">{aiVerdict.aiConditionAnalysis.damageSeverity}</strong></span>
                <span className="text-slate-600">Deposit Action: <strong className="uppercase text-amber-700">{aiVerdict.depositRefundStatus}</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReturn} className="p-6 space-y-5">
            
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900">Ref: <span className="font-mono text-indigo-700">{booking.booking_code}</span></p>
                <p className="text-slate-500 mt-0.5">{booking.resource_title}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Security Deposit</span>
                <span className="text-xs font-bold text-emerald-700">${booking.resource_deposit || 150}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Final Equipment Condition Status (Step 8)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'pristine', label: 'Pristine (Clean)' },
                  { id: 'good', label: 'Good (Normal)' },
                  { id: 'wear_detected', label: 'Normal Wear' },
                  { id: 'damaged', label: 'Damage / Jam' }
                ].map(cond => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setFinalCondition(cond.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      finalCondition === cond.id
                        ? cond.id === 'damaged' 
                          ? 'border-rose-600 bg-rose-50 text-rose-800' 
                          : 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Cleanliness &amp; Handover Rating</span>
                <span className="text-xs text-amber-700 font-bold">{cleanlinessRating} / 5 Stars</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCleanlinessRating(star)}
                    className={`p-2 rounded-xl border flex-1 flex items-center justify-center transition-all cursor-pointer ${
                      star <= cleanlinessRating
                        ? 'border-amber-300 bg-amber-50 text-amber-600'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Post-Operation Handover Notes (Triggered for AI Vision Scan)
              </label>
              <textarea
                rows={3}
                required
                value={finalNotes}
                onChange={(e) => setFinalNotes(e.target.value)}
                placeholder="Mention any tool wear, strange noises, thermal alerts, or clean return details..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Run Hours / Filament
                </label>
                <input
                  type="text"
                  value={consumables.operationalHours}
                  onChange={(e) => setConsumables({ ...consumables, operationalHours: e.target.value })}
                  placeholder="e.g., 3.0 hrs"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Final Inspection Photo URL
                </label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                <strong>Nexora AI Inspection Guard:</strong> System will automatically compare this submission against your Step 7 baseline to verify deposit refund eligibility.
              </span>
            </div>

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
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{loading ? 'Running AI Vision Audit...' : 'Submit Return & Audit (Step 8)'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
