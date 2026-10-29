import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import BookingsPage from './pages/BookingsPage';
import ManagerDashboard from './pages/ManagerDashboard';
import AiAssistantTab from './pages/AiAssistantTab';
import AuditPage from './pages/AuditPage';

import BookingModal from './components/BookingModal';
import CheckInModal from './components/CheckInModal';
import ReturnModal from './components/ReturnModal';
import IncidentModal from './components/IncidentModal';
import ListResourceModal from './components/ListResourceModal';
import CertModal from './components/CertModal';
import ProfileModal from './components/ProfileModal';
import JudgeDemoModal from './components/JudgeDemoModal';
import DemoTourBanner from './components/DemoTourBanner';

import { getActiveUser } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [currentUser, setCurrentUser] = useState(getActiveUser());

  const [selectedResourceForBooking, setSelectedResourceForBooking] = useState(null);
  const [selectedBookingForCheckin, setSelectedBookingForCheckin] = useState(null);
  const [selectedBookingForReturn, setSelectedBookingForReturn] = useState(null);
  const [selectedIncidentForResolve, setSelectedIncidentForResolve] = useState(null);
  const [showListResourceModal, setShowListResourceModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState('create');
  const [showJudgeModal, setShowJudgeModal] = useState(false);

  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const handleUserChanged = (e) => {
      setCurrentUser(e.detail || getActiveUser());
    };
    window.addEventListener('user-changed', handleUserChanged);
    return () => window.removeEventListener('user-changed', handleUserChanged);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshCount(c => c + 1);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16 sm:pb-0">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateResource={() => setShowListResourceModal(true)}
        onOpenCertModal={() => setShowCertModal(true)}
        onOpenJudgeHub={() => setShowJudgeModal(true)}
        onOpenCreateProfile={() => {
          setProfileModalMode('create');
          setShowProfileModal(true);
        }}
        onOpenEditProfile={() => {
          setProfileModalMode('edit');
          setShowProfileModal(true);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'catalog' && (
          <CatalogPage
            refreshCount={refreshCount}
            onSelectResource={(r) => setSelectedResourceForBooking(r)}
            onOpenListModal={() => setShowListResourceModal(true)}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsPage
            refreshCount={refreshCount}
            onOpenCheckIn={(b) => setSelectedBookingForCheckin(b)}
            onOpenReturn={(b) => setSelectedBookingForReturn(b)}
            onOpenIncidentView={() => setActiveTab('manager')}
          />
        )}

        {activeTab === 'manager' && (
          <ManagerDashboard
            refreshCount={refreshCount}
            onOpenResolveIncident={(inc) => setSelectedIncidentForResolve(inc)}
          />
        )}

        {activeTab === 'ai' && (
          <AiAssistantTab refreshCount={refreshCount} />
        )}

        {activeTab === 'audit' && (
          <AuditPage refreshCount={refreshCount} />
        )}
      </main>

      {/* Floating Demo Tour Banner for Step-by-Step Guidance */}
      <DemoTourBanner
        onOpenJudgeHub={() => setShowJudgeModal(true)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenListModal={() => setShowListResourceModal(true)}
        onRefresh={triggerRefresh}
      />

      {/* Judge Demo & Evaluation Hub Modal */}
      <JudgeDemoModal
        isOpen={showJudgeModal}
        onClose={() => setShowJudgeModal(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenBookingModal={(r) => setSelectedResourceForBooking(r)}
        onOpenListModal={() => setShowListResourceModal(true)}
        onOpenCheckInModal={(b) => setSelectedBookingForCheckin(b)}
        onOpenReturnModal={(b) => setSelectedBookingForReturn(b)}
        onOpenIncidentModal={(inc) => setSelectedIncidentForResolve(inc)}
        onRefresh={triggerRefresh}
      />

      {selectedResourceForBooking && (
        <BookingModal
          resource={selectedResourceForBooking}
          onClose={() => setSelectedResourceForBooking(null)}
          onSuccess={() => {
            setSelectedResourceForBooking(null);
            triggerRefresh();
            setActiveTab('bookings');
          }}
        />
      )}

      {selectedBookingForCheckin && (
        <CheckInModal
          booking={selectedBookingForCheckin}
          onClose={() => setSelectedBookingForCheckin(null)}
          onSuccess={() => {
            setSelectedBookingForCheckin(null);
            triggerRefresh();
          }}
        />
      )}

      {selectedBookingForReturn && (
        <ReturnModal
          booking={selectedBookingForReturn}
          onClose={() => setSelectedBookingForReturn(null)}
          onSuccess={() => {
            setSelectedBookingForReturn(null);
            triggerRefresh();
          }}
        />
      )}

      {selectedIncidentForResolve && (
        <IncidentModal
          incident={selectedIncidentForResolve}
          onClose={() => setSelectedIncidentForResolve(null)}
          onSuccess={() => {
            setSelectedIncidentForResolve(null);
            triggerRefresh();
          }}
        />
      )}

      {showListResourceModal && (
        <ListResourceModal
          onClose={() => setShowListResourceModal(false)}
          onSuccess={() => {
            setShowListResourceModal(false);
            triggerRefresh();
          }}
        />
      )}

      {showCertModal && (
        <CertModal
          onClose={() => setShowCertModal(false)}
        />
      )}

      <ProfileModal
        isOpen={showProfileModal}
        mode={profileModalMode}
        onClose={() => setShowProfileModal(false)}
        onSuccess={() => triggerRefresh()}
      />

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-800">Nexora Platform</span>
            <span className="ml-2 text-slate-500">Institutional Resource &amp; Equipment Exchange OS</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Built for Unlock Underused Equipment and Spaces Hackathon. Complete 10-Step Workflow Verified.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
            <button
              onClick={() => setShowJudgeModal(true)}
              className="text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>🏆 Open Judge Hub</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Multi-Institutional Trust Fabric Active
            </span>
            <span>•</span>
            <span>Vercel &amp; Render Ready</span>
            <span>•</span>
            <span>Tamper-Evident Ledger</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
