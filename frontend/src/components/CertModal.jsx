import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileCheck2, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  Award,
  Plus
} from 'lucide-react';
import { api, getActiveUser } from '../services/api';
import confetti from 'canvas-confetti';

export default function CertModal({ onClose }) {
  const currentUser = getActiveUser();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [title, setTitle] = useState('5-Axis CNC Mill Certified Operator');
  const [customTitle, setCustomTitle] = useState('');
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [issuingBody, setIssuingBody] = useState('MIT Environment, Health & Safety (EHS)');
  const [issueDate, setIssueDate] = useState('2025-06-15');
  const [expiryDate, setExpiryDate] = useState('2027-06-15');
  const [aiResult, setAiResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    loadUserCerts();
  }, [currentUser]);

  const loadUserCerts = async () => {
    try {
      const data = await api.getCertifications(currentUser.id);
      setCerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadCert = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const finalTitle = isCustomTitle ? customTitle.trim() : title;
    if (!finalTitle) {
      setErrorMsg('Please specify a certification title.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: finalTitle,
        issuing_body: issuingBody,
        issue_date: issueDate,
        expiry_date: expiryDate,
        document_url: 'https://example.com/certs/verified-doc.pdf',
        raw_text_extract: `Certificate of Safety Competency issued to ${currentUser.name} for ${finalTitle} under authorized supervision.`
      };

      const res = await api.uploadCertification(payload);
      setAiResult(res.aiVerification);
      confetti({ particleCount: 50, spread: 50 });
      loadUserCerts();
      setTimeout(() => {
        setShowUploadForm(false);
        setAiResult(null);
        setIsCustomTitle(false);
        setCustomTitle('');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit certification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              Institutional Credential Passport
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {currentUser.name}’s Safety Certifications
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Verified Credentials ({certs.length})
              </span>
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{showUploadForm ? 'Cancel' : '+ Add Safety Certificate'}</span>
              </button>
            </div>

            {certs.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200">
                <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No verified certifications found for this user.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Add training documentation below to unlock specialized facilities.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {certs.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">{c.issuing_body} • Expires {c.expiry_date}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${
                      c.status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showUploadForm && (
            <form onSubmit={handleUploadCert} className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Safety Document Verification &amp; Registration</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomTitle(!isCustomTitle)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  {isCustomTitle ? 'Choose Standard' : '+ Type Custom Title'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certification Title
                </label>
                {isCustomTitle ? (
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g., Radiation Safety Level 3 / Heavy Crane Operator"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                ) : (
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="5-Axis CNC Mill Certified Operator">5-Axis CNC Mill Certified Operator</option>
                    <option value="Class 3B/4 Laser Safety Operator">Class 3B/4 Laser Safety Operator</option>
                    <option value="MakerSpace Basic Safety Orientation">MakerSpace Basic Safety Orientation</option>
                    <option value="Nanoscale Imaging Safety">Nanoscale Imaging Safety</option>
                    <option value="Cleanroom Class 1000 Orientation">Cleanroom Class 1000 Orientation</option>
                    <option value="3D Additive Sintering Operator">3D Additive Sintering Operator</option>
                    <option value="BioSafety Level 2 Biohazard Containment">BioSafety Level 2 Biohazard Containment</option>
                    <option value="Hazardous Chemical Handling">Hazardous Chemical Handling</option>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Issuing Body / Department
                  </label>
                  <input
                    type="text"
                    required
                    value={issuingBody}
                    onChange={(e) => setIssuingBody(e.target.value)}
                    placeholder="e.g., MIT EHS / Stanford Safety"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              {aiResult && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AI Result: {aiResult.recommendation} ({aiResult.confidenceScore}% Confidence)</span>
                  </p>
                  <p className="text-slate-600 text-[11px]">{aiResult.aiAnalysisNote}</p>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loading ? 'Registering...' : 'Save & Verify Certification'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
