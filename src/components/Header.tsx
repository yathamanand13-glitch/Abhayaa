import React from 'react';
import {
  ShieldAlert,
  EyeOff,
  Radio,
  SlidersHorizontal,
  User,
  ShieldCheck,
} from 'lucide-react';
import { AppMode, NavigationTab } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface HeaderProps {
  appMode: AppMode;
  onToggleDiscreet: () => void;
  isSosActive: boolean;
  onOpenSos: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  onToggleDiscreet,
  isSosActive,
  onOpenSos,
  onNavigateTab,
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      {/* Active SOS Red Emergency Strip if triggered */}
      {isSosActive && (
        <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-between text-xs font-medium animate-pulse shadow-sm">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 animate-spin" />
            <span className="font-extrabold tracking-wide uppercase">{t('sos_active')}</span>
            <span className="hidden sm:inline text-rose-100">
              · {t('emergency_desc')}
            </span>
          </div>
          <button
            onClick={onOpenSos}
            className="px-3 py-1 bg-white text-rose-700 rounded-lg font-bold text-xs shadow-xs hover:bg-rose-50 transition-colors cursor-pointer"
          >
            {t('sos_view_live')} ➔
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Fearless Logo */}
        <div
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-700 to-amber-600 flex items-center justify-center text-white shadow-xs font-extrabold text-lg select-none">
            अ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-stone-900 group-hover:text-rose-700 transition-colors">
                {t('app_name')}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">अभया</span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block leading-tight">
              {t('app_tagline')}
            </p>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2.5">
          {/* Small safety status indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isSosActive
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSosActive ? 'bg-rose-600 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <span className="text-[11px] font-semibold">
              {isSosActive ? t('sos_active') : t('safety_status_active')}
            </span>
          </div>

          {/* Current Application Identity Mode Switcher */}
          <button
            onClick={onToggleDiscreet}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
              appMode === 'discreet'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
            title="Switch to Weather Disguise for privacy"
          >
            <EyeOff className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">
              {appMode === 'discreet' ? t('exit_discreet_btn') : t('discreet_mode_btn')}
            </span>
            <span className="sm:hidden text-[10px] font-semibold">Discreet</span>
          </button>

          {/* Profile Shortcut */}
          <button
            onClick={() => onNavigateTab('profile')}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
            title="Profile & Safety Settings"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
