import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Printer,
  Download,
  Send,
  Edit3,
  Info,
  Shield,
  FileCheck,
} from 'lucide-react';
import { draftComplaint } from '../../services/api';
import { ComplaintDraft } from '../../types';
import { sampleComplaintDescriptions } from '../../data/mockData';

interface AiComplaintAssistantProps {
  onCaseSubmitted: (draft: ComplaintDraft) => void;
}

export const AiComplaintAssistant: React.FC<AiComplaintAssistantProps> = ({
  onCaseSubmitted,
}) => {
  const [description, setDescription] = useState(sampleComplaintDescriptions[0].text);
  const [complainantName, setComplainantName] = useState('Ananya Sharma');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<ComplaintDraft | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleGenerateDraft = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setIsSubmitted(false);
    try {
      const data = await draftComplaint(description, { name: complainantName });
      setDraft(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof ComplaintDraft, value: any) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  const handleSubmitFormal = () => {
    if (!draft) return;
    setIsSubmitted(true);
    onCaseSubmitted(draft);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">After · Reporting</span>
            <span className="text-stone-300">/</span>
            <span className="text-xs text-stone-500">Legal Documentation</span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-1">AI-Assisted Police Complaint Draft Generator</h2>
          <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
            Describe what happened in your own words. The AI organizes your statement into a legally sound, chronological formal complaint ready for review before submission.
          </p>
        </div>

        {/* Sample presets */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-stone-400 font-medium">Load Preset Narrative:</span>
          {sampleComplaintDescriptions.map((sc, i) => (
            <button
              key={i}
              onClick={() => {
                setDescription(sc.text);
                setDraft(null);
                setIsSubmitted(false);
              }}
              className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 rounded-md transition-colors cursor-pointer border border-stone-200/60"
            >
              Preset {i + 1}: {sc.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Your Incident Narrative (Natural Language)
            </label>
            <textarea
              rows={9}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe where you were, what the person did, what words or gestures were used, vehicle details, whether you were followed..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 placeholder-stone-400 leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Complainant Name</label>
            <input
              type="text"
              value={complainantName}
              onChange={(e) => setComplainantName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <button
            onClick={handleGenerateDraft}
            disabled={loading || !description.trim()}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                <span>Converting narrative into legal complaint draft...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generate Structured Complaint Draft</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Formal Draft with Editing & Review */}
        <div className="md:col-span-7 flex flex-col">
          {!draft && !loading && (
            <div className="bg-stone-50/70 border border-stone-200/80 rounded-xl p-6 flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <FileText className="w-8 h-8 text-stone-400" />
              <div className="text-xs font-semibold text-stone-700">No Draft Generated Yet</div>
              <p className="text-[11px] text-stone-500 max-w-sm">
                Enter your narrative on the left and click Generate. The system will categorize offenses under Bharatiya Nyaya Sanhita (BNS) and compile an evidence checklist.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-600" />
              <div className="text-xs font-semibold text-stone-800">Synthesizing Formal Complaint</div>
              <p className="text-[11px] text-stone-500 max-w-xs">
                Extracting chronological timeline, identifying witness touchpoints, and structuring requested police interventions...
              </p>
            </div>
          )}

          {draft && (
            <div className="bg-stone-50/50 border border-stone-200 rounded-xl p-5 space-y-4 text-xs max-h-[550px] overflow-y-auto">
              {/* Mandatory Review Notice Banner */}
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center gap-2 text-amber-900 text-[11px] font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{draft.reviewNotice}</span>
              </div>

              {/* Header Fields (Editable) */}
              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-200">
                <div>
                  <span className="text-[10px] text-stone-400 font-semibold block uppercase">Complaint Subject</span>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full font-bold text-stone-900 text-xs border-b border-stone-200 py-1 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Incident Category</span>
                    <input
                      type="text"
                      value={draft.incidentCategory}
                      onChange={(e) => handleFieldChange('incidentCategory', e.target.value)}
                      className="w-full font-medium text-stone-800 text-xs border-b border-stone-200 py-0.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Approx Date & Time</span>
                    <input
                      type="text"
                      value={draft.approxDateTime}
                      onChange={(e) => handleFieldChange('approxDateTime', e.target.value)}
                      className="w-full font-medium text-stone-800 text-xs border-b border-stone-200 py-0.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-stone-400 block">Specific Location / Platform</span>
                  <input
                    type="text"
                    value={draft.locationOrPlatform}
                    onChange={(e) => handleFieldChange('locationOrPlatform', e.target.value)}
                    className="w-full font-medium text-stone-800 text-xs border-b border-stone-200 py-0.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Accused Information (Editable) */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-800 block">Accused / Suspect Information</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Identity Status</span>
                    <span className="font-medium text-stone-800">{draft.accusedDetails.identityStatus}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Name or Handle</span>
                    <span className="font-medium text-stone-800">{draft.accusedDetails.nameOrHandle}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Description / Identifiers</span>
                  <p className="text-stone-700 text-xs bg-stone-50 p-2 rounded border border-stone-100 mt-1">
                    {draft.accusedDetails.physicalDescription}
                  </p>
                </div>
              </div>

              {/* Chronological Sequence */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-800 block">Factual Chronology of Incident</span>
                <ol className="space-y-1.5 list-decimal pl-4 text-xs text-stone-700">
                  {draft.factualChronology.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Legal provisions referenced */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-800 block">
                  Applicable Legal Reference Sections (BNS / IPC / IT Act)
                </span>
                <div className="space-y-1">
                  {draft.legalReferences.map((ref, idx) => (
                    <div key={idx} className="text-[11px] text-stone-600 bg-stone-50 px-2.5 py-1 rounded border border-stone-200/60 font-mono">
                      {ref}
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Checklist */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                <span className="text-xs font-bold text-stone-800 block">Recommended Evidence Attachments</span>
                <ul className="space-y-1 text-[11px] text-stone-600">
                  {draft.evidenceChecklist.map((ev, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requested Police Relief */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1">
                <span className="text-xs font-bold text-stone-800 block">Requested Official Relief</span>
                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-2.5 rounded">
                  {draft.requestedRelief}
                </p>
              </div>

              {/* Submission actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-stone-200 transition-colors"
                >
                  <Printer className="w-4 h-4 text-stone-500" />
                  <span>Print Formal Letter</span>
                </button>

                <button
                  onClick={handleSubmitFormal}
                  disabled={isSubmitted}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSubmitted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                  }`}
                >
                  {isSubmitted ? (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Complaint Submitted to Police Desk (Case Docket Created)</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Review & Submit to Authority Desk (Simulation)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
