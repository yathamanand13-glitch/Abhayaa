import React, { useState } from 'react';
import {
  Bell,
  ShieldAlert,
  AlertCircle,
  Calendar,
  MapPin,
  ExternalLink,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { SafetyNewsItem } from '../../types';
import { initialSafetyNews } from '../../data/mockData';

export const SafetyNewsAndAlerts: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'Advisory'>('All');
  const [selectedArticle, setSelectedArticle] = useState<SafetyNewsItem | null>(null);

  const filtered = initialSafetyNews.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'Confirmed') return item.status === 'Confirmed';
    if (filter === 'Advisory') return item.category.includes('Advisory') || item.category.includes('Alert');
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Before · Awareness</span>
            <span className="text-stone-300">/</span>
            <span className="text-xs text-stone-500">Official Advisories</span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-1">Verified Women-Safety News & Local Alerts</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time public safety bulletins verified by authorities and civil protection cells.
          </p>
        </div>

        {/* Demo data badge and filters */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200 font-mono">
            DEMO DATA · VERIFIED FORMAT
          </span>
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            {(['All', 'Confirmed', 'Advisory'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  filter === f ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of news/alert items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className="bg-stone-50/70 hover:bg-stone-50 border border-stone-200/80 rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer hover:border-stone-300 shadow-2xs group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{item.status}</span>
                </span>
              </div>

              <h3 className="text-xs font-bold text-stone-900 group-hover:text-rose-600 transition-colors leading-snug">
                {item.title}
              </h3>

              <p className="text-[11px] text-stone-500 line-clamp-3 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-200/60 mt-3 text-[10px] text-stone-400 space-y-1">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                <span className="truncate">{item.area}</span>
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>{item.source}</span>
                <span>{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal reader */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded">
                {selectedArticle.category}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-stone-900">{selectedArticle.title}</h2>
              <div className="flex items-center gap-3 text-xs text-stone-400 mt-2">
                <span>{selectedArticle.source}</span>
                <span>·</span>
                <span>{selectedArticle.date}</span>
                <span>·</span>
                <span>{selectedArticle.area}</span>
              </div>
            </div>

            <div className="text-xs text-stone-700 leading-relaxed space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <p>{selectedArticle.content}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-stone-400 font-mono">Status: Verified Official Bulletin</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Bulletin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
