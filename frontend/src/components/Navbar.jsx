import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Calendar, 
  Sparkles, 
  History, 
  PlusCircle, 
  ChevronDown, 
  CheckCircle2, 
  Coins, 
  FileCheck2,
  UserPlus,
  Edit3,
  Award
} from 'lucide-react';
import { api, getActiveUser, setActiveUser } from '../services/api';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenCreateResource, 
  onOpenCertModal,
  onOpenCreateProfile,
  onOpenEditProfile,
  onOpenJudgeHub
}) {
  const [currentUser, setCurrentUser] = useState(getActiveUser());
  const [allUsers, setAllUsers] = useState([]);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const users = await api.getUsers();
      if (users && users.length > 0) {
        setAllUsers(users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectUser = (u) => {
    setActiveUser(u);
    setCurrentUser(u);
    setShowPersonaMenu(false);
    window.dispatchEvent(new CustomEvent('user-changed', { detail: u }));
  };

  const roleBadges = {
    lab_manager: { label: 'Lab Manager', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    researcher: { label: 'PhD Researcher', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    student: { label: 'Student', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    community_member: { label: 'Maker/Community', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    admin: { label: 'Safety Auditor', color: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  Nexora
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Trust OS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Institutional Trust Fabric</span>
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'catalog' 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Catalog &amp; Matcher</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'bookings' 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Lifecycle (1-10)</span>
            </button>

            <button
              onClick={() => setActiveTab('manager')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'manager' 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Lab Control</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai' 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI &amp; Fairness</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'audit' 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Trail</span>
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Judge Evaluation Hub Button */}
            <button
              onClick={onOpenJudgeHub}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-sm border border-amber-400 cursor-pointer transition-all hover:scale-102"
              title="Open 10-Step Interactive Evaluation Hub"
            >
              <Award className="w-3.5 h-3.5 fill-current text-slate-950" />
              <span>🏆 Judge Hub</span>
            </button>

            <button
              onClick={onOpenCreateResource}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Resource</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left shadow-xs cursor-pointer"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 leading-none">
                      {currentUser?.name || 'Alex Rivera'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${roleBadges[currentUser?.role]?.color || 'bg-slate-100 text-slate-700'}`}>
                      {roleBadges[currentUser?.role]?.label || 'User'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-medium">
                    <span className="text-emerald-700 font-semibold">
                      ★ {currentUser?.trust_score || 94}% Trust
                    </span>
                    <span>•</span>
                    <span className="text-amber-700 flex items-center gap-0.5">
                      <Coins className="w-2.5 h-2.5" /> {currentUser?.credits || 1200}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50">
                  <div className="p-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Active Persona
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Switch accounts or create your own profile.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        if (onOpenCreateProfile) onOpenCreateProfile();
                      }}
                      className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center gap-1 border border-indigo-200 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ Create Profile</span>
                    </button>
                  </div>

                  <div className="py-1 space-y-1 max-h-64 overflow-y-auto">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser?.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSelectUser(u)}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-50/70 border border-indigo-200' 
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">{u.institution}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] px-1 py-0.2 rounded border font-medium ${roleBadges[u.role]?.color}`}>
                                {roleBadges[u.role]?.label}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                {u.trust_score}% Trust
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-100 mt-1 flex justify-between items-center text-xs">
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        if (onOpenEditProfile) onOpenEditProfile();
                      }}
                      className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit My Details</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        if (onOpenCertModal) onOpenCertModal();
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Certifications</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
