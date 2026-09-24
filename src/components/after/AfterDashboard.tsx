import React, { useState } from 'react';
import {
  FileText,
  FolderLock,
  FolderKanban,
  HeartHandshake,
} from 'lucide-react';
import { AiComplaintAssistant } from './AiComplaintAssistant';
import { EvidenceVault } from './EvidenceVault';
import { CaseTrackingDocket } from './CaseTrackingDocket';
import { RecoverySupportDirectory } from './RecoverySupportDirectory';
import { EvidenceItem, Incident, ComplaintDraft } from '../../types';

interface AfterDashboardProps {
  evidenceList: EvidenceItem[];
  onAddEvidence: (item: EvidenceItem) => void;
  incidents: Incident[];
  onCaseSubmitted: (draft: ComplaintDraft) => void;
}

export const AfterDashboard: React.FC<AfterDashboardProps> = ({
  evidenceList,
  onAddEvidence,
  incidents,
  onCaseSubmitted,
}) => {
  const [subTab, setSubTab] = useState<'complaint' | 'vault' | 'docket' | 'recovery'>('complaint');

  const navItems = [
    { id: 'complaint' as const, label: 'AI Complaint Generator', icon: FileText },
    { id: 'vault' as const, label: 'Evidence Vault', icon: FolderLock },
    { id: 'docket' as const, label: 'Case Status Docket', icon: FolderKanban },
    { id: 'recovery' as const, label: 'Recovery & Legal Aid', icon: HeartHandshake },
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

      {/* Sub-view render */}
      <div>
        {subTab === 'complaint' && <AiComplaintAssistant onCaseSubmitted={onCaseSubmitted} />}
        {subTab === 'vault' && <EvidenceVault evidenceList={evidenceList} onAddEvidence={onAddEvidence} />}
        {subTab === 'docket' && <CaseTrackingDocket incidents={incidents} />}
        {subTab === 'recovery' && <RecoverySupportDirectory />}
      </div>
    </div>
  );
};
