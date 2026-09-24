import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Camera,
  EyeOff,
  UserCheck,
  Search,
  CheckCircle,
  PhoneCall,
  Plus,
  Send,
  Lock,
} from 'lucide-react';
import {
  Volunteer,
  PublicReport,
  MissingPersonAlert,
  UserRole,
} from '../../types';
import { AwarenessCenter } from '../before/AwarenessCenter';
import { BookOpen } from 'lucide-react';

interface CommunityDashboardProps {
  volunteers: Volunteer[];
  publicReports: PublicReport[];
  missingAlerts: MissingPersonAlert[];
  userRole: UserRole;
  onAddPublicReport: (report: PublicReport) => void;
  onSubmitSighting: (missingPersonId: string, details: string, location: string) => void;
}

export const CommunityDashboard: React.FC<CommunityDashboardProps> = ({
  volunteers,
  publicReports,
  missingAlerts,
  userRole,
  onAddPublicReport,
  onSubmitSighting,
}) => {
  const [subTab, setSubTab] = useState<'reports' | 'missing' | 'volunteers' | 'awareness'>('reports');

  // New report form state
  const [showReportModal, setShowReportModal] = useState(false);
  const [category, setCategory] = useState<PublicReport['category']>('Eve Teasing / Stalking Spot');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [identityPref, setIdentityPref] = useState<PublicReport['reporterIdentityPreference']>(
    'Protected from Public (Visible to Authority only)'
  );

  // Sighting form state
  const [selectedMissing, setSelectedMissing] = useState<MissingPersonAlert | null>(null);
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingDetails, setSightingDetails] = useState('');
  const [sightingSuccess, setSightingSuccess] = useState(false);

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;

    const newReport: PublicReport = {
      id: `PR-${Math.floor(100 + Math.random() * 900)}`,
      category,
      location: location.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description: description.trim(),
      hasMedia: true,
      reporterIdentityPreference: identityPref,
      status: 'Received',
    };

    onAddPublicReport(newReport);
    setLocation('');
    setDescription('');
    setShowReportModal(false);
  };

  const handleSightingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissing || !sightingLocation.trim()) return;
    onSubmitSighting(selectedMissing.id, sightingDetails, sightingLocation);
    setSightingSuccess(true);
    setTimeout(() => {
      setSightingSuccess(false);
      setSelectedMissing(null);
      setSightingLocation('');
      setSightingDetails('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-nav */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
        <button
          onClick={() => setSubTab('reports')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            subTab === 'reports' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Public Spot Reporting</span>
        </button>

        <button
          onClick={() => setSubTab('missing')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            subTab === 'missing' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Missing Person Alerts</span>
        </button>

        <button
          onClick={() => setSubTab('volunteers')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            subTab === 'volunteers' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Verified Volunteer Network</span>
        </button>

        <button
          onClick={() => setSubTab('awareness')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            subTab === 'awareness' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-600" />
          <span>Awareness & Legal Rights</span>
        </button>
      </div>

      {/* 1. Verified Volunteers Tab */}
      {subTab === 'volunteers' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Community · Escorts</span>
                <span className="text-stone-300">/</span>
                <span className="text-xs text-stone-500">Vetted First Responders</span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-1">Verified Volunteer Safety Network</h2>
              <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
                Background-checked local citizens, self-defense trainers, and female escorts ready to assist during transit hazards or emergency dispatches.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 font-medium">
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Strict Govt ID + Police Clearance Mandate</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {volunteers.map((vol) => (
              <div
                key={vol.id}
                className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-stone-300 transition-colors shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center font-bold text-stone-700 text-sm">
                      {vol.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                        <span>{vol.name}</span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </h4>
                      <p className="text-[11px] text-stone-500">{vol.area}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      vol.availability === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : vol.availability === 'Assisting'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {vol.availability}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Proximity:</span>
                    <span className="font-semibold text-stone-800">{vol.distance}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Certification Badge:</span>
                    <span className="font-medium text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded">
                      {vol.trainingBadge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Verified Assists:</span>
                    <span className="text-stone-700 font-mono">
                      {vol.completedAssists} assists · ★ {vol.rating}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex gap-2">
                  <button
                    onClick={() => alert(`Connecting securely to volunteer ${vol.name}...`)}
                    className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PhoneCall className="w-3 h-3 text-emerald-400" />
                    <span>Request Escort / Contact</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Public Spot Reporting Tab */}
      {subTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Community · Hazard Map</span>
                <span className="text-stone-300">/</span>
                <span className="text-xs text-stone-500">Citizen Reporting</span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-1">Public Incident & Hazard Spot Reports</h2>
              <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
                Report dark stretches, stalking hotspots, eve-teasing gathering spots, or unsafe transit stops. Your identity is protected from the public.
              </p>
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Report Unsafe Spot</span>
            </button>
          </div>

          {/* List of Public Reports */}
          <div className="space-y-3">
            {publicReports.map((report) => (
              <div
                key={report.id}
                className="bg-stone-50/70 border border-stone-200 rounded-xl p-4 space-y-2.5 hover:border-stone-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{report.category}</span>
                    <span className="text-[10px] text-stone-400 font-mono">#{report.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium">
                      Status: {report.status}
                    </span>
                    <span className="text-[10px] text-stone-400">{report.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="font-semibold">{report.location}</span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200/70">
                  {report.description}
                </p>

                {report.authorityNote && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-900 flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Police / Civic Action Taken: </strong>
                      <span>{report.authorityNote}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-stone-400" />
                    <span>Reporter Privacy: {report.reporterIdentityPreference}</span>
                  </span>
                  <span>Verified Public Audit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Missing Persons Tab */}
      {subTab === 'missing' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Community · Urgent Alerts</span>
                <span className="text-stone-300">/</span>
                <span className="text-xs text-stone-500">Official Missing Bulletins</span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-1">Missing Persons / Community Assistance</h2>
              <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
                Official alerts issued by police juvenile and missing units. Help families locate missing girls by submitting verified sightings.
              </p>
            </div>

            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md font-mono">
              OFFICIAL POLICE BULLETIN
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {missingAlerts.map((mp) => (
              <div
                key={mp.id}
                className="bg-stone-50/70 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-stone-300 transition-colors shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Photo with fallback */}
                  <div className="w-24 h-28 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300 relative">
                    <img
                      src={mp.photoUrl}
                      alt={mp.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-rose-600/90 text-white text-[9px] font-bold text-center py-0.5">
                      ALERT
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-stone-400">{mp.caseNumber}</span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        {mp.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-stone-900">{mp.name}, Age {mp.age}</h3>

                    <div className="text-[11px] text-stone-600 space-y-1">
                      <div>
                        <strong className="text-stone-700">Last Seen:</strong> {mp.lastSeenLocation} ({mp.lastSeenDate})
                      </div>
                      <div>
                        <strong className="text-stone-700">Wearing:</strong> {mp.wearing}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {mp.physicalDescription}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-mono">
                    Sightings Received: <strong>{mp.sightingsCount}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedMissing(mp)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Submit Sighting Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateReport}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900">Report Unsafe Spot or Public Harassment</h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category of Concern</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PublicReport['category'])}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
              >
                <option value="Eve Teasing / Stalking Spot">Eve Teasing / Stalking Spot</option>
                <option value="Poor Street Lighting">Poor Street Lighting / Dark Corridor</option>
                <option value="Suspicious Gathering">Suspicious Gathering / Drinking in Public</option>
                <option value="Public Transit Harassment">Public Transit Harassment (Bus/Auto/Metro)</option>
                <option value="Other Hazard">Other Women Safety Hazard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Specific Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Under the flyover at Gate 2, near the tea stall"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Incident Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what makes this location unsafe, usual timings, perpetrator behaviors..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Reporter Privacy Option</label>
              <select
                value={identityPref}
                onChange={(e) => setIdentityPref(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
              >
                <option value="Protected from Public (Visible to Authority only)">
                  Protected from Public (Visible to Authority / Police only)
                </option>
                <option value="Completely Anonymous">Completely Anonymous (Zero Identity Stored)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Submit Report to Safety Map
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sighting Submission Modal */}
      {selectedMissing && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSightingSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Submit Sighting Information</h3>
                <span className="text-[11px] text-stone-500">Case: {selectedMissing.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMissing(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sightingSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-900">Sighting Dispatched to Police Case Officer</h4>
                <p className="text-[11px] text-emerald-800">
                  Thank you. Your sighting info has been securely forwarded with privacy protection.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Where did you spot this person?
                  </label>
                  <input
                    type="text"
                    required
                    value={sightingLocation}
                    onChange={(e) => setSightingLocation(e.target.value)}
                    placeholder="e.g. Bus Stop 339, Dadar West near flower market"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Observations / Companion / Clothing
                  </label>
                  <textarea
                    rows={3}
                    value={sightingDetails}
                    onChange={(e) => setSightingDetails(e.target.value)}
                    placeholder="Details: was anyone with them, what were they carrying, what direction were they walking..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-[10px] text-stone-500">
                  Your identity is protected and only accessible to verified police investigation officers.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMissing(null)}
                    className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                  >
                    Send to Investigating Officer
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* 4. Awareness & Legal Rights Tab */}
      {subTab === 'awareness' && (
        <AwarenessCenter />
      )}
    </div>
  );
};
