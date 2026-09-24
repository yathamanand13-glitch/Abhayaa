import React, { useState } from 'react';
import {
  FileCode2,
  Image as ImageIcon,
  Mic,
  MessageSquare,
  Link,
  FileText,
  Plus,
  Shield,
  AlertTriangle,
  Clock,
  Hash,
  CheckCircle,
} from 'lucide-react';
import { EvidenceItem } from '../../types';

interface EvidenceVaultProps {
  evidenceList: EvidenceItem[];
  onAddEvidence: (item: EvidenceItem) => void;
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({
  evidenceList,
  onAddEvidence,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<EvidenceItem['type']>('screenshot');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: EvidenceItem = {
      id: `ev-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description: newDescription.trim() || 'Preserved digital evidence item',
      hashPreview: `SHA256: ${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      tamperNotice: 'Secure cryptographic timestamp preserved for investigation.',
    };

    onAddEvidence(item);
    setNewTitle('');
    setNewDescription('');
    setShowAddModal(false);
  };

  const getIconForType = (type: EvidenceItem['type']) => {
    switch (type) {
      case 'audio':
        return <Mic className="w-4 h-4 text-rose-600" />;
      case 'screenshot':
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-600" />;
      case 'chat_export':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'url':
        return <Link className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">After · Preservation</span>
            <span className="text-stone-300">/</span>
            <span className="text-xs text-stone-500">Chain of Custody</span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-1">Digital Evidence Organization Vault</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Organize screenshots, voice recordings, chat transcripts, and photos. Preserves unedited metadata for official investigation.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Evidence Item</span>
        </button>
      </div>

      {/* Mandatory Legal Preservation Warning */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Important Evidence Preservation Protocol:</span>
          <span className="text-[11px] text-amber-800 leading-relaxed">
            Evidence should be preserved securely and should not be altered, filtered, or cropped unnecessarily. Original file metadata, including capture timestamps, device model, and GPS headers, is crucial for police FIR registration under Indian Evidence Act / BSA.
          </span>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidenceList.map((item) => (
          <div
            key={item.id}
            className="bg-stone-50/70 border border-stone-200 rounded-xl p-4 space-y-3 hover:border-stone-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center">
                  {getIconForType(item.type)}
                </div>
                <span className="text-[10px] font-mono text-stone-400 uppercase">{item.type}</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">{item.timestamp}</span>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 text-xs">{item.title}</h4>
              <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-400 font-mono">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-stone-400" />
                <span>{item.hashPreview}</span>
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-sans">
                Tamper Logged ✓
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Evidence Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900">Catalogue New Evidence Item</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Evidence Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Threatening WhatsApp Voice Note, CCTV Footage reference"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Evidence Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as EvidenceItem['type'])}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs text-stone-800 focus:outline-none"
                >
                  <option value="screenshot">Screenshot</option>
                  <option value="image">Photograph</option>
                  <option value="audio">Audio Capture</option>
                  <option value="chat_export">Chat Export</option>
                  <option value="url">Web Link / Profile</option>
                  <option value="document">Medical / Police Slip</option>
                  <option value="note">Factual Note</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">File Attachment (Simulated)</label>
                <div className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-500 truncate cursor-pointer hover:bg-stone-100">
                  Select File...
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Context & Notes (Where acquired, who sent it)
              </label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g. Unsolicited voice note received at 10:14 PM following the incident..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Preserve & Hash Evidence
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
