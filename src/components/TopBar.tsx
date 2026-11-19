import React from 'react';
import { Menu, Search, Sun, Moon, Bell, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';
import type { LanguageCode, NavTab } from '../types/finance';

interface TopBarProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'nav.dashboard',
  income: 'nav.income',
  expenses: 'nav.expenses',
  budget: 'nav.budget',
  goals: 'nav.goals',
  calculators: 'nav.calculators',
  schemes: 'nav.schemes',
  learning: 'nav.learning',
  assistant: 'nav.assistant',
  reports: 'nav.reports',
  notifications: 'nav.notifications',
  settings: 'nav.settings',
  admin: 'nav.admin',
};

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu, onOpenSearch, onOpenAuth }) => {
  const {
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    theme,
    toggleTheme,
    unreadNotificationCount,
    mode,
    t,
  } = useApp();

  const titleKey = TAB_TITLES[activeTab] as Parameters<typeof t>[0];

  return (
    <header className="sticky top-0 z-30 pt-safe bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Menu + Breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {t(titleKey)}
            </h1>
          </div>
        </div>

        {/* Center/Right: Global Search + Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:border-teal-500 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline max-w-[200px] truncate">{t('common.searchPlaceholder')}</span>
            <span className="md:hidden">Search</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 bg-white dark:bg-slate-950">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <select
              aria-label="Select Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900">
                  {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle light or dark theme"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            aria-label="Open notifications"
            className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-teal-600 text-[10px] font-mono font-bold text-white flex items-center justify-center">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          <PWAInstallButton />

          {mode === 'demo' && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden md:inline-flex items-center rounded-lg bg-[#0B192C] dark:bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('auth.signIn')}
            </button>
          )}
        </div>
      </div>

      {mode === 'demo' && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span>{t('common.demoBanner')}</span>
          <button
            type="button"
            onClick={onOpenAuth}
            className="md:hidden text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
          >
            {t('auth.signIn')} / {t('auth.register')}
          </button>
        </div>
      )}
    </header>
  );
};
