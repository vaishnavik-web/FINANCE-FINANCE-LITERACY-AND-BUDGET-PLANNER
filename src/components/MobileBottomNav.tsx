import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingDown,
  Plus,
  Bot,
  Grid,
  TrendingUp,
  PieChart,
  Target,
  Calculator,
  Landmark,
  BookOpen,
  FileBarChart,
  Bell,
  Settings,
  Shield,
  X,
  LogOut,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';
import type { LanguageCode, NavTab } from '../types/finance';
import type { TranslationKey } from '../i18n/translations';

interface MobileBottomNavProps {
  onOpenQuickAdd: () => void;
}

const APP_LAUNCHER_ITEMS: { id: NavTab; labelKey: TranslationKey; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'income', labelKey: 'nav.income', icon: TrendingUp },
  { id: 'budget', labelKey: 'nav.budget', icon: PieChart },
  { id: 'goals', labelKey: 'nav.goals', icon: Target },
  { id: 'calculators', labelKey: 'nav.calculators', icon: Calculator },
  { id: 'schemes', labelKey: 'nav.schemes', icon: Landmark },
  { id: 'learning', labelKey: 'nav.learning', icon: BookOpen },
  { id: 'reports', labelKey: 'nav.reports', icon: FileBarChart },
  { id: 'notifications', labelKey: 'nav.notifications', icon: Bell },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenQuickAdd }) => {
  const {
    activeTab,
    setActiveTab,
    t,
    profile,
    mode,
    logout,
    unreadNotificationCount,
    language,
    setLanguage,
    theme,
    toggleTheme,
  } = useApp();
  const [launcherOpen, setLauncherOpen] = useState(false);

  const navigate = (tab: NavTab) => {
    setActiveTab(tab);
    setLauncherOpen(false);
  };

  const isMoreActive = !['dashboard', 'expenses', 'assistant'].includes(activeTab);

  return (
    <>
      {/* Mobile App Launcher Sheet */}
      {launcherOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/65 backdrop-blur-xs">
          <div className="flex-1" onClick={() => setLauncherOpen(false)} />
          <div className="rounded-t-2xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-5 pb-safe max-h-[85vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-base font-bold text-slate-900 dark:text-white">
                  All Financial Tools
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {profile?.fullName} · {mode === 'demo' ? 'Guest Demo' : profile?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLauncherOpen(false)}
                aria-label="Close app menu"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3-Column App Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {APP_LAUNCHER_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.id)}
                    className={`relative min-h-[72px] flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition-colors cursor-pointer ${
                      active
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                      {t(item.labelKey)}
                    </span>
                    {item.id === 'notifications' && unreadNotificationCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-teal-600 text-[10px] font-mono font-bold text-white flex items-center justify-center">
                        {unreadNotificationCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {(profile?.role === 'admin' || mode === 'demo') && (
                <button
                  type="button"
                  onClick={() => navigate('admin')}
                  className={`min-h-[72px] flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition-colors cursor-pointer ${
                    activeTab === 'admin'
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Shield className="w-5 h-5 shrink-0" />
                  <span className="text-[11px] font-semibold leading-tight">{t('nav.admin')}</span>
                </button>
              )}
            </div>

            {/* Mobile Quick Preferences */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-950">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <select
                    aria-label="Mobile Language Selector"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                    className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
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
                  className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <PWAInstallButton />
                <button
                  type="button"
                  onClick={() => {
                    setLauncherOpen(false);
                    logout();
                  }}
                  className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('auth.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar (Mobile & Tablet) */}
      <nav
        aria-label="Mobile Primary Navigation"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-safe px-2 pt-1.5 shadow-[0_-4px_20px_rgba(11,25,44,0.06)]"
      >
        <div className="grid grid-cols-5 items-center gap-1 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-teal-700 dark:text-teal-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('expenses')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'expenses'
                ? 'text-teal-700 dark:text-teal-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <TrendingDown className="w-5 h-5" />
            <span>{t('nav.expenses')}</span>
          </button>

          {/* Center Ergonomic Quick-Add Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={onOpenQuickAdd}
              aria-label="Quick Add Income or Expense"
              className="w-12 h-12 -mt-4 rounded-2xl bg-[#0B192C] dark:bg-teal-600 text-white shadow-lg flex items-center justify-center hover:opacity-95 active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('assistant')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'assistant'
                ? 'text-teal-700 dark:text-teal-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Bot className="w-5 h-5" />
            <span>AI Voice</span>
          </button>

          <button
            type="button"
            onClick={() => setLauncherOpen((v) => !v)}
            className={`relative min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
              launcherOpen || isMoreActive
                ? 'text-teal-700 dark:text-teal-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>More</span>
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-teal-600" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
