import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  MapPin,
  Users,
  Radio,
  CheckCircle2,
  Clock,
  PhoneCall,
  AlertCircle,
  Car,
  HeartPulse,
  Share2,
  Check,
  XCircle,
  Lock,
} from 'lucide-react';
import { Incident, EmergencyContact, NavigationTab } from '../../types';
import { EmergencyMap } from '../emergency/EmergencyMap';
import { EmergencyCameraCapture } from '../emergency/EmergencyCameraCapture';
import { useTranslation } from '../../i18n/LanguageContext';

interface EmergencyDashboardProps {
  isSosActive: boolean;
  activeIncident: Incident | null;
  onTriggerSos: (reason?: string) => void;
  onCancelSos: () => void;
  contacts: EmergencyContact[];
  onNavigateTab?: (tab: NavigationTab) => void;
  onEvidenceCaptured?: (item: any) => void;
}

export const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({
  isSosActive,
  activeIncident,
  onTriggerSos,
  onCancelSos,
  contacts,
  onNavigateTab,
  onEvidenceCaptured,
}) => {
  const { t } = useTranslation();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live Location tracking state
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; address: string }>(
    activeIncident?.location || {
      lat: 19.076,
      lng: 72.8777,
      address: 'SV Road, Andheri West, Mumbai, MH',
    }
  );

  // Try to acquire real geolocation if supported
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: `Live GPS: ${pos.coords.latitude.toFixed(4)} N, ${pos.coords.longitude.toFixed(4)} E (Accuracy: ${Math.round(
              pos.coords.accuracy
            )}m)`,
          });
        },
        (err) => {
          console.warn('Geolocation notice:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Elapsed timer when SOS is active
  useEffect(() => {
    let timer: any = null;
    if (isSosActive) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSosActive]);

  const incidentId = activeIncident?.id || 'ABH-2026-LIVE';

  // Format elapsed time (MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Emergency Status Banner */}
      <div
        className={`rounded-2xl p-5 border text-white shadow-lg transition-all ${
          isSosActive
            ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 border-rose-800'
            : 'bg-stone-800 border-stone-700'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-black/30 px-2.5 py-0.5 rounded-full border border-white/20">
                  {isSosActive ? t('sos_active') : 'Incident Inactive'}
                </span>
                <span className="font-mono text-xs text-rose-100">
                  ID: {incidentId}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
                {isSosActive ? t('emergency_title') : 'Live Emergency Response Desk'}
              </h1>
              <p className="text-xs text-rose-100/90 mt-0.5">
                {t('emergency_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSosActive && (
              <div className="bg-black/40 border border-white/20 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-rose-200 block">
                  {t('time_elapsed')}
                </span>
                <span className="text-lg font-mono font-bold tracking-widest text-white">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            )}

            {isSosActive ? (
              <button
                onClick={onCancelSos}
                className="px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('sos_cancel_safe')}</span>
              </button>
            ) : (
              <button
                onClick={() => onTriggerSos('Manual Emergency Desk SOS')}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                {t('sos_help_now')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Emergency Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Location</span>
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>{t('status_acquired')}</span>
          </div>
          <p className="text-[10px] text-stone-500 truncate mt-0.5">{currentCoords.address}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Contacts</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>3 {t('status_notified')}</span>
          </div>
          <p className="text-[10px] text-stone-500 truncate mt-0.5">Live tracking SMS sent</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Police Dispatch</span>
            <Car className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xs font-bold text-blue-700 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse text-blue-600" />
            <span>PCR-18 en route</span>
          </div>
          <p className="text-[10px] text-stone-500 truncate mt-0.5">ETA: ~3 mins [SIMULATED]</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified Volunteers</span>
            <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>3 Available Nearby</span>
          </div>
          <p className="text-[10px] text-stone-500 truncate mt-0.5">Nearest: 320m away</p>
        </div>
      </div>

      {/* SECTION 1: LARGE INTERACTIVE EMERGENCY MAP */}
      <EmergencyMap
        userLocation={currentCoords}
        isSosActive={isSosActive}
      />

      {/* SECTION 2: REAL DEVICE CAMERA EVIDENCE CAPTURE (NO USER VAULT) */}
      <EmergencyCameraCapture
        incidentId={incidentId}
        isSosActive={isSosActive}
        onEvidencePreserved={onEvidenceCaptured}
      />

      {/* SECTION 3: INCIDENT AUDIT TIMELINE */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">
              {t('incident_timeline_title')}
            </h3>
          </div>
          <span className="text-[11px] text-stone-500">
            Official chronological audit log for legal & police documentation
          </span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
          {(activeIncident?.timeline || [
            { time: '10:31:04', event: 'SOS activated by user', actor: 'Citizen' },
            { time: '10:31:05', event: 'Live GPS location acquired (4.8m accuracy)', actor: 'System' },
            { time: '10:31:06', event: 'Trusted emergency contacts notified via SMS', actor: 'System' },
            { time: '10:31:07', event: 'Nearby verified volunteers searched (3 found)', actor: 'System' },
            { time: '10:31:08', event: 'Police Control Room (PCR-18) dispatch initiated', actor: 'Police' },
            { time: '10:31:09', event: 'Emergency camera evidence capture started', actor: 'System' },
          ]).map((item, idx) => (
            <div key={idx} className="relative flex items-start gap-3 text-xs">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-rose-600 border-2 border-white shadow-xs"></span>
              <span className="font-mono text-stone-400 shrink-0">{item.time}</span>
              <div>
                <span className="font-semibold text-stone-800">{item.event}</span>
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                  {item.actor}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-stone-400" />
            <span>Captured visual and audio records are stored in encrypted authority vaults.</span>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('profile')}
              className="text-stone-700 hover:text-stone-900 font-semibold underline cursor-pointer"
            >
              {t('prepare_complaint_btn')} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
