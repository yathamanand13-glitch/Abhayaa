import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Compass,
  CheckCircle2,
  RefreshCw,
  PhoneCall,
  Info,
} from 'lucide-react';
import { askSafetyAssistant } from '../../services/api';
import { useTranslation } from '../../i18n/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiSafetyAssistantProps {
  onTriggerSos: () => void;
}

export const AiSafetyAssistant: React.FC<AiSafetyAssistantProps> = ({ onTriggerSos }) => {
  const { language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-0',
      role: 'assistant',
      text: `Hello. I am the **ABHAYAA Safety Assistant**. 

I am here to help you evaluate suspicious situations, interpersonal boundaries, online grooming red flags, stalking patterns, or unfamiliar proposals.

*Important Safety Notice:* I identify potential risk indicators and suggest practical precautions. If you are in immediate physical danger right now, please use the **Emergency SOS** button below or dial **112**. How can I support you today?`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Someone has been following me from the metro station',
    'Received an online modeling job offer asking for private photos',
    'A person I met online wants to meet in a private room alone',
    'What are the subtle signs of emotional coercion?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const res = await askSafetyAssistant(query, history, language);

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'Unable to reach the safety assistant server. If you feel unsafe, please activate the SOS emergency trigger or call 112 immediately.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <span>ABHAYAA Safety Assistant</span>
              <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-mono">Gemini 3.8</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Evaluates potential risk indicators & boundary safety · Calibrated guidance
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSos}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Need SOS Now?</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-stone-50/30">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-stone-900 text-white rounded-br-xs'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs shadow-2xs whitespace-pre-wrap'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] text-stone-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-stone-500 text-xs py-2 px-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
            <span>Analyzing risk indicators and preparing safety recommendations...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-stone-100 bg-white">
        <div className="text-[11px] text-stone-400 font-medium mb-1.5">Common Safety Scenarios:</div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-stone-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe what you observed, a message, or a situation..."
          className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-200 text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
