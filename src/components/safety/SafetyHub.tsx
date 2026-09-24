import React, { useState } from 'react';
import {
  MessageSquareWarning,
  FileSearch,
  Link2,
  Navigation as NavIcon,
  Mic,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  CircleDot,
  Loader2,
} from 'lucide-react';
import { AiSafetyAssistant } from '../before/AiSafetyAssistant';
import { ConversationAnalyzer } from '../before/ConversationAnalyzer';
import { LinkAnalyzer } from '../before/LinkAnalyzer';
import { SafeJourneyTracker } from '../before/SafeJourneyTracker';
import { EmergencyContact, EvidenceItem } from '../../types';
import { usePermissions } from '../../context/PermissionContext';

interface SafetyHubProps {
  onTriggerSos: (reason?: string) => void;
  contacts: EmergencyContact[];
  onSaveToEvidence: (item: EvidenceItem) => void;
  safetyWord: string;
}

export const SafetyHub: React.FC<SafetyHubProps> = ({
  onTriggerSos,
  contacts,
  onSaveToEvidence,
  safetyWord,
}) => {
  const { permissions, requestMicrophone } = usePermissions();
  const micState = permissions.microphone.state;
  const [subTab, setSubTab] = useState<'assistant' | 'conversation' | 'link' | 'journey' | 'voice-demo'>('assistant');
  const [voiceSimulated, setVoiceSimulated] = useState(false);

  const navItems = [
    { id: 'assistant' as const, label: 'AI Safety Assistant', icon: Sparkles },
    { id: 'conversation' as const, label: 'Analyze Conversation', icon: FileSearch },
    { id: 'link' as const, label: 'Check Suspicious Link', icon: Link2 },
    { id: 'journey' as const, label: 'Safe Journey Protocol', icon: NavIcon },
    { id: 'voice-demo' as const, label: 'Safety Word Listener', icon: Mic },
  ];

  const handleSimulateVoice = () => {
    setVoiceSimulated(true);
    setTimeout(() => {
      setVoiceSimulated(false);
      onTriggerSos(`Hands-free Emergency Triggered via Safety Word: "${safetyWord}"`);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Safety & Risk Detection
            </span>
          </div>
          <h2 className="text-xl font-black text-stone-900">
            Safety Assistance & Risk Analysis
          </h2>
          <p className="text-xs text-stone-500 max-w-xl">
            Detect suspicious patterns, grooming, coercion, and digital traps before an incident occurs.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-2xl text-xs space-y-0.5 shrink-0">
          <span className="text-[10px] text-stone-400 font-mono block">Safety Principle</span>
          <span className="font-bold text-stone-800">Prevent · Detect · Protect</span>
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-600' : 'text-stone-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active sub-view */}
      <div>
        {subTab === 'assistant' && (
          <AiSafetyAssistant onTriggerSos={() => onTriggerSos('Emergency SOS Triggered from AI Assistant')} />
        )}
        {subTab === 'conversation' && (
          <ConversationAnalyzer onSaveToEvidence={onSaveToEvidence} />
        )}
        {subTab === 'link' && <LinkAnalyzer />}
        {subTab === 'journey' && (
          <SafeJourneyTracker
            contacts={contacts}
            onTriggerEmergency={() => onTriggerSos('Safe Journey Protocol Alert — Escorted Escalation')}
          />
        )}
        {subTab === 'voice-demo' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-rose-600 animate-pulse" />
                <h3 className="text-base font-bold text-stone-900">
                  Emergency Safety Word & Voice SOS
                </h3>
              </div>
              <p className="text-xs text-stone-500">
                Configure a personal spoken phrase to trigger instant emergency dispatch hands-free when you cannot operate the phone physically.
              </p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-stone-700 block">
                    Configured Emergency Word:
                  </span>
                  <div className="text-2xl font-black font-mono text-stone-900 tracking-wider">
                    "{safetyWord}"
                  </div>
                </div>

                {/* Real Microphone Status Badge */}
                <div>
                  {micState === 'granted' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Microphone Granted ✓</span>
                    </span>
                  ) : micState === 'denied' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Microphone Denied</span>
                    </span>
                  ) : micState === 'requesting' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Requesting Microphone…</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-200/80 text-stone-800 border border-stone-300 text-xs font-bold">
                      <CircleDot className="w-3.5 h-3.5 text-stone-500" />
                      <span>Microphone Not Granted</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Permission Actions */}
              {micState === 'not-granted' && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-start gap-2 text-xs text-amber-900">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Microphone permission required for Safety Word detection.</strong>
                      <span className="text-[11px] text-amber-800">
                        ABHAYAA requires audio permission to listen for your emergency keyword. Click below to allow.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => requestMicrophone()}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Allow Microphone
                  </button>
                </div>
              )}

              {micState === 'denied' && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <div className="flex items-start gap-2 text-xs text-rose-900">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Safety Word listener unavailable because microphone permission is denied.</strong>
                      <span className="text-[11px] text-rose-800">
                        To enable voice detection, unblock microphone access in your browser site permissions and refresh.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-stone-600 leading-relaxed">
                When this phrase is spoken in distress, ABHAYAA triggers the full emergency sequence: live location broadcasting, trusted contact alerts, 30s camera evidence recording, and responder dispatch.
              </p>

              {/* Web Limitation Disclosure & Explicit Prototype Simulator */}
              <div className="pt-2 border-t border-stone-200/80 space-y-2">
                <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <span>Prototype Safety Word Simulation</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Standard web browsers cannot listen continuously in background while device is locked or tab is minimized. Use this simulation button to test the emergency sequence end-to-end.
                </p>

                <button
                  onClick={handleSimulateVoice}
                  disabled={voiceSimulated}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    voiceSimulated
                      ? 'bg-amber-500 text-stone-900 animate-pulse'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {voiceSimulated
                    ? 'Detecting "ABHAYAA" — Initiating Emergency Dispatch...'
                    : 'Simulate Safety Word Detected ("ABHAYAA")'}
                </button>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-700 space-y-1">
              <strong className="font-bold text-stone-900">Native Android Production Architecture:</strong>
              <p className="text-[11px] leading-relaxed text-stone-600">
                In the native Android app, ABHAYAA binds to a foreground hotword service using Google Voice Match / offline Porcupine Wake Word engine to wake up hands-free even with the screen off.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
