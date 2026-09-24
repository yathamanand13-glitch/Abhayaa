import React from 'react';
import {
  HeartHandshake,
  Phone,
  MapPin,
  Building,
  Scale,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const RecoverySupportDirectory: React.FC = () => {
  const centers = [
    {
      title: 'Sakhi One-Stop Crisis Center (OSC)',
      type: 'Integrated Medical, Police & Legal Facility',
      phone: '181 / 022-2628-9900',
      timing: 'Open 24 Hours / 7 Days',
      address: 'District Civil Hospital Campus, Andheri West, Mumbai',
      services: [
        'Immediate medical examination & first aid',
        'Confidential police facilitation & Zero FIR filing',
        'Free short-stay shelter (up to 5 days)',
        'Legal aid through District Legal Services Authority (DLSA)',
      ],
    },
    {
      title: 'National Commission for Women (NCW) 24/7 Helpline',
      type: 'National Emergency Support Cell',
      phone: '7827-170-170 / 1091',
      timing: '24x7 Continuous Support',
      address: 'Plot 21, Jasola Institutional Area, New Delhi',
      services: [
        'Direct crisis counseling & trauma stabilization',
        'Expedited police escort coordination',
        'Cyber crime complaint escalation to CERT-In',
      ],
    },
    {
      title: 'Tele-MANAS Free Psychological Care',
      type: 'Government Mental Health & Trauma Counsel',
      phone: '14416 / 1800-891-4416',
      timing: 'Toll-free 24 Hours (Multi-lingual)',
      address: 'Ministry of Health & Family Welfare',
      services: [
        'Post-traumatic stress debriefing',
        'Confidential counseling with certified clinical psychologists',
        'Support for survivors of domestic coercion or stalking',
      ],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">After · Recovery</span>
          <span className="text-stone-300">/</span>
          <span className="text-xs text-stone-500">Holistic Care</span>
        </div>
        <h2 className="text-lg font-bold text-stone-900 mt-1">
          Post-Incident Recovery, Crisis Shelters & Legal Aid
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Verified directory of government-supported one-stop centers, trauma debriefing helplines, and free legal defense councils.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {centers.map((c, i) => (
          <div
            key={i}
            className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-stone-300 transition-colors shadow-2xs"
          >
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  {c.type}
                </span>
                <h3 className="text-sm font-bold text-stone-900 mt-2">{c.title}</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{c.timing}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-200/60">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Available Services:
                </span>
                <ul className="space-y-1 text-xs text-stone-600">
                  {c.services.map((s, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">·</span>
                      <span className="leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-stone-200/60">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                <span className="truncate">{c.address}</span>
              </div>

              <a
                href={`tel:${c.phone.split('/')[0].trim()}`}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Center ({c.phone.split('/')[0].trim()})</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
