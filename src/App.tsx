/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DiscreetMode } from './components/DiscreetMode';
import { HomeDashboard } from './components/home/HomeDashboard';
import { SafetyHub } from './components/safety/SafetyHub';
import { SafetyMapScreen } from './components/map/SafetyMapScreen';
import { CommunityDashboard } from './components/community/CommunityDashboard';
import { ProfileSettings } from './components/profile/ProfileSettings';
import {
  NavigationTab,
  AppMode,
  EmergencyContact,
  Volunteer,
  Incident,
  EvidenceItem,
  PublicReport,
  MissingPersonAlert,
  ComplaintDraft,
} from './types';
import {
  initialEmergencyContacts,
  initialVolunteers,
  initialIncidents,
  initialEvidenceItems,
  initialPublicReports,
  initialMissingPersonAlerts,
} from './data/mockData';
import { triggerSos } from './services/api';

export default function App() {
  // Navigation & mode states
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [appMode, setAppMode] = useState<AppMode>('safety');

  // Emergency safety word
  const [safetyWord, setSafetyWord] = useState<string>('ABHAYAA');

  // Emergency SOS state
  const [isSosActive, setIsSosActive] = useState<boolean>(false);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(initialIncidents[0]);

  // Data collections
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialEmergencyContacts);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(initialVolunteers);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(initialEvidenceItems);
  const [publicReports, setPublicReports] = useState<PublicReport[]>(initialPublicReports);
  const [missingAlerts, setMissingAlerts] = useState<MissingPersonAlert[]>(initialMissingPersonAlerts);

  // SOS activation handler (both manual and safety word trigger)
  const handleTriggerSos = async (reason?: string) => {
    try {
      const res = await triggerSos({
        userName: 'Ananya Sen',
        details: reason || 'Emergency SOS Broadcast — Manual Trigger',
      });
      setIsSosActive(true);
      setActiveIncident(res.incident);
      setIncidents((prev) => [res.incident, ...prev.filter((i) => i.id !== res.incident.id)]);
      setActiveTab('map');
    } catch (err) {
      console.warn('API fallback SOS trigger:', err);
      const fallbackIncident: Incident = {
        id: `ABH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        userId: 'u-current',
        userName: 'Ananya Sen',
        type: reason || 'Emergency SOS Broadcast — High Priority',
        location: {
          lat: 19.076,
          lng: 72.8777,
          address: 'SV Road, Andheri West, Mumbai, MH',
        },
        status: 'SOS Active',
        policeStatus: 'Dispatched (PCR-18)',
        medicalStatus: 'Standby',
        assignedVolunteer: {
          id: 'vol-01',
          name: 'Priya Sharma',
          distance: '320m away',
          phone: '+91 98201 XXXXX',
          status: 'Assisting',
        },
        timeline: [
          { time: '00:00', event: reason || 'SOS Activated by Citizen', actor: 'Citizen' },
          { time: '00:01', event: 'High precision GPS coordinates acquired (4.2m)', actor: 'System' },
          { time: '00:02', event: 'SMS dispatch sent to 3 trusted guardians', actor: 'System' },
          { time: '00:03', event: 'Nearby verified volunteer escort alerted', actor: 'Volunteer' },
          { time: '00:04', event: 'Automatic dual-camera 30s capture initialized', actor: 'System' },
          { time: '00:05', event: 'Police Emergency PCR-18 dispatched [SIMULATED]', actor: 'Police' },
        ],
        audioRecorded: true,
        cameraEvidenceCaptured: true,
      };
      setIsSosActive(true);
      setActiveIncident(fallbackIncident);
      setIncidents((prev) => [fallbackIncident, ...prev]);
      setActiveTab('map');
    }
  };

  const handleCancelSos = () => {
    setIsSosActive(false);
    if (activeIncident) {
      const updated: Incident = {
        ...activeIncident,
        status: 'Resolved',
        timeline: [
          ...activeIncident.timeline,
          {
            time: new Date().toLocaleTimeString(),
            event: 'SOS Cancelled / Citizen Marked Safe',
            actor: 'Citizen',
          },
        ],
      };
      setActiveIncident(updated);
      setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }
  };

  // Evidence handlers
  const handleAddEvidence = (item: EvidenceItem) => {
    setEvidenceList((prev) => [item, ...prev]);
  };

  // Public report handlers
  const handleAddPublicReport = (report: PublicReport) => {
    setPublicReports((prev) => [report, ...prev]);
  };

  const handleSubmitSighting = (missingPersonId: string, details: string, location: string) => {
    setMissingAlerts((prev) =>
      prev.map((mp) =>
        mp.id === missingPersonId ? { ...mp, sightingsCount: mp.sightingsCount + 1 } : mp
      )
    );
  };

  const handleComplaintSubmitted = (draft: ComplaintDraft) => {
    const newCase: Incident = {
      id: `ABH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userId: 'user-001',
      userName: 'Ananya Sen',
      type: draft.title,
      location: {
        lat: 19.1136,
        lng: 72.8697,
        address: draft.locationOrPlatform,
      },
      status: 'Responders En Route',
      policeStatus: 'Report Filed',
      medicalStatus: 'Not Required',
      timeline: [
        {
          time: new Date().toLocaleTimeString(),
          event: `Formal Complaint Draft submitted to Police Station Docket under ${
            draft.legalReferences[0] || 'BNS Sec 78'
          }`,
          actor: 'Citizen',
        },
        {
          time: new Date().toLocaleTimeString(),
          event: 'Duty Officer logged FIR investigation ticket',
          actor: 'Police',
        },
      ],
      audioRecorded: false,
    };
    setIncidents((prev) => [newCase, ...prev]);
  };

  // If in Discreet Mode, render authentic weather disguise app
  if (appMode === 'discreet') {
    return <DiscreetMode onSwitchToSafety={() => setAppMode('safety')} />;
  }

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Header (Unified, without phase pills or authority desk) */}
      <Header
        appMode={appMode}
        onToggleDiscreet={() => setAppMode('discreet')}
        isSosActive={isSosActive}
        onOpenSos={() => setActiveTab('map')}
        onNavigateTab={setActiveTab}
      />

      {/* Navigation Bar (Home, Safety, Map, Community, Profile) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSosActive={isSosActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {activeTab === 'home' && (
          <HomeDashboard
            onNavigateTab={setActiveTab}
            onTriggerSos={handleTriggerSos}
            isSosActive={isSosActive}
            safetyWord={safetyWord}
            contacts={contacts}
            publicReports={publicReports}
            missingAlerts={missingAlerts}
            onOpenLiveSos={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyHub
            onTriggerSos={handleTriggerSos}
            contacts={contacts}
            onSaveToEvidence={handleAddEvidence}
            safetyWord={safetyWord}
          />
        )}

        {activeTab === 'map' && (
          <SafetyMapScreen
            isSosActive={isSosActive}
            activeIncident={activeIncident}
            onTriggerSos={handleTriggerSos}
            onCancelSos={handleCancelSos}
            contacts={contacts}
          />
        )}

        {activeTab === 'community' && (
          <CommunityDashboard
            volunteers={volunteers}
            publicReports={publicReports}
            missingAlerts={missingAlerts}
            userRole="citizen"
            onAddPublicReport={handleAddPublicReport}
            onSubmitSighting={handleSubmitSighting}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileSettings
            appMode={appMode}
            onToggleDiscreet={() => setAppMode('discreet')}
            safetyWord={safetyWord}
            onUpdateSafetyWord={setSafetyWord}
            contacts={contacts}
            onUpdateContacts={setContacts}
            onTestSafetyWord={() =>
              handleTriggerSos(`Emergency Triggered via Safety Word: "${safetyWord}"`)
            }
            onCaseSubmitted={handleComplaintSubmitted}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-900">ABHAYAA</span>
            <span>·</span>
            <span>Integrated Women & Girls Safety and Protection System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>Continuous Lifecycle: Prevention → Protection → Recovery</span>
            <span>·</span>
            <button
              onClick={() => setAppMode('discreet')}
              className="text-stone-500 hover:text-stone-900 underline cursor-pointer"
            >
              Enter Discreet Weather Disguise
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
