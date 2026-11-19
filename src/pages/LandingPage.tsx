import React, { useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Landmark,
  BookOpen,
  PieChart,
  Bot,
  WifiOff,
  Globe,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { PWAInstallButton } from '../components/PWAInstallButton';
import type { LanguageCode } from '../types/finance';

interface LandingPageProps {
  onOpenAuth: (view: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { enterDemoMode, language, setLanguage, theme, toggleTheme, t, schemes, learningTopics } = useApp();
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [learnImgFailed, setLearnImgFailed] = useState(false);
  const [schemeImgFailed, setSchemeImgFailed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          <a href="#top" className="font-display text-lg font-bold tracking-tight text-[#0B192C] dark:text-white whitespace-nowrap shrink-0">
            SmartFinance
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#capabilities" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Capabilities
            </a>
            <a href="#calculators" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Calculators
            </a>
            <a href="#schemes" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Schemes
            </a>
            <a href="#literacy" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Learning
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B192C] dark:bg-teal-600 rounded-lg hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('auth.signIn')}
            </button>
          </div>
        </div>
      </header>

      {/* Utility Toolbar below Header: Language Selector (visible from start), Theme Switch, PWA Install */}
      <div id="top" className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {t('appName')} · {t('tagline')}
          </p>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 bg-slate-50 dark:bg-slate-900">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <select
                aria-label="Choose Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900">
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Light/Dark Mode"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* Hero Split */}
      <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-xs font-semibold tracking-wide text-teal-700 dark:text-teal-400">
              Household Budget Planner · 60 Calculators · India Welfare Schemes
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B192C] dark:text-white leading-tight [text-wrap:balance]">
              {t('landing.heroTitle')}
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              {t('landing.heroDesc')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] dark:bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer"
              >
                {t('landing.getStarted')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={enterDemoMode}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('landing.exploreDemo')}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> INR (₹) Native
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 8 Indian Languages
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Offline PWA Ready
              </span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
              {!heroImgFailed ? (
                <img
                  src="/src/assets/images/hero_household_finance_1795102381719.jpg"
                  alt="Modern Indian household financial planning workspace"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#0B192C] to-teal-900 text-white">
                  <PieChart className="w-12 h-12 text-teal-300 mb-3" />
                  <p className="font-display text-lg font-semibold">Household Financial Clarity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quantitative Overview Strip */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-b border-slate-200 dark:border-slate-800 py-6">
          <div>
            <p className="font-mono text-2xl font-bold text-[#0B192C] dark:text-white tabular-nums">60</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Formula-verified financial calculators</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-[#0B192C] dark:text-white tabular-nums">{schemes.length}+</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Central &amp; State schemes with official portals</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-[#0B192C] dark:text-white tabular-nums">{learningTopics.length}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Interactive financial literacy lessons &amp; quizzes</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-[#0B192C] dark:text-white tabular-nums">8</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Indian languages + offline PWA sync</p>
          </div>
        </div>
      </section>

      {/* Capabilities Asymmetric Bento */}
      <section id="capabilities" className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B192C] dark:text-white">
            Built for everyday households, students, and families
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
            Every module connects your daily cash flow to long-term stability—without jargon or hidden complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 text-xs font-semibold">
                <PieChart className="w-4 h-4" />
                <span>01. Household Budget &amp; Expense Control</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Plan monthly category limits before spending begins
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Track salary, freelancing, scholarships, and family income alongside daily expenses across food, groceries, rent, utilities, education, and medical costs. Automatic utilization alerts notify you at 80% and 100% of any limit.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Income &amp; Expenses</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Search, filter, custom categories</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Savings Goals</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Emergency fund &amp; milestone dates</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">PDF / Excel / CSV</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">One-click household reports</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <Bot className="w-4 h-4" />
              <span>02. AI &amp; Offline Resilience</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Multilingual AI guidance &amp; offline PWA sync
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Ask the AI Financial Assistant to explain SIP, EMI, or review your authorized monthly summary. Continue logging expenses and using calculators offline with automatic synchronization.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <WifiOff className="w-4 h-4 text-teal-600" />
              <span>Works offline as an installable web app</span>
            </div>
          </div>
        </div>

        {/* Calculators, Schemes & Literacy Visual Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="calculators" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
            <div className="h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
              {!learnImgFailed ? (
                <img
                  src="/src/assets/images/learning_financial_basics_1795102381552.jpg"
                  alt="Brass coins and structured blocks illustrating savings growth and compounding"
                  referrerPolicy="no-referrer"
                  onError={() => setLearnImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calculator className="w-10 h-10 text-teal-600" />
                </div>
              )}
            </div>
            <div id="literacy" className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
                  <BookOpen className="w-4 h-4" />
                  <span>03. 60 Calculators &amp; Financial Literacy Centre</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transparent math formulas and beginner-friendly lessons
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Compute EMI, RD, FD, PPF, NPS, SIP, CAGR, XIRR, Old vs New Tax Regime, and household utility budgets—alongside step-by-step lessons on banking, credit scores, and UPI scam protection.
                </p>
              </div>
              <button
                type="button"
                onClick={enterDemoMode}
                className="self-start text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Open calculators &amp; lessons in Demo Mode <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div id="schemes" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
            <div className="h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
              {!schemeImgFailed ? (
                <img
                  src="/src/assets/images/schemes_civic_portal_1795102381621.jpg"
                  alt="Modern Indian public institution architecture representing verified government welfare schemes"
                  referrerPolicy="no-referrer"
                  onError={() => setSchemeImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Landmark className="w-10 h-10 text-emerald-600" />
                </div>
              )}
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Landmark className="w-4 h-4" />
                  <span>04. Verified Indian Government Schemes</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Central &amp; State schemes with official portal links
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Search PMJDY, Sukanya Samriddhi, PPF, Atal Pension, PM-KISAN, Ayushman Bharat, NSP Scholarships, MUDRA, and Karnataka Guarantee schemes with document checklists and last-verified dates.
                </p>
              </div>
              <button
                type="button"
                onClick={enterDemoMode}
                className="self-start text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Explore verified scheme directory <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{t('appName')}</p>
            <p className="mt-1">Educational financial literacy &amp; household budgeting tool. Verify tax filings and scheme terms on official government portals.</p>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => onOpenAuth('login')} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
              {t('auth.signIn')}
            </button>
            <button type="button" onClick={() => onOpenAuth('register')} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
              {t('auth.register')}
            </button>
            <button type="button" onClick={enterDemoMode} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
              {t('auth.tryDemo')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
