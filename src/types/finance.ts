export type LanguageCode = 'en' | 'hi' | 'kn' | 'mr' | 'te' | 'ta' | 'bn' | 'gu';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export type UserRole = 'user' | 'admin';

export type IncomeCategory =
  | 'Salary'
  | 'Business income'
  | 'Freelancing'
  | 'Scholarship'
  | 'Pocket money'
  | 'Rental income'
  | 'Interest income'
  | 'Other income'
  | string;

export type ExpenseCategory =
  | 'Food'
  | 'Groceries'
  | 'Education'
  | 'Transportation'
  | 'Electricity'
  | 'Water'
  | 'House rent'
  | 'Medical'
  | 'Shopping'
  | 'Entertainment'
  | 'Internet and mobile'
  | 'Travel'
  | 'Household expenses'
  | 'Other expenses'
  | string;

export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking' | 'Auto-Debit';

export interface NotificationPreferences {
  budgetApproaching: boolean;
  budgetExceeded: boolean;
  savingsMilestones: boolean;
  monthlySummary: boolean;
  billReminders: boolean;
  schemeUpdates: boolean;
  learningUpdates: boolean;
}

export interface RecurringBillReminder {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  category: ExpenseCategory;
  active: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  preferredLanguage: LanguageCode;
  currency: CurrencyCode;
  monthlyIncomeRange?: string;
  financialGoalsSummary?: string;
  customIncomeCategories: string[];
  customExpenseCategories: string[];
  notificationPreferences: NotificationPreferences;
  recurringReminders: RecurringBillReminder[];
  privacyShareAnalytics: boolean;
  createdAt: string;
}

export interface IncomeRecord {
  id: string;
  amount: number;
  category: IncomeCategory;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: PaymentMethod;
  pendingSync?: boolean;
  updatedAt: string;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: PaymentMethod;
  pendingSync?: boolean;
  updatedAt: string;
}

export interface CategoryBudget {
  category: string;
  allocated: number;
}

export interface HouseholdBudget {
  id: string;
  month: string; // YYYY-MM
  totalMonthlyBudget: number;
  dailyLimit: number;
  weeklyLimit: number;
  carryForwardSavings: boolean;
  carriedForwardAmount: number;
  categories: CategoryBudget[];
  updatedAt: string;
  pendingSync?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  category: string;
  updatedAt: string;
  pendingSync?: boolean;
}

export interface CalculatorHistoryEntry {
  id: string;
  calculatorId: string;
  calculatorName: string;
  category: string;
  inputs: Record<string, string | number>;
  primaryResultLabel: string;
  primaryResultValue: string;
  summary: string;
  createdAt: string;
}

export type SchemeLevel = 'Central Government' | 'State Government' | 'Karnataka Government';

export type SchemeAudience =
  | 'Women'
  | 'Students'
  | 'Farmers'
  | 'Senior Citizens'
  | 'General Public'
  | 'Small Business'
  | 'Families';

export interface GovernmentScheme {
  id: string;
  name: string;
  shortCode?: string;
  category: string;
  level: SchemeLevel;
  stateName?: string;
  targetAudiences: SchemeAudience[];
  description: string;
  eligibility: string[];
  requiredDocuments: string[];
  benefits: string[];
  applicationProcedure: string[];
  importantConditions: string[];
  deadline: string;
  officialWebsite: string;
  lastVerifiedDate: string;
  latestUpdate: string;
  keywords: string[];
}

export type LearningCategoryId =
  | 'basic_knowledge'
  | 'saving_budgeting'
  | 'investment_education'
  | 'loans_credit'
  | 'tax_education'
  | 'financial_safety';

export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningTopic {
  id: string;
  categoryId: LearningCategoryId;
  categoryName: string;
  title: string;
  level: LearningLevel;
  readTimeMinutes: number;
  simpleExplanation: string;
  realLifeExample: string;
  visualDiagramSummary: {
    label: string;
    value: string;
    note: string;
  }[];
  importantPoints: string[];
  quiz: QuizQuestion[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  publishedAt: string;
  sourceUrl?: string;
}

export interface NotificationItem {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'goal_progress' | 'monthly_summary' | 'bill_reminder' | 'scheme_update' | 'learning_update';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  createdAt: string;
  read: boolean;
  actionTab?: NavTab;
}

export interface TaxSlabConfig {
  financialYear: string;
  assessmentYear: string;
  newRegimeStandardDeduction: number;
  oldRegimeStandardDeduction: number;
  newRegimeRebateLimit: number;
  oldRegimeRebateLimit: number;
  cessRatePercent: number;
  newRegimeSlabs: { upto: number | null; rate: number }[];
  oldRegimeSlabs: { upto: number | null; rate: number }[];
}

export interface UserFinancialStore {
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  budgets: HouseholdBudget[];
  goals: SavingsGoal[];
  calculatorHistory: CalculatorHistoryEntry[];
  completedTopicIds: string[];
  quizScores: Record<string, number>;
  readNotificationIds: string[];
  taxConfig: TaxSlabConfig;
}

export type NavTab =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'budget'
  | 'goals'
  | 'calculators'
  | 'schemes'
  | 'learning'
  | 'assistant'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'admin';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  error?: boolean;
}
