import type { UserFinancialStore, UserProfile } from '../types/finance';
import { DEFAULT_TAX_CONFIG } from '../data/glossaryAndFaqs';

const DEMO_PROFILE_KEY = 'sfl_demo_profile_v1';
const DEMO_STORE_KEY = 'sfl_demo_store_v1';

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function monthStr(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().slice(0, 7);
}

export function createDemoProfile(): UserProfile {
  return {
    id: 'demo-guest',
    fullName: 'Aarav Sharma (Demo Household)',
    email: 'guest-demo@local.preview',
    role: 'user',
    preferredLanguage: 'en',
    currency: 'INR',
    monthlyIncomeRange: '₹35,000 - ₹50,000',
    financialGoalsSummary: 'Build 6-month emergency fund and save for child education',
    customIncomeCategories: [],
    customExpenseCategories: [],
    notificationPreferences: {
      budgetApproaching: true,
      budgetExceeded: true,
      savingsMilestones: true,
      monthlySummary: true,
      billReminders: true,
      schemeUpdates: true,
      learningUpdates: true,
    },
    recurringReminders: [
      { id: 'rem-1', title: 'House Rent Transfer', amount: 8500, dueDay: 5, category: 'House rent', active: true },
      { id: 'rem-2', title: 'BESCOM Electricity Bill', amount: 1450, dueDay: 12, category: 'Electricity', active: true },
      { id: 'rem-3', title: 'Broadband & Mobile Recharge', amount: 999, dueDay: 18, category: 'Internet and mobile', active: true },
    ],
    privacyShareAnalytics: false,
    createdAt: new Date().toISOString(),
  };
}

