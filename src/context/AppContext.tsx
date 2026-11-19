import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Announcement,
  CalculatorHistoryEntry,
  ExpenseRecord,
  FAQItem,
  GovernmentScheme,
  HouseholdBudget,
  IncomeRecord,
  LanguageCode,
  LearningTopic,
  NavTab,
  NotificationItem,
  SavingsGoal,
  TaxSlabConfig,
  UserFinancialStore,
  UserProfile,
} from '../types/finance';
import { translate, type TranslationKey } from '../i18n/translations';
import { apiClient } from '../services/apiClient';
import { INITIAL_SCHEMES } from '../data/schemesData';
import { INITIAL_LEARNING_TOPICS } from '../data/learningData';
import { DEFAULT_TAX_CONFIG, INITIAL_ANNOUNCEMENTS, INITIAL_FAQS } from '../data/glossaryAndFaqs';
import {
  loadDemoState,
  resetDemoState,
  saveDemoState,
} from '../services/demoStorage';
import {
  getSavedLanguage,
  getSavedTheme,
  loadPublicContentCache,
  loadSessionAuth,
  loadUserOfflineCache,
  saveLanguagePref,
  savePublicContentCache,
  saveSessionAuth,
  saveThemePref,
  saveUserOfflineCache,
} from '../services/offlineSync';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { formatMoney, getCurrentMonthKey } from '../utilities/formatters';

type AppMode = 'landing' | 'demo' | 'authenticated';

