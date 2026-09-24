import React, { useState } from 'react';
import {
  Building2,
  Radio,
  Car,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  FileText,
  UserCheck,
  Search,
  Filter,
  Users,
} from 'lucide-react';
import { Incident, PublicReport, MissingPersonAlert, Volunteer } from '../../types';

interface AuthorityDashboardProps {
  incidents: Incident[];
  publicReports: PublicReport[];
  missingAlerts: MissingPersonAlert[];
  volunteers: Volunteer[];
  onUpdateReportStatus: (reportId: string, status: PublicReport['status'], note: string) => void;
  onDispatchPolice: (incidentId: string) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  incidents,
  publicReports,
  missingAlerts,
  volunteers,
  onUpdateReportStatus,
  onDispatchPolice,
}) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState('Beat Marshal 7 deployed for continuous evening surveillance.');

  const activeSosCount = incidents.filter((i) => i.status === 'SOS Active' || i.status === 'Responders En Route').length;

  return (
    <div className="space-y-6">
      {/* Top Command Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-widest">
              State Police Integrated Command System
            </span>
          </div>
          <h1 className="text-xl font-black mt-1 flex items-center gap-2">
            <span>ABHAYAA Authority & Dispatch Control Desk</span>
            <span className="text-xs bg-blue-600 text-white font-mono px-2 py-0.5 rounded">
              Terminal #MUM-DISP-04
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time emergency telemetry, volunteer dispatch coordination, and public safety audit triage.
          </p>
        </div>

        {/* Real-time stats */}
        <div className="flex items-center gap-4 text-center">
          <div className="bg-stone-800/80 px-4 py-2 rounded-xl border border-stone-700">
            <span className="text-[10px] text-stone-400 block font-medium">Active SOS</span>
            <span className="text-xl font-black text-rose-500 font-mono">{activeSosCount}</span>
          </div>
          <div className="bg-stone-800/80 px-4 py-2 rounded-xl border border-stone-700">
            <span className="text-[10px] text-stone-400 block font-medium">Patrols Active</span>
            <span className="text-xl font-black text-blue-400 font-mono">18</span>
          </div>
          <div className="bg-stone-800/80 px-4 py-2 rounded-xl border border-stone-700">
            <span className="text-[10px] text-stone-400 block font-medium">Volunteers Online</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{volunteers.length}</span>
          </div>
        </div>
      </div>

      {/* Main Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Incidents Dispatch Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-600 animate-spin" />
                <h3 className="text-sm font-bold text-stone-900">Live Citizen Emergency Dispatch Queue</h3>
              </div>
              <span className="text-xs text-stone-400 font-mono">{incidents.length} Records</span>
            </div>

            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedIncident?.id === inc.id
                      ? 'bg-rose-50/50 border-rose-300 shadow-xs'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-700">{inc.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        inc.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-600 text-white animate-pulse'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-xs mt-1">{inc.type}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{inc.location.address}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-200/60 text-[11px] text-stone-500">
                    <div>
                      Citizen: <strong>{inc.userName}</strong> · {inc.timestamp}
                    </div>
                    <div className="text-blue-700 font-medium">Police: {inc.policeStatus}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Incident Detail & Action Panel */}
          {selectedIncident && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs font-bold text-stone-900">
                  Incident Action Center: #{selectedIncident.id}
                </span>
                <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                  {selectedIncident.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-400 block font-medium">Dispatch Unit</span>
                  <span className="font-bold text-stone-800 mt-0.5 block">PCR-18 (Van #224)</span>
                </div>
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-400 block font-medium">Verified Volunteer</span>
                  <span className="font-bold text-stone-800 mt-0.5 block truncate">
                    {selectedIncident.assignedVolunteer?.name || 'Searching...'}
                  </span>
                </div>
              </div>

              {/* Action buttons for dispatch */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => onDispatchPolice(selectedIncident.id)}
                  className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Update Patrol Unit En Route</span>
                </button>
                <button
                  onClick={() => alert(`Radio frequency linked to PCR-18 & Volunteer Priya Sharma.`)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer border border-stone-200"
                >
                  Dispatch Radio Bridge
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Public Spot Reports Triage Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900">Civic Hazard Reports Review</h3>
              </div>
              <span className="text-xs text-stone-400 font-mono">{publicReports.length} Submitted</span>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto">
              {publicReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{report.category}</span>
                    <span className="text-[10px] text-stone-400 font-mono">#{report.id}</span>
                  </div>

                  <p className="text-[11px] text-stone-600 font-medium">{report.location}</p>
                  <p className="text-[11px] text-stone-500 bg-white p-2 rounded border border-stone-100">
                    {report.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      Status: {report.status}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedReportId(report.id);
                        onUpdateReportStatus(
                          report.id,
                          'Patrol Dispatched',
                          'Beat Marshal assigned for evening spot checking.'
                        );
                      }}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-[11px] font-semibold cursor-pointer"
                    >
                      Assign Patrol Unit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
