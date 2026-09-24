import React, { useState } from 'react';
import {
  MessageSquareWarning,
  FileSearch,
  Link2,
  Navigation as NavIcon,
  Bell,
  BookOpen,
} from 'lucide-react';
import { AiSafetyAssistant } from './AiSafetyAssistant';
import { ConversationAnalyzer } from './ConversationAnalyzer';
import { LinkAnalyzer } from './LinkAnalyzer';
import { SafeJourneyTracker } from './SafeJourneyTracker';
import { SafetyNewsAndAlerts } from './SafetyNewsAndAlerts';
import { AwarenessCenter } from './AwarenessCenter';
import { EmergencyContact, EvidenceItem } from '../../types';

interface BeforeDashboardProps {
  onTriggerSos: () => void;
  contacts: EmergencyContact[];
  onSaveToEvidence: (item: EvidenceItem) => void;
}

export const BeforeDashboard: React.FC<BeforeDashboardProps> = ({
  onTriggerSos,
  contacts,
  onSaveToEvidence,
}) => {
  const [subTab, setSubTab] = useState<'assistant' | 'conversation' | 'link' | 'journey' | 'news' | 'awareness'>('assistant');

  const navItems = [
    { id: 'assistant' as const, label: 'AI Safety Assistant', icon: MessageSquareWarning },
    { id: 'conversation' as const, label: 'Analyze Conversation', icon: FileSearch },
    { id: 'link' as const, label: 'Check Suspicious Link', icon: Link2 },
    { id: 'journey' as const, label: 'Safe Journey Protocol', icon: NavIcon },
    { id: 'news' as const, label: 'Verified Alerts & News', icon: Bell },
    { id: 'awareness' as const, label: 'Awareness & Rights', icon: BookOpen },
  ];

  return (
    <div className="space-y-5">
      {/* Sub-navigation bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-stone-100 p-1.5 rounded-xl border border-stone-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
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
        {subTab === 'assistant' && <AiSafetyAssistant onTriggerSos={onTriggerSos} />}
        {subTab === 'conversation' && <ConversationAnalyzer onSaveToEvidence={onSaveToEvidence} />}
        {subTab === 'link' && <LinkAnalyzer />}
        {subTab === 'journey' && <SafeJourneyTracker contacts={contacts} onTriggerEmergency={onTriggerSos} />}
        {subTab === 'news' && <SafetyNewsAndAlerts />}
        {subTab === 'awareness' && <AwarenessCenter />}
      </div>
    </div>
  );
};
