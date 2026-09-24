import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  Square,
  Share2,
  Navigation,
  CheckCircle,
  Bell,
} from 'lucide-react';
import { EmergencyContact } from '../../types';

interface SafeJourneyTrackerProps {
  contacts: EmergencyContact[];
  onTriggerEmergency: () => void;
}

export const SafeJourneyTracker: React.FC<SafeJourneyTrackerProps> = ({
  contacts,
  onTriggerEmergency,
}) => {
  const [destination, setDestination] = useState('Sunshine Girls Hostel, Andheri West');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [checkInSecondsRemaining, setCheckInSecondsRemaining] = useState(5 * 60);
  const [hasSharedLink, setHasSharedLink] = useState(false);

  // Simulated GPS waypoints
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ time: string; note: string; status: string }>>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onTriggerEmergency();
            return 0;
          }
          return prev - 1;
        });

        setCheckInSecondsRemaining((prev) => {
          if (prev <= 1) {
            return 5 * 60; // reset 5-min check-in
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, onTriggerEmergency]);

  const handleStartJourney = () => {
    setIsActive(true);
    setSecondsRemaining(estimatedMinutes * 60);
    setCheckInSecondsRemaining(5 * 60);
    setBreadcrumbs([
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: 'Journey started from Metro Gate 2',
        status: 'Normal',
      },
    ]);
  };

  const handleEndJourney = () => {
    setIsActive(false);
    setBreadcrumbs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: 'Safely arrived at destination. Journey ended.',
        status: 'Completed',
      },
    ]);
  };

  const handleManualCheckIn = () => {
    setCheckInSecondsRemaining(5 * 60);
    setBreadcrumbs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: 'Manual Safe Check-In confirmed by user',
        status: 'Safe',
      },
    ]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Before · Transit</span>
          <span className="text-stone-300">/</span>
          <span className="text-xs text-stone-500">Continuous Monitoring</span>
        </div>
        <h2 className="text-lg font-bold text-stone-900 mt-1">Safe Journey Protocol & Automated Check-In</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Share your real-time path with trusted contacts. If you do not check in within the safety window, ABHAYAA initiates an automatic emergency dispatch request.
        </p>
      </div>

      {!isActive ? (
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Destination / Expected Route
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-rose-600 absolute left-3 top-3" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Home, University Library, Office"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Estimated Transit Time
              </label>
              <select
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Check-In Interval
              </label>
              <div className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-600 font-medium">
                Every 5 minutes
              </div>
            </div>
          </div>

          {/* Primary contact share note */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-stone-800 block">Trusted Contact to Notify:</span>
              <span className="text-stone-500 text-[11px]">
                {contacts[0]?.name || 'Primary Contact'} ({contacts[0]?.phone || 'Default'})
              </span>
            </div>
            <button
              onClick={() => setHasSharedLink(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg font-medium text-stone-700 text-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{hasSharedLink ? 'Link Shared ✓' : 'Share Link'}</span>
            </button>
          </div>

          <button
            onClick={handleStartJourney}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Start Monitored Safe Journey</span>
          </button>
        </div>
      ) : (
        /* Active journey view */
        <div className="space-y-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-900">JOURNEY ACTIVELY MONITORED</span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 font-medium">Heading to: {destination}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-[10px] text-emerald-700 block">Total Left</span>
                <span className="text-lg font-extrabold text-emerald-950 font-mono tabular-nums">
                  {formatTime(secondsRemaining)}
                </span>
              </div>
              <div className="h-8 w-px bg-emerald-200" />
              <div className="text-center">
                <span className="text-[10px] text-emerald-700 block">Check-In Due In</span>
                <span className="text-lg font-extrabold text-rose-700 font-mono tabular-nums">
                  {formatTime(checkInSecondsRemaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons during journey */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleManualCheckIn}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>I am Safe — Confirm Check-In</span>
            </button>

            <button
              onClick={handleEndJourney}
              className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-200"
            >
              <Square className="w-3.5 h-3.5 text-stone-500" />
              <span>Arrived Safely — End Journey</span>
            </button>
          </div>

          {/* Breadcrumb timeline */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-700 block mb-2">Live Trip Breadcrumb Log</span>
            <div className="space-y-2 text-xs">
              {breadcrumbs.map((b, idx) => (
                <div key={idx} className="flex items-center gap-3 text-stone-600">
                  <span className="font-mono text-[11px] text-stone-400">{b.time}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="flex-1 font-medium">{b.note}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
