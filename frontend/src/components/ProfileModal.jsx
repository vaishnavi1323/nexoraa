import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  UserCheck, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Coins, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { api, getActiveUser, setActiveUser } from '../services/api';
import confetti from 'canvas-confetti';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
];

export default function ProfileModal({ isOpen, onClose, mode = 'create', onSuccess }) {
  const currentUser = getActiveUser();
  const isEditing = mode === 'edit';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('researcher');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('+1 (555) 019-2831');
  const [bio, setBio] = useState('');
  const [credits, setCredits] = useState(1000);
  const [trustScore, setTrustScore] = useState(90);
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isEditing && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setRole(currentUser.role || 'researcher');
      setInstitution(currentUser.institution || '');
      setDepartment(currentUser.department || '');
      setPhone(currentUser.phone || '+1 (555) 019-2831');
      setBio(currentUser.bio || '');
      setCredits(currentUser.credits || 1000);
      setTrustScore(currentUser.trust_score || 90);
      setAvatar(currentUser.avatar || AVATAR_PRESETS[0]);
    } else {
      // Default new profile
      setName('');
      setEmail('');
      setRole('student');
      setInstitution('My University / Research Lab');
      setDepartment('Mechanical & Robotics Engineering');
      setBio('Student researcher and hardware creator building capstone prototypes.');
      setCredits(1000);
      setTrustScore(92);
      setAvatar(AVATAR_PRESETS[2]);
    }
  }, [mode, currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const finalAvatar = customAvatarUrl.trim() ? customAvatarUrl.trim() : avatar;

    try {
      if (isEditing) {
        const payload = {
          name,
          role,
          institution,
          department,
          phone,
          bio,
          avatar: finalAvatar,
          credits: Number(credits),
          trust_score: Number(trustScore)
        };
        const res = await api.updateUser(currentUser.id, payload);
        setActiveUser(res.user);
        window.dispatchEvent(new CustomEvent('user-changed', { detail: res.user }));
        confetti({ particleCount: 50, spread: 50 });
        if (onSuccess) onSuccess(res.user);
      } else {
        const payload = {
          name,
          email,
          role,
          institution,
          department,
          phone,
          bio,
          avatar: finalAvatar,
          credits: Number(credits),
          trust_score: Number(trustScore)
        };
        const res = await api.createUser(payload);
        setActiveUser(res.user);
        window.dispatchEvent(new CustomEvent('user-changed', { detail: res.user }));
        confetti({ particleCount: 75, spread: 60 });
        if (onSuccess) onSuccess(res.user);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed');
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              Identity &amp; Persona Management
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {isEditing ? `Edit Profile Details: ${currentUser?.name}` : 'Create Your Custom Profile'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Choose Profile Avatar</span>
              <span className="text-[10px] text-slate-500 font-medium">Or paste custom image URL below</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {AVATAR_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setAvatar(url); setCustomAvatarUrl(''); }}
                    className={`relative rounded-xl overflow-hidden p-0.5 border-2 transition-all cursor-pointer ${
                      avatar === url && !customAvatarUrl
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={url} alt="preset" className="w-10 h-10 rounded-lg object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Optional custom image URL (https://...)"
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alex Rivera / Dr. Sarah Chen"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                disabled={isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., yourname@university.edu"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Role & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="student">Student / Innovator</option>
                <option value="researcher">Graduate / PhD Researcher</option>
                <option value="lab_manager">Lab Manager &amp; Facility Director</option>
                <option value="community_member">Community Maker / Startup</option>
                <option value="admin">Institutional Safety Auditor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Institution & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institution / University / Space
              </label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g., Stanford University / MIT"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Facility
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Mechanical Engineering"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Bio / Mission */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bio / Research Focus
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your research, fabrication needs, or institutional oversight role..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          {/* Credits & Trust Score */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Credit Balance ($)</span>
              </label>
              <input
                type="number"
                min="0"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trust Score (0-100%)</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={trustScore}
                onChange={(e) => setTrustScore(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
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
              {isEditing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{loading ? 'Creating...' : 'Create & Activate Profile'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
