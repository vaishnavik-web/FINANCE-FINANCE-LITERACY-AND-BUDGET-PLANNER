import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  Calculator,
  Landmark,
  BookOpen,
  Bot,
  FileBarChart,
  Bell,
  Settings,
  Shield,
  LogOut,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { NavTab } from '../types/finance';
import type { TranslationKey } from '../i18n/translations';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: NavTab; labelKey: TranslationKey; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { id: 'income', labelKey: 'nav.income', icon: TrendingUp },
  { id: 'expenses', labelKey: 'nav.expenses', icon: TrendingDown },
  { id: 'budget', labelKey: 'nav.budget', icon: PieChart },
  { id: 'goals', labelKey: 'nav.goals', icon: Target },
  { id: 'calculators', labelKey: 'nav.calculators', icon: Calculator },
  { id: 'schemes', labelKey: 'nav.schemes', icon: Landmark },
  { id: 'learning', labelKey: 'nav.learning', icon: BookOpen },
  { id: 'assistant', labelKey: 'nav.assistant', icon: Bot },
  { id: 'reports', labelKey: 'nav.reports', icon: FileBarChart },
  { id: 'notifications', labelKey: 'nav.notifications', icon: Bell },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, t, profile, mode, logout, unreadNotificationCount } = useApp();

  const handleNav = (id: NavTab) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0B192C] text-slate-100 w-64">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="min-w-0">
          <p className="font-display text-sm font-bold tracking-tight text-white truncate">
            SmartFinance
          </p>
          <p className="text-[11px] text-teal-300/90 truncate">
            {mode === 'demo' ? 'Guest Demo Workspace' : profile?.role === 'admin' ? 'Administrator Account' : 'Household Planner'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="lg:hidden p-1 text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(item.labelKey)}</span>
              </span>
              {item.id === 'notifications' && unreadNotificationCount > 0 && (
                <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          );
        })}

        {(profile?.role === 'admin' || mode === 'demo') && (
          <div className="pt-3 mt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-teal-600 text-white'
                  : 'text-teal-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('nav.admin')}</span>
            </button>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-white truncate">{profile?.fullName}</p>
          <p className="text-[11px] text-slate-400 truncate">{profile?.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('auth.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block shrink-0 border-r border-slate-200 dark:border-slate-800">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60" onClick={onCloseMobile} />
          <div className="relative z-10 h-full">{navContent}</div>
        </div>
      )}
    </>
  );
};