export function createSampleDemoStore(): UserFinancialStore {
  const m0 = monthStr(0);
  const m1 = monthStr(1);
  const m2 = monthStr(2);
  const m3 = monthStr(3);

  return {
    incomes: [
      { id: 'inc-1', amount: 42000, category: 'Salary', date: `${m0}-01`, description: 'Monthly Household Salary (Sample)', paymentMethod: 'Bank Transfer', updatedAt: new Date().toISOString() },
      { id: 'inc-2', amount: 6500, category: 'Freelancing', date: `${m0}-09`, description: 'Weekend Bookkeeping Project (Sample)', paymentMethod: 'UPI', updatedAt: new Date().toISOString() },
      { id: 'inc-3', amount: 1200, category: 'Interest income', date: `${m0}-14`, description: 'Quarterly Savings Bank Interest (Sample)', paymentMethod: 'Bank Transfer', updatedAt: new Date().toISOString() },
      { id: 'inc-4', amount: 42000, category: 'Salary', date: `${m1}-01`, description: 'Previous Month Salary (Sample)', paymentMethod: 'Bank Transfer', updatedAt: new Date().toISOString() },
      { id: 'inc-5', amount: 4500, category: 'Business income', date: `${m1}-15`, description: 'Tailoring & Craft Orders (Sample)', paymentMethod: 'UPI', updatedAt: new Date().toISOString() },
      { id: 'inc-6', amount: 40000, category: 'Salary', date: `${m2}-01`, description: 'Salary Credit (Sample)', paymentMethod: 'Bank Transfer', updatedAt: new Date().toISOString() },
      { id: 'inc-7', amount: 40000, category: 'Salary', date: `${m3}-01`, description: 'Salary Credit (Sample)', paymentMethod: 'Bank Transfer', updatedAt: new Date().toISOString() },
    ],
    expenses: [
      { id: 'exp-1', amount: 8500, category: 'House rent', date: `${m0}-02`, description: 'Monthly Apartment Rent (Sample)', paymentMethod: 'Bank Transfer', updatedAt: new Date().toISOString() },
      { id: 'exp-2', amount: 4200, category: 'Groceries', date: `${m0}-03`, description: 'Monthly Staples, Dal, Rice & Milk (Sample)', paymentMethod: 'UPI', updatedAt: new Date().toISOString() },
      { id: 'exp-3', amount: 3500, category: 'Education', date: `${m0}-05`, description: 'School Tuition & Books (Sample)', paymentMethod: 'Debit Card', updatedAt: new Date().toISOString() },
      { id: 'exp-4', amount: 1450, category: 'Electricity', date: `${m0}-07`, description: 'Monthly Power Bill (Sample)', paymentMethod: 'UPI', updatedAt: new Date().toISOString() },
      { id: 'exp-5', amount: 1850, category: 'Transportation', date: isoDaysAgo(4), description: 'Metro Pass & Petrol (Sample)', paymentMethod: 'UPI', updatedAt: new Date().toISOString() },
      { id: 'exp-6', amount: 2450, category: 'Food', date: isoDaysAgo(2), description: 'Fresh Produce & Family Dinner (Sample)', paymentMethod: 'UPI', updatedAt: new Date().toISOString() },
      { id: 'exp-7', amount: 1650, category: 'Medical', date: isoDaysAgo(1), description: 'Pharmacy & Routine Checkup (Sample)', paymentMethod: 'Cash', updatedAt: new Date().toISOString() },
      { id: 'exp-8', amount: 999, category: 'Internet and mobile', date: `${m0}-10`, description: 'Fiber Wi-Fi + Mobile Plan (Sample)', paymentMethod: 'UPI', updatedAt: new Date().toISOString() },
      { id: 'exp-9', amount: 8500, category: 'House rent', date: `${m1}-02`, description: 'Last Month Rent (Sample)', paymentMethod: 'Bank Transfer', updatedAt: new Date().toISOString() },
      { id: 'exp-10', amount: 5200, category: 'Groceries', date: `${m1}-06`, description: 'Last Month Groceries (Sample)', paymentMethod: 'UPI', updatedAt: new Date().toISOString() },
      { id: 'exp-11', amount: 3800, category: 'Education', date: `${m1}-08`, description: 'Tuition Fee (Sample)', paymentMethod: 'Debit Card', updatedAt: new Date().toISOString() },
      { id: 'exp-12', amount: 4600, category: 'Shopping', date: `${m1}-18`, description: 'Festival Clothing (Sample)', paymentMethod: 'Debit Card', updatedAt: new Date().toISOString() },
      { id: 'exp-13', amount: 22500, category: 'Household expenses', date: `${m2}-10`, description: 'Combined Monthly Household Outflow (Sample)', paymentMethod: 'Bank Transfer', updatedAt: new Date().toISOString() },
      { id: 'exp-14', amount: 24100, category: 'Household expenses', date: `${m3}-10`, description: 'Combined Monthly Household Outflow (Sample)', paymentMethod: 'Bank Transfer', updatedAt: new Date().toISOString() },
    ],
    budgets: [
      {
        id: `budget-${m0}`,
        month: m0,
        totalMonthlyBudget: 28000,
        dailyLimit: 1200,
        weeklyLimit: 7000,
        carryForwardSavings: true,
        carriedForwardAmount: 2400,
        categories: [
          { category: 'House rent', allocated: 8500 },
          { category: 'Groceries', allocated: 5000 },
          { category: 'Food', allocated: 3000 },
          { category: 'Education', allocated: 4000 },
          { category: 'Transportation', allocated: 2000 },
          { category: 'Electricity', allocated: 1500 },
          { category: 'Medical', allocated: 1500 },
          { category: 'Internet and mobile', allocated: 1000 },
          { category: 'Other expenses', allocated: 1500 },
        ],
        updatedAt: new Date().toISOString(),
      },
    ],
    goals: [
      {
        id: 'goal-1',
        name: '6-Month Emergency Fund (Sample)',
        targetAmount: 120000,
        currentSaved: 68000,
        targetDate: '2027-06-30',
        monthlyContribution: 6000,
        category: 'Emergency fund',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'goal-2',
        name: 'Student Laptop Upgrade (Sample)',
        targetAmount: 55000,
        currentSaved: 38500,
        targetDate: '2027-02-28',
        monthlyContribution: 4500,
        category: 'Laptop purchase',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'goal-3',
        name: 'Annual School & College Fee Fund (Sample)',
        targetAmount: 45000,
        currentSaved: 22500,
        targetDate: '2027-04-15',
        monthlyContribution: 3500,
        category: 'Education savings',
        updatedAt: new Date().toISOString(),
      },
    ],
    calculatorHistory: [
      {
        id: 'ch-1',
        calculatorId: 'sip',
        calculatorName: 'SIP Calculator',
        category: 'Investment Education',
        inputs: { monthlyAmount: 5000, expectedReturn: 12, years: 10 },
        primaryResultLabel: 'Estimated Maturity Value',
        primaryResultValue: '₹11,61,695',
        summary: '₹5,000/month for 10 years at 12% illustrative return',
        createdAt: new Date().toISOString(),
      },
    ],
    completedTopicIds: ['learn-money-banks', 'learn-household-budget'],
    quizScores: { 'learn-money-banks': 100, 'learn-household-budget': 100 },
    readNotificationIds: [],
    taxConfig: DEFAULT_TAX_CONFIG,
  };
}

export function loadDemoState(): { profile: UserProfile; store: UserFinancialStore } {
  try {
    const rawProfile = localStorage.getItem(DEMO_PROFILE_KEY);
    const rawStore = localStorage.getItem(DEMO_STORE_KEY);
    if (rawProfile && rawStore) {
      return {
        profile: JSON.parse(rawProfile) as UserProfile,
        store: JSON.parse(rawStore) as UserFinancialStore,
      };
    }
  } catch {
    // Fallback to fresh sample data
  }
  const profile = createDemoProfile();
  const store = createSampleDemoStore();
  saveDemoState(profile, store);
  return { profile, store };
}

export function saveDemoState(profile: UserProfile, store: UserFinancialStore): void {
  try {
    localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetDemoState(): { profile: UserProfile; store: UserFinancialStore } {
  const profile = createDemoProfile();
  const store = createSampleDemoStore();
  saveDemoState(profile, store);
  return { profile, store };
}
