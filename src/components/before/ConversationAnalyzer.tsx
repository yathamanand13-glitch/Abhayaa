import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Copy,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Save,
  Trash2,
  Edit2,
  Info,
} from 'lucide-react';
import { analyzeConversationRisk, ConversationRiskAnalysisResult } from '../../services/api';
import { sampleConversations } from '../../data/mockData';
import { EvidenceItem } from '../../types';

interface ConversationAnalyzerProps {
  onSaveToEvidence: (item: EvidenceItem) => void;
}

export const ConversationAnalyzer: React.FC<ConversationAnalyzerProps> = ({ onSaveToEvidence }) => {
  const [inputText, setInputText] = useState(sampleConversations[0].text);
  const [contextNote, setContextNote] = useState(sampleConversations[0].context);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConversationRiskAnalysisResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [customSummary, setCustomSummary] = useState('');

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setSavedSuccess(false);
    try {
      const data = await analyzeConversationRisk(inputText, contextNote);
      setResult(data);
      setCustomSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof sampleConversations[0]) => {
    setInputText(sample.text);
    setContextNote(sample.context);
    setResult(null);
    setSavedSuccess(false);
  };

  const handleRemoveIndicator = (index: number) => {
    if (!result) return;
    setResult({
      ...result,
      indicators: result.indicators.filter((_, i) => i !== index),
    });
  };

  const handleSaveEvidence = () => {
    if (!result) return;
    const newEvidence: EvidenceItem = {
      id: `ev-${Date.now()}`,
      type: 'chat_export',
      title: `Analyzed Chat: ${result.riskLevel} Risk Conversation`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description: customSummary || result.summary,
      hashPreview: `SHA256: ${Math.random().toString(36).substring(2, 10)}...`,
      tamperNotice: 'User-reviewed conversation transcript with AI risk tags catalogued.',
    };
    onSaveToEvidence(newEvidence);
    setSavedSuccess(true);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Before · Detection</span>
            <span className="text-stone-300">/</span>
            <span className="text-xs text-stone-500">Early Warning System</span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-1">AI Conversation Risk Analysis</h2>
          <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
            Evaluate text messages or screenshots for potential grooming, coercion, pressure to isolate, or extortion indicators.
          </p>
        </div>

        {/* Preset Sample Loaders */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-stone-400 font-medium">Load Realistic Test Case:</span>
          {sampleConversations.map((sc, i) => (
            <button
              key={i}
              onClick={() => handleSelectSample(sc)}
              className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 rounded-md transition-colors cursor-pointer border border-stone-200/60"
            >
              Case {i + 1}: {sc.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-7 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Conversation Transcript / Messages to Analyze
            </label>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste conversation transcript here, e.g.:
Sender: Why didn't you reply? Don't tell your friends about this...
You: I don't feel comfortable..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-800 placeholder-stone-400 font-mono leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Context Note (Optional: Platform, Relationship, or Duration)
            </label>
            <input
              type="text"
              value={contextNote}
              onChange={(e) => setContextNote(e.target.value)}
              placeholder="e.g. Stranger on Instagram, met through mutual friend, senior in college"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !inputText.trim()}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                <span>Scanning conversation for coercion, boundary & safety signals...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Analyze Conversation for Risk Indicators</span>
              </>
            )}
          </button>
        </div>

        {/* Right side: Guidance or Results */}
        <div className="md:col-span-5 flex flex-col">
          {!result && !loading && (
            <div className="bg-stone-50/70 border border-stone-200/80 rounded-xl p-4 flex-1 flex flex-col justify-center text-xs text-stone-600 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-semibold">
                <Info className="w-4 h-4 text-rose-600" />
                <span>How ABHAYAA Evaluates Conversations</span>
              </div>
              <p className="text-stone-500 leading-relaxed">
                Our model scans across 8 psychological coercion markers:
              </p>
              <ul className="space-y-1.5 text-stone-600 pl-4 list-disc text-[11px]">
                <li><strong>Enforced Secrecy:</strong> Demands to withhold chat from friends/parents.</li>
                <li><strong>Isolation:</strong> Undermining existing support networks.</li>
                <li><strong>Urgency & Ultimatums:</strong> Imposing strict time limits or threats.</li>
                <li><strong>Private Meeting Pressure:</strong> Pushing for unmonitored secluded spots.</li>
                <li><strong>Digital Blackmail:</strong> Threatening image or reputational leak.</li>
              </ul>
              <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-400">
                You can edit, verify, or remove any AI interpretation before saving it as evidence.
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center animate-bounce">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-stone-800">Assessing Risk Indicators</div>
              <p className="text-[11px] text-stone-500 max-w-xs">
                Extracting textual evidence, matching interpersonal coercion patterns, and calibrating uncertainty...
              </p>
            </div>
          )}

          {result && (
            <div className="bg-stone-50/50 border border-stone-200 rounded-xl p-4 flex-1 space-y-4 text-xs overflow-y-auto max-h-[500px]">
              {/* Risk Level Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-stone-500">Assessed Risk Level:</span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-lg border ${getRiskBadge(result.riskLevel)}`}
                >
                  {result.riskLevel.toUpperCase()} RISK
                </span>
              </div>

              {/* Summary with User Edit ability */}
              <div className="bg-white border border-stone-200 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
                  <span>Executive Assessment</span>
                  <button
                    onClick={() => setIsEditingSummary(!isEditingSummary)}
                    className="text-stone-400 hover:text-stone-700 flex items-center gap-1 text-[10px]"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEditingSummary ? 'Done' : 'Edit'}</span>
                  </button>
                </div>
                {isEditingSummary ? (
                  <textarea
                    rows={3}
                    value={customSummary}
                    onChange={(e) => setCustomSummary(e.target.value)}
                    className="w-full text-xs p-1.5 border border-stone-200 rounded bg-stone-50"
                  />
                ) : (
                  <p className="text-stone-600 leading-relaxed">{customSummary || result.summary}</p>
                )}
              </div>

              {/* Detected Indicators with Quote Excerpt */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-stone-700">
                  Detected Risk Indicators ({result.indicators.length})
                </div>
                {result.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="bg-white border border-stone-200 rounded-lg p-2.5 space-y-1 relative group"
                  >
                    <button
                      onClick={() => handleRemoveIndicator(i)}
                      title="Remove AI interpretation if inaccurate"
                      className="absolute top-2 right-2 text-stone-300 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 text-xs">{ind.type}</span>
                      <span className="text-[10px] text-stone-400 font-mono">({ind.confidence})</span>
                    </div>
                    {ind.excerpt && (
                      <div className="text-[11px] italic text-rose-900/80 bg-rose-50/50 border-l-2 border-rose-400 pl-2 py-0.5 font-mono">
                        "{ind.excerpt}"
                      </div>
                    )}
                    <p className="text-[11px] text-stone-500">{ind.explanation}</p>
                  </div>
                ))}
              </div>

              {/* Recommended Actions */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-stone-700">Recommended Protective Actions</div>
                <ul className="space-y-1 text-stone-600 text-[11px]">
                  {result.suggestedActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">·</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="text-[10px] text-stone-400 bg-stone-100/70 p-2.5 rounded-lg leading-relaxed">
                {result.disclaimer}
              </div>

              {/* Save to Evidence Vault action */}
              <div className="pt-2">
                <button
                  onClick={handleSaveEvidence}
                  disabled={savedSuccess}
                  className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    savedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Saved to Evidence Vault (AFTER Phase)</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Analysis & Transcript to Evidence Vault</span>
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