interface AppContextValue {
  mode: AppMode;
  token: string | null;
  profile: UserProfile | null;
  store: UserFinancialStore;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isOnline: boolean;
  hasPendingSync: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncNow: () => Promise<void>;
  schemes: GovernmentScheme[];
  learningTopics: LearningTopic[];
  faqs: FAQItem[];
  announcements: Announcement[];
  refreshPublicContent: () => Promise<void>;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Deep-link state for Global Search
  focusedCalculatorId: string | null;
  setFocusedCalculatorId: (id: string | null) => void;
  focusedSchemeId: string | null;
  setFocusedSchemeId: (id: string | null) => void;
  focusedTopicId: string | null;
  setFocusedTopicId: (id: string | null) => void;
  // Auth actions
  enterDemoMode: () => void;
  resetDemo: () => void;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (payload: {
    fullName: string;
    email: string;
    password: string;
    preferredLanguage: LanguageCode;
    monthlyIncomeRange?: string;
    financialGoalsSummary?: string;
    adminInviteCode?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  // Financial mutations
  addIncome: (item: Omit<IncomeRecord, 'id' | 'updatedAt'>) => void;
  updateIncome: (id: string, updates: Partial<IncomeRecord>) => void;
  deleteIncome: (id: string) => void;
  addExpense: (item: Omit<ExpenseRecord, 'id' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => void;
  deleteExpense: (id: string) => void;
  upsertBudget: (budget: HouseholdBudget) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  saveCalculatorHistory: (entry: Omit<CalculatorHistoryEntry, 'id' | 'createdAt'>) => void;
  clearCalculatorHistory: () => void;
  markTopicCompleted: (topicId: string, quizScore?: number) => void;
  updateTaxConfig: (cfg: TaxSlabConfig) => void;
}

const EMPTY_STORE: UserFinancialStore = {
  incomes: [],
  expenses: [],
  budgets: [],
  goals: [],
  calculatorHistory: [],
  completedTopicIds: [],
  quizScores: {},
  readNotificationIds: [],
  taxConfig: DEFAULT_TAX_CONFIG,
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isOnline = useOnlineStatus();
  const [mode, setMode] = useState<AppMode>('landing');
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [store, setStore] = useState<UserFinancialStore>(EMPTY_STORE);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [language, setLanguageState] = useState<LanguageCode>(() => getSavedLanguage() as LanguageCode);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getSavedTheme());
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [schemes, setSchemes] = useState<GovernmentScheme[]>(() => loadPublicContentCache()?.schemes || INITIAL_SCHEMES);
  const [learningTopics, setLearningTopics] = useState<LearningTopic[]>(
    () => loadPublicContentCache()?.learningTopics || INITIAL_LEARNING_TOPICS
  );
  const [faqs, setFaqs] = useState<FAQItem[]>(() => loadPublicContentCache()?.faqs || INITIAL_FAQS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    () => loadPublicContentCache()?.announcements || INITIAL_ANNOUNCEMENTS
  );

  const [focusedCalculatorId, setFocusedCalculatorId] = useState<string | null>(null);
  const [focusedSchemeId, setFocusedSchemeId] = useState<string | null>(null);
  const [focusedTopicId, setFocusedTopicId] = useState<string | null>(null);

  // Apply dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveThemePref(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setLanguage = useCallback(
    (lang: LanguageCode) => {
      setLanguageState(lang);
      saveLanguagePref(lang);
      if (profile) {
        const nextProfile = { ...profile, preferredLanguage: lang };
        setProfile(nextProfile);
        if (mode === 'demo') {
          saveDemoState(nextProfile, store);
        } else if (mode === 'authenticated' && token && isOnline) {
          apiClient.updateProfile(token, { preferredLanguage: lang }).catch(() => {});
        }
      }
    },
    [isOnline, mode, profile, store, token]
  );

  const t = useCallback((key: TranslationKey) => translate(language, key), [language]);

  const refreshPublicContent = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const data = await apiClient.getPublicContent();
      setSchemes(data.schemes);
      setLearningTopics(data.learningTopics);
      setFaqs(data.faqs);
      setAnnouncements(data.announcements);
      savePublicContentCache({ ...data, cachedAt: new Date().toISOString() });
    } catch {
      // Retain cached/seed content when offline
    }
  }, []);

  // Load public content & restore saved session on boot
  useEffect(() => {
    refreshPublicContent();
    const saved = loadSessionAuth();
    if (saved.token && saved.profile) {
      setToken(saved.token);
      setProfile(saved.profile);
      setMode('authenticated');
      const cached = loadUserOfflineCache(saved.profile.id);
      if (cached.store) {
        setStore(cached.store);
        setHasPendingSync(cached.pendingSync);
      }
      if (navigator.onLine) {
        if (cached.pendingSync && cached.store) {
          apiClient
            .saveFinanceState(saved.token, cached.store)
            .then((res) => {
              setStore(res.store);
              setHasPendingSync(false);
              setLastSyncedAt(res.syncedAt);
              saveUserOfflineCache(saved.profile!.id, res.store, false);
            })
            .catch(() => {});
        } else {
          apiClient
            .getMe(saved.token)
            .then((res) => {
              setProfile(res.profile);
              setStore(res.store);
              setLanguageState(res.profile.preferredLanguage || 'en');
              saveSessionAuth(saved.token, res.profile);
              saveUserOfflineCache(res.profile.id, res.store, false);
            })
            .catch(() => {
              // Keep offline cache if network failed, logout only on 401
            });
        }
      }
    }
  }, [refreshPublicContent]);

  const syncNow = useCallback(async () => {
    if (mode !== 'authenticated' || !token || !profile || !navigator.onLine) return;
    setIsSyncing(true);
    try {
      const res = await apiClient.saveFinanceState(token, store);
      setStore(res.store);
      setHasPendingSync(false);
      setLastSyncedAt(res.syncedAt);
      saveUserOfflineCache(profile.id, res.store, false);
    } finally {
      setIsSyncing(false);
    }
  }, [mode, profile, store, token]);

  // Auto-sync pending offline transactions when connectivity returns
  useEffect(() => {
    if (isOnline && hasPendingSync && mode === 'authenticated' && token) {
      syncNow().catch(() => {});
    }
  }, [hasPendingSync, isOnline, mode, syncNow, token]);

  const commitStore = useCallback(
    (updater: (prev: UserFinancialStore) => UserFinancialStore) => {
      setStore((prev) => {
        const next = updater(prev);
        if (mode === 'demo' && profile) {
          saveDemoState(profile, next);
        } else if (mode === 'authenticated' && profile) {
          if (navigator.onLine && token) {
            saveUserOfflineCache(profile.id, next, false);
            apiClient
              .saveFinanceState(token, next)
              .then((res) => {
                setHasPendingSync(false);
                setLastSyncedAt(res.syncedAt);
                saveUserOfflineCache(profile.id, res.store, false);
              })
              .catch(() => {
                setHasPendingSync(true);
                saveUserOfflineCache(profile.id, next, true);
              });
          } else {
            setHasPendingSync(true);
            saveUserOfflineCache(profile.id, next, true);
          }
        }
        return next;
      });
    },
    [mode, profile, token]
  );

  // Auth Actions
  const enterDemoMode = useCallback(() => {
    const demo = loadDemoState();
    setProfile(demo.profile);
    setStore(demo.store);
    setToken(null);
    setMode('demo');
    setActiveTab('dashboard');
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = resetDemoState();
    setProfile(fresh.profile);
    setStore(fresh.store);
  }, []);

  const loginUser = useCallback(async (email: string, password: string) => {
    const res = await apiClient.login({ email, password });
    setToken(res.token);
    setProfile(res.profile);
    setStore(res.store);
    setLanguageState(res.profile.preferredLanguage || 'en');
    saveLanguagePref(res.profile.preferredLanguage || 'en');
    saveSessionAuth(res.token, res.profile);
    saveUserOfflineCache(res.profile.id, res.store, false);
    setHasPendingSync(false);
    setMode('authenticated');
    setActiveTab('dashboard');
  }, []);

  const registerUser = useCallback(
    async (payload: {
      fullName: string;
      email: string;
      password: string;
      preferredLanguage: LanguageCode;
      monthlyIncomeRange?: string;
      financialGoalsSummary?: string;
      adminInviteCode?: string;
    }) => {
      const res = await apiClient.register(payload);
      setToken(res.token);
      setProfile(res.profile);
      setStore(res.store);
      setLanguageState(res.profile.preferredLanguage || 'en');
      saveLanguagePref(res.profile.preferredLanguage || 'en');
      saveSessionAuth(res.token, res.profile);
      saveUserOfflineCache(res.profile.id, res.store, false);
      setHasPendingSync(false);
      setMode('authenticated');
      setActiveTab('dashboard');
    },
    []
  );

  const logout = useCallback(() => {
    saveSessionAuth(null, null);
    setToken(null);
    setProfile(null);
    setStore(EMPTY_STORE);
    setHasPendingSync(false);
    setMode('landing');
    setActiveTab('dashboard');
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!profile) return;
      const merged = { ...profile, ...updates };
      setProfile(merged);
      if (updates.preferredLanguage) {
        setLanguageState(updates.preferredLanguage);
        saveLanguagePref(updates.preferredLanguage);
      }
      if (mode === 'demo') {
        saveDemoState(merged, store);
      } else if (mode === 'authenticated' && token) {
        const res = await apiClient.updateProfile(token, updates);
        setProfile(res.profile);
        saveSessionAuth(token, res.profile);
      }
    },
    [mode, profile, store, token]
  );

  const deleteAccount = useCallback(async () => {
    if (mode === 'authenticated' && token) {
      await apiClient.deleteAccount(token);
    }
    logout();
  }, [logout, mode, token]);

  // Financial Mutations
  const addIncome = useCallback(
    (item: Omit<IncomeRecord, 'id' | 'updatedAt'>) => {
      const record: IncomeRecord = {
        ...item,
        id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        updatedAt: new Date().toISOString(),
        pendingSync: mode === 'authenticated' && !navigator.onLine,
      };
      commitStore((prev) => ({ ...prev, incomes: [record, ...prev.incomes] }));
    },
    [commitStore, mode]
  );

  const updateIncome = useCallback(
    (id: string, updates: Partial<IncomeRecord>) => {
      commitStore((prev) => ({
        ...prev,
        incomes: prev.incomes.map((i) =>
          i.id === id
            ? { ...i, ...updates, updatedAt: new Date().toISOString(), pendingSync: mode === 'authenticated' && !navigator.onLine }
            : i
        ),
      }));
    },
    [commitStore, mode]
  );

  const deleteIncome = useCallback(
    (id: string) => {
      commitStore((prev) => ({ ...prev, incomes: prev.incomes.filter((i) => i.id !== id) }));
    },
    [commitStore]
  );

  const addExpense = useCallback(
    (item: Omit<ExpenseRecord, 'id' | 'updatedAt'>) => {
      const record: ExpenseRecord = {
        ...item,
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        updatedAt: new Date().toISOString(),
        pendingSync: mode === 'authenticated' && !navigator.onLine,
      };
      commitStore((prev) => ({ ...prev, expenses: [record, ...prev.expenses] }));
    },
    [commitStore, mode]
  );

  const updateExpense = useCallback(
    (id: string, updates: Partial<ExpenseRecord>) => {
      commitStore((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) =>
          e.id === id
            ? { ...e, ...updates, updatedAt: new Date().toISOString(), pendingSync: mode === 'authenticated' && !navigator.onLine }
            : e
        ),
      }));
    },
    [commitStore, mode]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      commitStore((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }));
    },
    [commitStore]
  );

  const upsertBudget = useCallback(
    (budget: HouseholdBudget) => {
      const stamped: HouseholdBudget = {
        ...budget,
        updatedAt: new Date().toISOString(),
        pendingSync: mode === 'authenticated' && !navigator.onLine,
      };
      commitStore((prev) => {
        const idx = prev.budgets.findIndex((b) => b.month === stamped.month);
        const nextBudgets =
          idx >= 0 ? prev.budgets.map((b, i) => (i === idx ? stamped : b)) : [stamped, ...prev.budgets];
        return { ...prev, budgets: nextBudgets };
      });
    },
    [commitStore, mode]
  );

  const addGoal = useCallback(
    (goal: Omit<SavingsGoal, 'id' | 'updatedAt'>) => {
      const record: SavingsGoal = {
        ...goal,
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        updatedAt: new Date().toISOString(),
        pendingSync: mode === 'authenticated' && !navigator.onLine,
      };
      commitStore((prev) => ({ ...prev, goals: [record, ...prev.goals] }));
    },
    [commitStore, mode]
  );

  const updateGoal = useCallback(
    (id: string, updates: Partial<SavingsGoal>) => {
      commitStore((prev) => ({
        ...prev,
        goals: prev.goals.map((g) =>
          g.id === id
            ? { ...g, ...updates, updatedAt: new Date().toISOString(), pendingSync: mode === 'authenticated' && !navigator.onLine }
            : g
        ),
      }));
    },
    [commitStore, mode]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      commitStore((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
    },
    [commitStore]
  );

  const saveCalculatorHistory = useCallback(
    (entry: Omit<CalculatorHistoryEntry, 'id' | 'createdAt'>) => {
      const full: CalculatorHistoryEntry = {
        ...entry,
        id: `ch-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      commitStore((prev) => ({
        ...prev,
        calculatorHistory: [full, ...prev.calculatorHistory].slice(0, 50),
      }));
    },
    [commitStore]
  );

  const clearCalculatorHistory = useCallback(() => {
    commitStore((prev) => ({ ...prev, calculatorHistory: [] }));
  }, [commitStore]);

  const markTopicCompleted = useCallback(
    (topicId: string, quizScore?: number) => {
      commitStore((prev) => ({
        ...prev,
        completedTopicIds: prev.completedTopicIds.includes(topicId)
          ? prev.completedTopicIds
          : [...prev.completedTopicIds, topicId],
        quizScores:
          quizScore !== undefined ? { ...prev.quizScores, [topicId]: quizScore } : prev.quizScores,
      }));
    },
    [commitStore]
  );

  const updateTaxConfig = useCallback(
    (cfg: TaxSlabConfig) => {
      commitStore((prev) => ({ ...prev, taxConfig: cfg }));
    },
    [commitStore]
  );

  // Real data-driven Notifications
  const notifications = useMemo<NotificationItem[]>(() => {
    if (!profile) return [];
    const prefs = profile.notificationPreferences;
    const readSet = new Set(store.readNotificationIds);
    const items: NotificationItem[] = [];
    const currentMonth = getCurrentMonthKey();
    const currency = profile.currency || 'INR';

    const monthIncome = store.incomes
      .filter((i) => i.date.startsWith(currentMonth))
      .reduce((s, i) => s + i.amount, 0);
    const monthExpenses = store.expenses.filter((e) => e.date.startsWith(currentMonth));
    const monthExpenseTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const currentBudget = store.budgets.find((b) => b.month === currentMonth);

    if (currentBudget && currentBudget.totalMonthlyBudget > 0) {
      const pct = (monthExpenseTotal / currentBudget.totalMonthlyBudget) * 100;
      if (pct >= 100 && prefs.budgetExceeded) {
        const id = `notif-budget-exceeded-${currentMonth}`;
        items.push({
          id,
          type: 'budget_exceeded',
          title: 'Monthly Budget Exceeded',
          message: `Spending for ${currentMonth} (${formatMoney(monthExpenseTotal, currency)}) has exceeded your planned limit of ${formatMoney(currentBudget.totalMonthlyBudget, currency)} (${pct.toFixed(0)}%).`,
          severity: 'critical',
          createdAt: new Date().toISOString(),
          read: readSet.has(id),
          actionTab: 'budget',
        });
      } else if (pct >= 80 && prefs.budgetApproaching) {
        const id = `notif-budget-warn-${currentMonth}`;
        items.push({
          id,
          type: 'budget_warning',
          title: 'Monthly Budget Approaching Limit',
          message: `You have used ${pct.toFixed(0)}% of your ${currentMonth} household budget (${formatMoney(monthExpenseTotal, currency)} of ${formatMoney(currentBudget.totalMonthlyBudget, currency)}).`,
          severity: 'warning',
          createdAt: new Date().toISOString(),
          read: readSet.has(id),
          actionTab: 'budget',
        });
      }

      // Check category budgets
      for (const cat of currentBudget.categories) {
        if (cat.allocated <= 0) continue;
        const spent = monthExpenses.filter((e) => e.category === cat.category).reduce((s, e) => s + e.amount, 0);
        const catPct = (spent / cat.allocated) * 100;
        if (catPct >= 100 && prefs.budgetExceeded) {
          const id = `notif-cat-exceed-${currentMonth}-${cat.category}`;
          items.push({
            id,
            type: 'budget_exceeded',
            title: `${cat.category} Budget Exceeded`,
            message: `Actual ${cat.category} spend (${formatMoney(spent, currency)}) exceeded allocated ${formatMoney(cat.allocated, currency)}.`,
            severity: 'critical',
            createdAt: new Date().toISOString(),
            read: readSet.has(id),
            actionTab: 'budget',
          });
        } else if (catPct >= 85 && prefs.budgetApproaching) {
          const id = `notif-cat-warn-${currentMonth}-${cat.category}`;
          items.push({
            id,
            type: 'budget_warning',
            title: `${cat.category} Budget at ${catPct.toFixed(0)}%`,
            message: `${formatMoney(cat.allocated - spent, currency)} remaining in your ${cat.category} allocation.`,
            severity: 'warning',
            createdAt: new Date().toISOString(),
            read: readSet.has(id),
            actionTab: 'budget',
          });
        }
      }
    }

    // Savings goals progress
    if (prefs.savingsMilestones) {
      for (const g of store.goals) {
        const pct = g.targetAmount > 0 ? (g.currentSaved / g.targetAmount) * 100 : 0;
        if (pct >= 100) {
          const id = `notif-goal-done-${g.id}`;
          items.push({
            id,
            type: 'goal_progress',
            title: `Goal Completed: ${g.name}`,
            message: `You reached ${formatMoney(g.currentSaved, currency)} against your target of ${formatMoney(g.targetAmount, currency)}.`,
            severity: 'success',
            createdAt: g.updatedAt,
            read: readSet.has(id),
            actionTab: 'goals',
          });
        } else if (pct >= 70) {
          const id = `notif-goal-70-${g.id}`;
          items.push({
            id,
            type: 'goal_progress',
            title: `Savings Goal ${pct.toFixed(0)}% Funded`,
            message: `${g.name}: ${formatMoney(g.targetAmount - g.currentSaved, currency)} remaining to reach your target.`,
            severity: 'info',
            createdAt: g.updatedAt,
            read: readSet.has(id),
            actionTab: 'goals',
          });
        }
      }
    }

    // Recurring bill reminders
    if (prefs.billReminders && profile.recurringReminders?.length) {
      const todayDay = new Date().getDate();
      for (const rem of profile.recurringReminders) {
        if (!rem.active) continue;
        const diff = rem.dueDay - todayDay;
        if (diff >= -1 && diff <= 5) {
          const id = `notif-bill-${rem.id}-${currentMonth}`;
          items.push({
            id,
            type: 'bill_reminder',
            title: `Upcoming Bill: ${rem.title}`,
            message: `Due on day ${rem.dueDay} of the month · Estimated ${formatMoney(rem.amount, currency)} (${rem.category}).`,
            severity: diff <= 1 ? 'warning' : 'info',
            createdAt: new Date().toISOString(),
            read: readSet.has(id),
            actionTab: 'expenses',
          });
        }
      }
    }

    // Monthly financial summary
    if (prefs.monthlySummary && (monthIncome > 0 || monthExpenseTotal > 0)) {
      const id = `notif-summary-${currentMonth}`;
      const net = monthIncome - monthExpenseTotal;
      items.push({
        id,
        type: 'monthly_summary',
        title: `${currentMonth} Household Summary`,
        message: `Income ${formatMoney(monthIncome, currency)} · Expenses ${formatMoney(monthExpenseTotal, currency)} · Net Savings ${formatMoney(net, currency)}.`,
        severity: net >= 0 ? 'success' : 'warning',
        createdAt: new Date().toISOString(),
        read: readSet.has(id),
        actionTab: 'reports',
      });
    }

    // Verified admin announcements / scheme updates (never fabricated)
    if (prefs.schemeUpdates) {
      for (const ann of announcements) {
        const id = `notif-ann-${ann.id}`;
        items.push({
          id,
          type: 'scheme_update',
          title: ann.title,
          message: ann.message,
          severity: 'info',
          createdAt: ann.publishedAt,
          read: readSet.has(id),
          actionTab: 'schemes',
        });
      }
    }

    // Learning progress milestone
    if (prefs.learningUpdates && learningTopics.length > 0) {
      const done = store.completedTopicIds.length;
      if (done < learningTopics.length) {
        const id = `notif-learn-${done}`;
        items.push({
          id,
          type: 'learning_update',
          title: `Financial Literacy Progress: ${done}/${learningTopics.length} Topics`,
          message: `Continue your financial education modules to strengthen your budgeting, tax, and digital safety skills.`,
          severity: 'info',
          createdAt: new Date().toISOString(),
          read: readSet.has(id),
          actionTab: 'learning',
        });
      }
    }

    return items;
  }, [announcements, learningTopics.length, profile, store.budgets, store.completedTopicIds.length, store.expenses, store.goals, store.incomes, store.readNotificationIds]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      commitStore((prev) => ({
        ...prev,
        readNotificationIds: prev.readNotificationIds.includes(id)
          ? prev.readNotificationIds
          : [...prev.readNotificationIds, id],
      }));
    },
    [commitStore]
  );

  const markAllNotificationsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    commitStore((prev) => ({
      ...prev,
      readNotificationIds: Array.from(new Set([...prev.readNotificationIds, ...allIds])),
    }));
  }, [commitStore, notifications]);

  const value: AppContextValue = {
    mode,
    token,
    profile,
    store,
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    isOnline,
    hasPendingSync,
    isSyncing,
    lastSyncedAt,
    syncNow,
    schemes,
    learningTopics,
    faqs,
    announcements,
    refreshPublicContent,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    focusedCalculatorId,
    setFocusedCalculatorId,
    focusedSchemeId,
    setFocusedSchemeId,
    focusedTopicId,
    setFocusedTopicId,
    enterDemoMode,
    resetDemo,
    loginUser,
    registerUser,
    logout,
    updateProfile,
    deleteAccount,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    upsertBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    saveCalculatorHistory,
    clearCalculatorHistory,
    markTopicCompleted,
    updateTaxConfig,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
