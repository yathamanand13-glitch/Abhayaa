import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  HelpCircle,
  Shield,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { initialAwarenessModules } from '../../data/mockData';

export const AwarenessCenter: React.FC = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialAwarenessModules[0].id);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  const activeModule = initialAwarenessModules.find((m) => m.id === selectedModuleId) || initialAwarenessModules[0];

  const handleSelectOption = (moduleId: string, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [moduleId]: optionIndex }));
    setShowExplanation((prev) => ({ ...prev, [moduleId]: true }));
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Before · Education</span>
          <span className="text-stone-300">/</span>
          <span className="text-xs text-stone-500">Legal & Boundary Preparedness</span>
        </div>
        <h2 className="text-lg font-bold text-stone-900 mt-1">Public Awareness & Legal Rights Hub</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Knowledge is early prevention. Understand digital red flags, grooming stages, and criminal laws protecting you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Module List Sidebar */}
        <div className="md:col-span-4 space-y-2">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Learning Guides
          </div>
          {initialAwarenessModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModuleId(mod.id)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                selectedModuleId === mod.id
                  ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200/80 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-rose-600 uppercase">{mod.category}</span>
                <span className="text-[10px] text-stone-400">{mod.readTime}</span>
              </div>
              <h4 className="font-bold text-stone-900 mt-1">{mod.title}</h4>
              <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{mod.summary}</p>
            </button>
          ))}
        </div>

        {/* Selected Module Detail */}
        <div className="md:col-span-8 bg-stone-50/60 border border-stone-200 rounded-xl p-5 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                {activeModule.category}
              </span>
              <span className="text-xs text-stone-400">· {activeModule.readTime}</span>
            </div>
            <h3 className="text-base font-bold text-stone-900 mt-2">{activeModule.title}</h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">{activeModule.summary}</p>
          </div>

          {/* Key takeaways */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-800 block">Crucial Takeaways:</span>
            <div className="space-y-2">
              {activeModule.takeaways.map((t, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-stone-200/80 text-xs text-stone-700 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Quiz */}
          {activeModule.quiz && (
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Knowledge Check: Quick Scenario Question</span>
              </div>

              <p className="text-xs text-stone-800 font-medium">{activeModule.quiz.question}</p>

              <div className="space-y-2">
                {activeModule.quiz.options.map((opt, oIdx) => {
                  const isSelected = quizAnswers[activeModule.id] === oIdx;
                  const isCorrect = oIdx === activeModule.quiz?.correctIndex;
                  const hasAnswered = quizAnswers[activeModule.id] !== undefined;

                  let style = 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100';
                  if (hasAnswered) {
                    if (isCorrect) {
                      style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      style = 'bg-rose-50 border-rose-300 text-rose-900';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(activeModule.id, oIdx)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-between ${style}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && <span className="text-emerald-600 font-bold text-xs">✓ Correct</span>}
                      {hasAnswered && isSelected && !isCorrect && (
                        <span className="text-rose-600 font-bold text-xs">✗ Incorrect</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {showExplanation[activeModule.id] && (
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
                  <strong className="text-stone-900">Why this matters: </strong>
                  {activeModule.quiz.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
