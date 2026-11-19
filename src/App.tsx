import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthModal } from './components/AuthModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileQuickAddModal } from './components/MobileQuickAddModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { BudgetPlannerPage } from './pages/BudgetPlannerPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { SchemesPage } from './pages/SchemesPage';
import { LearningPage } from './pages/LearningPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';

const AppShell: React.FC = () => {
  const { mode, activeTab } = useApp();
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Global keyboard shortcut Cmd/Ctrl + K for Global Search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (mode !== 'landing') {
          setSearchOpen((v) => !v);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode]);

  if (mode === 'landing') {
    return (
      <>
        <LandingPage onOpenAuth={(view) => setAuthModalView(view)} />
        {authModalView && (
          <AuthModal initialView={authModalView} onClose={() => setAuthModalView(null)} />
        )}
      </>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'income':
        return <IncomePage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'budget':
        return <BudgetPlannerPage />;
      case 'goals':
        return <SavingsGoalsPage />;
      case 'calculators':
        return <CalculatorsPage />;
      case 'schemes':
        return <SchemesPage />;
      case 'learning':
        return <LearningPage />;
      case 'assistant':
        return <AIAssistantPage />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <OfflineIndicator />
        <TopBar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenAuth={() => setAuthModalView('login')}
        />

        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>

      <MobileBottomNav onOpenQuickAdd={() => setQuickAddOpen(true)} />

      {quickAddOpen && <MobileQuickAddModal onClose={() => setQuickAddOpen(false)} />}
      {searchOpen && <GlobalSearchModal onClose={() => setSearchOpen(false)} />}
      {authModalView && (
        <AuthModal initialView={authModalView} onClose={() => setAuthModalView(null)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
