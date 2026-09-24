import React, { useState } from 'react';
import {
  ShieldAlert,
  Mic,
  MessageSquare,
  Link as LinkIcon,
  Sparkles,
  PhoneCall,
  MapPin,
  Users,
  Compass,
  Bell,
  Clock,
  ArrowRight,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { NavigationTab, EmergencyContact, PublicReport, MissingPersonAlert } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface HomeDashboardProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onTriggerSos: (reason?: string) => void;
  isSosActive: boolean;
  safetyWord: string;
  contacts: EmergencyContact[];
  publicReports: PublicReport[];
  missingAlerts: MissingPersonAlert[];
  onOpenLiveSos: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigateTab,
  onTriggerSos,
  isSosActive,
  safetyWord,
  contacts,
  publicReports,
  missingAlerts,
  onOpenLiveSos,
}) => {
  const { t } = useTranslation();
  const [abortTimer, setAbortTimer] = useState<number | null>(null);
  const [voiceSimulated, setVoiceSimulated] = useState(false);

  // Handle manual SOS trigger with quick 3-second safety abort option
  const handleSosClick = () => {
    if (isSosActive) {
      onOpenLiveSos();
      return;
    }

    setAbortTimer(3);
    const interval = setInterval(() => {
      setAbortTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setAbortTimer(null);
          onTriggerSos('Emergency SOS Broadcast — Manual Trigger');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAbortSos = () => {
    setAbortTimer(null);
  };

  // Handle safety word simulation
  const handleSimulateVoice = () => {
    setVoiceSimulated(true);
    setTimeout(() => {
      setVoiceSimulated(false);
      onTriggerSos(`Hands-free Emergency Triggered via Safety Word: "${safetyWord}"`);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. TOP HERO AREA */}
      <div className="text-center space-y-2 pt-1 pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          <span>{t('app_tagline')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          ABHAYAA — Integrated Women & Girls Safety
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          Safety should not begin only after an incident occurs. Continuous lifecycle: Prevent → Detect → Protect → Respond → Report → Support.
        </p>
      </div>

      {/* 2. PRIMARY EMERGENCY CONTROL (BIG SOS BUTTON) */}
      <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden text-center space-y-5">
        <div className="relative z-10 max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-stone-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Instant Emergency Dispatch Integration (112 · Police · Volunteers)</span>
          </div>

          {/* Abort countdown overlay if triggered */}
          {abortTimer !== null ? (
            <div className="bg-rose-600/90 rounded-2xl p-6 space-y-3 animate-pulse border border-white/20">
              <span className="text-xs uppercase tracking-widest font-mono text-white/80">
                Broadcasting Emergency SOS in
              </span>
              <div className="text-5xl font-black font-mono text-white">{abortTimer}s</div>
              <p className="text-xs text-rose-100">
                Live GPS coords, camera evidence capture, and volunteer dispatches will initiate.
              </p>
              <button
                onClick={handleAbortSos}
                className="px-5 py-2 bg-white text-rose-800 font-bold rounded-xl text-xs shadow-md hover:bg-stone-100 cursor-pointer"
              >
                Cancel / Accidental Touch
              </button>
            </div>
          ) : (
            <div className="py-2">
              <button
                onClick={handleSosClick}
                className={`relative group mx-auto w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all transform active:scale-95 cursor-pointer ${
                  isSosActive
                    ? 'bg-rose-600 ring-8 ring-rose-500/40 animate-pulse'
                    : 'bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 hover:from-rose-500 hover:to-red-700 ring-8 ring-rose-500/20 hover:ring-rose-500/40'
                }`}
                title="Press to activate Emergency SOS"
              >
                <div className="text-3xl sm:text-4xl font-black tracking-wider">
                  {isSosActive ? 'ACTIVE' : 'SOS'}
                </div>
                <div className="text-[11px] font-bold tracking-widest uppercase mt-1 text-rose-100">
                  {isSosActive ? t('sos_view_live') : t('sos_help_now')}
                </div>
                {/* Visual pulse rings */}
                <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
              </button>
            </div>
          )}

          <div className="text-xs text-stone-300 flex items-center justify-center gap-4 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{contacts.length} Trusted Contacts</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>High-Precision GPS</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Emergency Capture</span>
            </span>
          </div>
        </div>

        {/* 3. SAFETY WORD / VOICE SOS TRIGGER DEMO */}
        <div className="relative z-10 max-w-lg mx-auto pt-4 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="text-xs font-bold text-white">
                  Safety Word Listener: <span className="text-emerald-400">ACTIVE</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Trigger Phrase: <strong className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded">"{safetyWord}"</strong> (Hands-free emergency activation)
              </p>
            </div>

            <button
              onClick={handleSimulateVoice}
              disabled={voiceSimulated || isSosActive}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap ${
                voiceSimulated
                  ? 'bg-amber-500 text-stone-900 animate-pulse'
                  : 'bg-white text-stone-900 hover:bg-stone-100'
              }`}
            >
              {voiceSimulated ? 'Detecting "ABHAYAA"...' : 'Simulate Safety Word Detected'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. NEARBY SAFETY / SAFETY MAP SHORTCUT */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                {t('nearby_safety_shortcut')}
              </h3>
              <p className="text-[11px] text-stone-500">
                Continuous geographic awareness & verified responders around you.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('map')}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <span>{t('open_map_btn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live distances grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div
            onClick={() => onNavigateTab('map')}
            className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">👮</span>
              <div>
                <strong className="text-blue-950 font-bold block">{t('map_police')}</strong>
                <span className="text-[10px] text-blue-700">PCR-18 Cruiser</span>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-blue-900">0.7 km</span>
          </div>

          <div
            onClick={() => onNavigateTab('map')}
            className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🟢</span>
              <div>
                <strong className="text-emerald-950 font-bold block">{t('map_volunteers')}</strong>
                <span className="text-[10px] text-emerald-700">Verified Escort Unit</span>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-emerald-900">0.3 km</span>
          </div>

          <div
            onClick={() => onNavigateTab('map')}
            className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🟢</span>
              <div>
                <strong className="text-emerald-950 font-bold block">{t('map_volunteers')}</strong>
                <span className="text-[10px] text-emerald-700">Verified Volunteer</span>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-emerald-900">0.9 km</span>
          </div>
        </div>
      </div>

      {/* 5. AI SAFETY ASSISTANT (BEFORE / PRE-INCIDENT ACCESS) */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                {t('safety_assistant_title')}
              </h2>
              <p className="text-xs text-stone-500">
                {t('safety_assistant_subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('safety')}
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{t('open_safety_hub')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action cards for Assistant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => onNavigateTab('safety')}
            className="p-4 rounded-2xl bg-stone-50 hover:bg-rose-50/60 border border-stone-200/80 hover:border-rose-200 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-stone-900 group-hover:text-rose-700">
                  {t('analyze_conversation')}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Paste chat messages or voice notes to scan for grooming, manipulation, secrecy demands, and coercion indicators.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('safety')}
            className="p-4 rounded-2xl bg-stone-50 hover:bg-rose-50/60 border border-stone-200/80 hover:border-rose-200 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-stone-900 group-hover:text-rose-700">
                  {t('check_link')}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Verify unknown links, fake modeling/job interviews, and lookalike domains before clicking or sharing details.
            </p>
          </div>
        </div>
      </div>

      {/* 5. QUICK SAFETY ACTIONS GRID (NO USER-FACING EVIDENCE VAULT) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Quick Safety Tools
          </h3>
          <span className="text-[11px] text-stone-400">Tap to access</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => onNavigateTab('safety')}
            className="p-3.5 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between text-left space-y-2 transition-all cursor-pointer shadow-2xs hover:border-stone-300"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-900 block">{t('safe_journey_tool')}</span>
              <span className="text-[10px] text-stone-500">Live trip check-ins</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('profile')}
            className="p-3.5 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between text-left space-y-2 transition-all cursor-pointer shadow-2xs hover:border-stone-300"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-900 block">{t('contacts_title')}</span>
              <span className="text-[10px] text-stone-500">{contacts.length} Contacts active</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('map')}
            className="p-3.5 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between text-left space-y-2 transition-all cursor-pointer shadow-2xs hover:border-stone-300"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-900 block">{t('nav_map')}</span>
              <span className="text-[10px] text-stone-500">Live Nearby Help</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('community')}
            className="p-3.5 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between text-left space-y-2 transition-all cursor-pointer shadow-2xs hover:border-stone-300"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-900 block">{t('verified_volunteers')}</span>
              <span className="text-[10px] text-stone-500">Verified Volunteers</span>
            </div>
          </button>
        </div>
      </div>

      {/* 6. RECENT SAFETY INFORMATION & VERIFIED ALERTS */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Verified Safety Alerts & Public Warnings
            </h3>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">LIVE CIVIC NOTICES</span>
        </div>

        <div className="space-y-2.5">
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <strong className="text-amber-900 font-bold">
                  Civic Safety Notice: Metro Line 2A Construction Zone
                </strong>
                <span className="text-[10px] text-amber-700 font-mono">15m ago</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Street lights non-operational near West Gate Exit between 9 PM and 5 AM. Beat Marshal 4 patrol has been stationed. Prefer well-lit Eastern corridor.
              </p>
            </div>
          </div>

          <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-2xl flex items-start gap-3 text-xs">
            <ShieldAlert className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <strong className="text-stone-900 font-bold">
                  Cyber Crime Warning: Fake Instagram Part-time Job Scams
                </strong>
                <span className="text-[10px] text-stone-500 font-mono">Today</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-snug">
                Unverified agencies requesting private video auditions and Telegram deposits. Use the AI Link Checker before providing credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. COMMUNITY & CITIZEN PARTICIPATION */}
      <div className="bg-stone-50/80 rounded-3xl border border-stone-200/80 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-800">
            Community & Citizen Participation
          </span>
          <button
            onClick={() => onNavigateTab('community')}
            className="text-[11px] font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div
            onClick={() => onNavigateTab('community')}
            className="p-3.5 bg-white rounded-2xl border border-stone-200 hover:border-stone-300 transition-colors cursor-pointer space-y-1"
          >
            <span className="font-bold text-stone-900 block">Report Unsafe Spot</span>
            <p className="text-[11px] text-stone-500">
              Report dark alleys, stalking spots, or transit hazards. Reporter identity protected.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('community')}
            className="p-3.5 bg-white rounded-2xl border border-stone-200 hover:border-stone-300 transition-colors cursor-pointer space-y-1"
          >
            <span className="font-bold text-stone-900 block">
              Missing Person Alerts ({missingAlerts.length})
            </span>
            <p className="text-[11px] text-stone-500">
              Police bulletins with photos and secure citizen sighting forms.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('community')}
            className="p-3.5 bg-white rounded-2xl border border-stone-200 hover:border-stone-300 transition-colors cursor-pointer space-y-1"
          >
            <span className="font-bold text-stone-900 block">Awareness & Rights</span>
            <p className="text-[11px] text-stone-500">
              BNS Sec 78/79, grooming stage checklists, and personal safety quizzes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
