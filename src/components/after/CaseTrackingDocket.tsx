import React, { useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  FileText,
  BadgeAlert,
  Calendar,
  Building,
} from 'lucide-react';
import { Incident } from '../../types';

interface CaseTrackingDocketProps {
  incidents: Incident[];
}

export const CaseTrackingDocket: React.FC<CaseTrackingDocketProps> = ({ incidents }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(incidents[0]?.id || '');

  const activeCase = incidents.find((inc) => inc.id === selectedCaseId) || incidents[0];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">After · Follow-Up</span>
          <span className="text-stone-300">/</span>
          <span className="text-xs text-stone-500">Official Docket</span>
        </div>
        <h2 className="text-lg font-bold text-stone-900 mt-1">Incident Tracking & Case Timeline Docket</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Follow the investigation progression from initial SOS alert to police dispatch, volunteer support, FIR registration, and judicial resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Case List Sidebar */}
        <div className="md:col-span-4 space-y-2">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Registered Incidents ({incidents.length})
          </div>
          {incidents.map((inc) => (
            <button
              key={inc.id}
              onClick={() => setSelectedCaseId(inc.id)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                activeCase?.id === inc.id
                  ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200/80 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-rose-700">{inc.id}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    inc.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {inc.status}
                </span>
              </div>
              <h4 className="font-bold text-stone-900 mt-1 truncate">{inc.type}</h4>
              <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1">
                <span>{inc.timestamp}</span>
                <span>{inc.policeStatus}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Case Detail Docket */}
        {activeCase && (
          <div className="md:col-span-8 bg-stone-50/60 border border-stone-200 rounded-xl p-5 space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60 pb-3">
              <div>
                <span className="text-[10px] text-stone-400 font-mono">DOCKET REFERENCE #{activeCase.id}</span>
                <h3 className="text-base font-bold text-stone-900 mt-0.5">{activeCase.type}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{activeCase.location.address}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">Current Status</span>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md inline-block">
                  {activeCase.status}
                </span>
              </div>
            </div>

            {/* Quick summary chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                <span className="text-[10px] text-stone-400 block font-medium">Police Investigation</span>
                <span className="font-semibold text-blue-900 mt-0.5 block">{activeCase.policeStatus}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                <span className="text-[10px] text-stone-400 block font-medium">Verified Volunteer</span>
                <span className="font-semibold text-amber-900 mt-0.5 block truncate">
                  {activeCase.assignedVolunteer?.name || 'Assigned'}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                <span className="text-[10px] text-stone-400 block font-medium">Medical Assistance</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">{activeCase.medicalStatus}</span>
              </div>
            </div>

            {/* Full chronological timeline */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-stone-900 block">Official Incident Progression Timeline</span>
              <div className="space-y-3">
                {activeCase.timeline.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="font-mono text-[11px] text-stone-400 shrink-0 w-16 mt-0.5">{event.time}</span>
                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <span className="font-medium text-stone-800">{event.event}</span>
                      <span className="text-[10px] text-stone-400 ml-2">[{event.actor}]</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
