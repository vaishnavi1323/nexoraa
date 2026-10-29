import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Scale
} from 'lucide-react';
import { api } from '../services/api';

export default function AiAssistantTab({ refreshCount = 0 }) {
  const [activeSubTab, setActiveSubTab] = useState('vision');
  
  const [initialCond, setInitialCond] = useState('pristine');
  const [initialNotes, setInitialNotes] = useState('Clean bed, all collets accounted for, E-stop tested');
  const [finalCond, setFinalCond] = useState('damaged');
  const [finalNotes, setFinalNotes] = useState('Tool shattered during high feed rate cut, cracked spindle housing and gouged PEI release sheet');
  const [cleanlinessRating, setCleanlinessRating] = useState(2);
  const [visionResult, setVisionResult] = useState(null);
  const [loadingVision, setLoadingVision] = useState(false);

  const [fairnessReport, setFairnessReport] = useState(null);

  useEffect(() => {
    loadFairnessReport();
    runVisionAnalysis();
  }, [refreshCount]);

  const loadFairnessReport = async () => {
    try {
      const report = await api.aiGetFairnessReport();
      setFairnessReport(report);
    } catch (err) {
      console.error(err);
    }
  };

  const runVisionAnalysis = async () => {
    try {
      setLoadingVision(true);
      const res = await api.aiAnalyzeCondition({
        initialCondition: initialCond,
        initialNotes,
        finalCondition: finalCond,
        finalNotes,
        cleanlinessRating
      });
      setVisionResult(res.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVision(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Autonomous Trust &amp; Fairness AI Architecture</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Nexora AI Safety &amp; Governance Studio
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Inspect our 4 dedicated AI systems: Pre/Post Vision Condition Analyzer, Anti-Monopolization Fairness Curve, 
          Automated Certification Document Parser, and Natural Language Technical Matcher.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('vision')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'vision'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Condition &amp; Damage Vision Diff (Step 8/9)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fairness')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'fairness'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Fair Allocation &amp; Anti-Monopoly Engine</span>
        </button>
      </div>

      {activeSubTab === 'vision' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Step 7 Baseline vs Step 8 Handover Simulator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Change the check-in and return parameters to observe how the AI distinguishes normal operating wear from negligent operator fault.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Step 7 Check-in Initial Condition
                </label>
                <select
                  value={initialCond}
                  onChange={(e) => setInitialCond(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
                >
                  <option value="pristine">Pristine (Certified New)</option>
                  <option value="good">Good (Normal Condition)</option>
                  <option value="fair">Fair (Existing Minor Wear)</option>
                  <option value="pre_existing_damage">Pre-Existing Scratches Documented</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Step 7 Baseline Notes
                </label>
                <textarea
                  rows={2}
                  value={initialNotes}
                  onChange={(e) => setInitialNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Step 8 Return Final Condition
                </label>
                <select
                  value={finalCond}
                  onChange={(e) => setFinalCond(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
                >
                  <option value="pristine">Pristine (Clean Return)</option>
                  <option value="good">Good (Normal Handover)</option>
                  <option value="wear_detected">Normal Wear &amp; Tear</option>
                  <option value="damaged">Damage / Collision / Overheat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Step 8 Handover Notes
                </label>
                <textarea
                  rows={2}
                  value={finalNotes}
                  onChange={(e) => setFinalNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cleanliness Handover Rating: {cleanlinessRating} / 5 Stars
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={cleanlinessRating}
                  onChange={(e) => setCleanlinessRating(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={runVisionAnalysis}
                disabled={loadingVision}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loadingVision ? 'Evaluating Vision Model...' : 'Run Real-Time AI Diff Analysis'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-indigo-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Condition Diff Verdict</span>
                </span>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  visionResult?.requiresIncidentReport
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {visionResult?.damageSeverity || 'NONE'} Severity
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-900">Summary Assessment:</p>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {visionResult?.executiveSummary || 'Running evaluation...'}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Detailed Diagnostic Findings:
                </span>
                <div className="space-y-1">
                  {visionResult?.findings?.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-500 block">Est. Repair Cost</span>
                  <span className="text-base font-extrabold text-slate-900">${visionResult?.estimatedCost || 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-500 block">Deposit Action</span>
                  <span className="text-base font-extrabold text-amber-700 uppercase">{visionResult?.recommendedDepositAction || 'Refunded'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Human-In-The-Loop: Final forfeiture decisions remain reviewable by an authorized Lab Safety Officer.</span>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'fairness' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Distribution Health
              </span>
              <p className="text-xl font-extrabold text-emerald-700">
                {fairnessReport?.distributionHealth?.replace('_', ' ') || 'EXCELLENT EQUITY'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Gini Index: <strong>{fairnessReport?.giniFairnessIndex || '0.28'}</strong> (Healthy shared capacity)
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Monopolization Throttles
              </span>
              <p className="text-xl font-extrabold text-indigo-700">
                {fairnessReport?.monopolizationAlerts?.length || 0} Active Throttles
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Preventing single research groups from hoarding high-demand slots.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Underused Asset Opportunities
              </span>
              <p className="text-xl font-extrabold text-sky-700">
                {fairnessReport?.underusedResources?.length || 0} Facilities
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Assets operating under 15% capacity promoted to student innovators.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Unlock Underused Equipment: AI Opportunity Discovery</span>
            </h3>
            <div className="space-y-2">
              {fairnessReport?.underusedResources?.map((u, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900">{u.title}</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5">{u.recommendation}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase shrink-0">
                    {u.hoursLogged}h Logged
                  </span>
                </div>
              ))}
            </div>
          </div>

          {fairnessReport?.monopolizationAlerts?.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-3">
              <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Monopolization Alerts &amp; Algorithm Score Adjustments</span>
              </h3>
              <div className="space-y-2">
                {fairnessReport.monopolizationAlerts.map((a, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white border border-amber-200 text-xs flex items-center justify-between shadow-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{a.userName} ({a.hoursBooked}h this cycle)</p>
                      <p className="text-slate-600 text-[11px]">{a.actionItem}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                      {a.riskLevel} Risk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
