import React from 'react';
import {
  Home,
  Shield,
  MapPin,
  Users,
  User,
  Radio,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isSosActive: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  isSosActive,
}) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'home' as NavigationTab, label: t('nav_home'), icon: Home },
    { id: 'safety' as NavigationTab, label: t('nav_safety'), icon: Shield },
    {
      id: 'map' as NavigationTab,
      label: t('nav_map'),
      icon: MapPin,
      badge: isSosActive ? 'SOS ACTIVE' : undefined,
    },
    { id: 'community' as NavigationTab, label: t('nav_community'), icon: Users },
    { id: 'profile' as NavigationTab, label: t('nav_profile'), icon: User },
  ];

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-[57px] z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-stone-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-600 text-white rounded-md animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick shortcut if SOS is triggered */}
          {isSosActive && (
            <button
              onClick={() => onTabChange('map')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 animate-pulse cursor-pointer shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 animate-spin" />
              <span>{t('nav_live_sos')}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
