import React, { useState } from 'react';
import {
  Link as LinkIcon,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  CheckCircle,
  Globe,
  Lock,
  Unlock,
} from 'lucide-react';
import { analyzeUrl, LinkAnalysisResult } from '../../services/api';
import { sampleLinks } from '../../data/mockData';

export const LinkAnalyzer: React.FC = () => {
  const [urlInput, setUrlInput] = useState(sampleLinks[0].url);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeUrl(urlInput.trim());
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (classification: string) => {
    switch (classification) {
      case 'Potentially malicious':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Suspicious':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Likely safe':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Before · Prevention</span>
            <span className="text-stone-300">/</span>
            <span className="text-xs text-stone-500">Cyber Defense</span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-1">Suspicious / Malicious Link Analysis</h2>
          <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
            Inspect URLs received via SMS, WhatsApp, or DMs before opening to protect against credential phishing, fake job schemes, and device malware.
          </p>
        </div>

        {/* Sample Loaders */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-stone-400 font-medium">Test Sample:</span>
          {sampleLinks.map((sl, i) => (
            <button
              key={i}
              onClick={() => {
                setUrlInput(sl.url);
                setResult(null);
              }}
              className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 rounded-md transition-colors cursor-pointer border border-stone-200/60"
            >
              {sl.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-stone-700">Enter or Paste URL to Verify</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/login"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-stone-800 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !urlInput.trim()}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs whitespace-nowrap"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Check Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-stone-50/70 border border-stone-200 rounded-xl p-5 space-y-4 text-xs">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(
                  result.classification
                )}`}
              >
                {result.classification.toUpperCase()}
              </span>
              <span className="text-stone-500 font-mono text-[11px]">
                Risk Score: <strong className="text-stone-800">{result.riskScore}/100</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
              {result.domainAnalysis.protocol === 'https' ? (
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{result.domainAnalysis.protocol.toUpperCase()} Secured</span>
            </div>
          </div>

          {/* Domain Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg border border-stone-200/70">
              <span className="text-[10px] text-stone-400 font-medium block">Parsed Domain</span>
              <span className="font-semibold text-stone-800 font-mono text-[11px] truncate block">
                {result.domainAnalysis.domain}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-stone-200/70">
              <span className="text-[10px] text-stone-400 font-medium block">Lookalike / Impersonation</span>
              <span className={`font-semibold text-[11px] ${result.domainAnalysis.isLookalike ? 'text-rose-600' : 'text-emerald-600'}`}>
                {result.domainAnalysis.isLookalike ? 'Flagged as Lookalike' : 'No Direct Brand Mimicry'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-stone-200/70">
              <span className="text-[10px] text-stone-400 font-medium block">Suspicious TLD</span>
              <span className={`font-semibold text-[11px] ${result.domainAnalysis.hasSuspiciousTLD ? 'text-amber-600' : 'text-stone-600'}`}>
                {result.domainAnalysis.hasSuspiciousTLD ? 'High-Risk TLD (.xyz/.top)' : 'Standard Registry'}
              </span>
            </div>
          </div>

          {/* Detected Signals */}
          <div className="space-y-2">
            <span className="font-semibold text-stone-800 text-[11px] block">Analyzed Security Signals:</span>
            {result.signals.map((sig, i) => (
              <div key={i} className="bg-white p-3 rounded-lg border border-stone-200/70 flex items-start gap-2.5">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    sig.severity === 'high'
                      ? 'text-rose-600'
                      : sig.severity === 'medium'
                      ? 'text-amber-500'
                      : 'text-stone-400'
                  }`}
                />
                <div>
                  <span className="font-semibold text-stone-800 text-xs">{sig.type}</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">{sig.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Practical Recommendation */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-1">
            <span className="text-amber-800 font-bold text-xs">Protective Recommendation:</span>
            <p className="text-amber-900 text-xs leading-relaxed">{result.safetyRecommendation}</p>
          </div>

          {/* Mandatory AI Disclaimer */}
          <div className="text-[10px] text-stone-400 bg-white p-3 rounded-lg border border-stone-200/50 leading-relaxed">
            {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
