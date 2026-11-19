import express from 'express';
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage } from '@google/genai';
import { WebSocketServer } from 'ws';
import type { Request, Response, NextFunction } from 'express';
import { INITIAL_SCHEMES } from './src/data/schemesData.ts';
import { INITIAL_LEARNING_TOPICS } from './src/data/learningData.ts';
import { DEFAULT_TAX_CONFIG, INITIAL_ANNOUNCEMENTS, INITIAL_FAQS } from './src/data/glossaryAndFaqs.ts';
import type {
  Announcement,
  FAQItem,
  GovernmentScheme,
  LearningTopic,
  UserFinancialStore,
  UserProfile,
} from './src/types/finance.ts';

dotenv.config();

interface StoredUser {
  profile: UserProfile;
  passwordHash: string;
  passwordSalt: string;
}

interface ResetTokenRecord {
  email: string;
  codeHash: string;
  expiresAt: number;
}

interface DatabaseSchema {
  users: Record<string, StoredUser>;
  userStores: Record<string, UserFinancialStore>;
  schemes: GovernmentScheme[];
  learningTopics: LearningTopic[];
  faqs: FAQItem[];
  announcements: Announcement[];
  resetTokens: Record<string, ResetTokenRecord>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update(`smart-finance-${process.cwd()}`).digest('hex');
const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE || 'SMART-ADMIN-2026';

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return { hash, salt: usedSalt };
}

function verifyPassword(password: string, expectedHash: string, salt: string): boolean {
  const computed = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, 'hex');
  if (computed.length !== expected.length) return false;
  return crypto.timingSafeEqual(computed, expected);
}

function signToken(userId: string, role: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, role, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string): { uid: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      uid: string;
      role: string;
      exp: number;
    };
    if (Date.now() > decoded.exp) return null;
    return { uid: decoded.uid, role: decoded.role };
  } catch {
    return null;
  }
}

function createEmptyUserStore(): UserFinancialStore {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return {
    incomes: [],
    expenses: [],
    budgets: [
      {
        id: `budget-${currentMonth}`,
        month: currentMonth,
        totalMonthlyBudget: 25000,
        dailyLimit: 1000,
        weeklyLimit: 6500,
        carryForwardSavings: true,
        carriedForwardAmount: 0,
        categories: [
          { category: 'Food', allocated: 5000 },
          { category: 'Groceries', allocated: 4000 },
          { category: 'House rent', allocated: 7000 },
          { category: 'Education', allocated: 3000 },
          { category: 'Transportation', allocated: 2000 },
          { category: 'Electricity', allocated: 1500 },
          { category: 'Medical', allocated: 1500 },
          { category: 'Other expenses', allocated: 1000 },
        ],
        updatedAt: new Date().toISOString(),
      },
    ],
    goals: [],
    calculatorHistory: [],
    completedTopicIds: [],
    quizScores: {},
    readNotificationIds: [],
    taxConfig: DEFAULT_TAX_CONFIG,
  };
}

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      return {
        users: parsed.users || {},
        userStores: parsed.userStores || {},
        schemes: parsed.schemes?.length ? parsed.schemes : INITIAL_SCHEMES,
        learningTopics: parsed.learningTopics?.length ? parsed.learningTopics : INITIAL_LEARNING_TOPICS,
        faqs: parsed.faqs?.length ? parsed.faqs : INITIAL_FAQS,
        announcements: parsed.announcements?.length ? parsed.announcements : INITIAL_ANNOUNCEMENTS,
        resetTokens: parsed.resetTokens || {},
      };
    } catch {
      // Fallback to fresh initialized DB if corrupt
    }
  }

  // Seed default administrator account with securely hashed password (never plain-text)
  const adminId = 'usr-admin-seed';
  const adminCreds = hashPassword('Admin@2026');
  const adminProfile: UserProfile = {
    id: adminId,
    fullName: 'Portal Administrator',
    email: 'admin@smartfinance.in',
    role: 'admin',
    preferredLanguage: 'en',
    currency: 'INR',
    monthlyIncomeRange: '₹50,000 - ₹1,00,000',
    financialGoalsSummary: 'Maintain verified Indian scheme records & financial literacy modules',
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
    recurringReminders: [],
    privacyShareAnalytics: true,
    createdAt: new Date().toISOString(),
  };

  const initial: DatabaseSchema = {
    users: {
      [adminId]: {
        profile: adminProfile,
        passwordHash: adminCreds.hash,
        passwordSalt: adminCreds.salt,
      },
    },
    userStores: {
      [adminId]: createEmptyUserStore(),
    },
    schemes: INITIAL_SCHEMES,
    learningTopics: INITIAL_LEARNING_TOPICS,
    faqs: INITIAL_FAQS,
    announcements: INITIAL_ANNOUNCEMENTS,
    resetTokens: {},
  };

  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

let db = loadDatabase();

interface AuthedRequest extends Request {
  auth?: { uid: string; role: string };
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const verified = token ? verifyToken(token) : null;
  if (!verified || !db.users[verified.uid]) {
    res.status(401).json({ error: 'Authentication required. Please sign in again.' });
    return;
  }
  req.auth = verified;
  next();
}

function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (!req.auth || db.users[req.auth.uid]?.profile.role !== 'admin') {
    res.status(403).json({ error: 'Administrator privileges required for this action.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // --- AUTHENTICATION ROUTES ---
  app.post('/api/auth/register', (req, res) => {
    const {
      fullName,
      email,
      password,
      preferredLanguage,
      monthlyIncomeRange,
      financialGoalsSummary,
      adminInviteCode,
    } = req.body as Record<string, string>;

    if (!fullName?.trim() || !email?.trim() || !password || password.length < 6) {
      res.status(400).json({ error: 'Full name, valid email, and password (min 6 characters) are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = Object.values(db.users).some((u) => u.profile.email.toLowerCase() === normalizedEmail);
    if (exists) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const id = `usr-${crypto.randomUUID()}`;
    const { hash, salt } = hashPassword(password);
    const role = adminInviteCode && adminInviteCode.trim() === ADMIN_INVITE_CODE ? 'admin' : 'user';

    const profile: UserProfile = {
      id,
      fullName: fullName.trim(),
      email: normalizedEmail,
      role,
      preferredLanguage: (preferredLanguage as UserProfile['preferredLanguage']) || 'en',
      currency: 'INR',
      monthlyIncomeRange: monthlyIncomeRange?.trim() || '',
      financialGoalsSummary: financialGoalsSummary?.trim() || '',
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
      recurringReminders: [],
      privacyShareAnalytics: false,
      createdAt: new Date().toISOString(),
    };

    db.users[id] = { profile, passwordHash: hash, passwordSalt: salt };
    db.userStores[id] = createEmptyUserStore();
    saveDatabase(db);

    const token = signToken(id, profile.role);
    res.status(201).json({ token, profile, store: db.userStores[id] });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const userEntry = Object.values(db.users).find((u) => u.profile.email.toLowerCase() === normalizedEmail);
    if (!userEntry || !verifyPassword(password, userEntry.passwordHash, userEntry.passwordSalt)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signToken(userEntry.profile.id, userEntry.profile.role);
    const store = db.userStores[userEntry.profile.id] || createEmptyUserStore();
    res.json({ token, profile: userEntry.profile, store });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) {
      res.status(400).json({ error: 'Please enter your registered email address.' });
      return;
    }
    const normalized = email.trim().toLowerCase();
    const userEntry = Object.values(db.users).find((u) => u.profile.email.toLowerCase() === normalized);
    if (!userEntry) {
      res.status(404).json({ error: 'No account found with that email address.' });
      return;
    }

    const resetCode = String(crypto.randomInt(100000, 999999));
    const codeHash = crypto.createHash('sha256').update(resetCode).digest('hex');
    db.resetTokens[normalized] = {
      email: normalized,
      codeHash,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
    saveDatabase(db);

    res.json({
      message: 'One-time password reset code generated (valid for 15 minutes).',
      verificationCode: resetCode,
      deliveryNote: 'SMTP email server is not configured in this preview environment; use the verification code shown above to reset your password.',
    });
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { email, code, newPassword } = req.body as { email?: string; code?: string; newPassword?: string };
    if (!email || !code || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Email, 6-digit verification code, and new password (min 6 chars) are required.' });
      return;
    }
    const normalized = email.trim().toLowerCase();
    const record = db.resetTokens[normalized];
    if (!record || Date.now() > record.expiresAt) {
      res.status(400).json({ error: 'Reset code is invalid or has expired.' });
      return;
    }
    const codeHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    if (codeHash !== record.codeHash) {
      res.status(400).json({ error: 'Incorrect verification code.' });
      return;
    }

    const userEntry = Object.values(db.users).find((u) => u.profile.email.toLowerCase() === normalized);
    if (!userEntry) {
      res.status(404).json({ error: 'Account not found.' });
      return;
    }

    const { hash, salt } = hashPassword(newPassword);
    userEntry.passwordHash = hash;
    userEntry.passwordSalt = salt;
    delete db.resetTokens[normalized];
    saveDatabase(db);
    res.json({ message: 'Password updated successfully. You can now sign in.' });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.auth!.uid;
    res.json({
      profile: db.users[uid].profile,
      store: db.userStores[uid] || createEmptyUserStore(),
    });
  });

  app.put('/api/auth/profile', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.auth!.uid;
    const current = db.users[uid].profile;
    const updates = req.body as Partial<UserProfile>;
    // Never allow client-side privilege escalation to admin via profile update
    const updated: UserProfile = {
      ...current,
      fullName: typeof updates.fullName === 'string' && updates.fullName.trim() ? updates.fullName.trim() : current.fullName,
      preferredLanguage: updates.preferredLanguage || current.preferredLanguage,
      currency: updates.currency || current.currency,
      monthlyIncomeRange: updates.monthlyIncomeRange ?? current.monthlyIncomeRange,
      financialGoalsSummary: updates.financialGoalsSummary ?? current.financialGoalsSummary,
      customIncomeCategories: Array.isArray(updates.customIncomeCategories) ? updates.customIncomeCategories : current.customIncomeCategories,
      customExpenseCategories: Array.isArray(updates.customExpenseCategories) ? updates.customExpenseCategories : current.customExpenseCategories,
      notificationPreferences: updates.notificationPreferences || current.notificationPreferences,
      recurringReminders: Array.isArray(updates.recurringReminders) ? updates.recurringReminders : current.recurringReminders,
      privacyShareAnalytics: typeof updates.privacyShareAnalytics === 'boolean' ? updates.privacyShareAnalytics : current.privacyShareAnalytics,
    };
    db.users[uid].profile = updated;
    saveDatabase(db);
    res.json({ profile: updated });
  });

  app.post('/api/auth/change-password', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.auth!.uid;
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Current password and new password (min 6 chars) are required.' });
      return;
    }
    const userEntry = db.users[uid];
    if (!verifyPassword(currentPassword, userEntry.passwordHash, userEntry.passwordSalt)) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }
    const { hash, salt } = hashPassword(newPassword);
    userEntry.passwordHash = hash;
    userEntry.passwordSalt = salt;
    saveDatabase(db);
    res.json({ message: 'Password changed successfully.' });
  });

  app.delete('/api/auth/account', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.auth!.uid;
    delete db.users[uid];
    delete db.userStores[uid];
    saveDatabase(db);
    res.json({ message: 'Account and all private financial records deleted.' });
  });

  // --- PER-USER FINANCIAL STORE & OFFLINE SYNC ---
  app.get('/api/finance/state', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.auth!.uid;
    res.json({ store: db.userStores[uid] || createEmptyUserStore() });
  });

  app.put('/api/finance/state', requireAuth, (req: AuthedRequest, res) => {
    const uid = req.auth!.uid;
    const incoming = req.body as UserFinancialStore;
    if (!incoming || !Array.isArray(incoming.incomes) || !Array.isArray(incoming.expenses)) {
      res.status(400).json({ error: 'Invalid financial state payload.' });
      return;
    }
    // Strip pendingSync flags on confirmed server write
    const cleaned: UserFinancialStore = {
      incomes: incoming.incomes.map((i) => ({ ...i, pendingSync: false })),
      expenses: incoming.expenses.map((e) => ({ ...e, pendingSync: false })),
      budgets: (incoming.budgets || []).map((b) => ({ ...b, pendingSync: false })),
      goals: (incoming.goals || []).map((g) => ({ ...g, pendingSync: false })),
      calculatorHistory: incoming.calculatorHistory || [],
      completedTopicIds: incoming.completedTopicIds || [],
      quizScores: incoming.quizScores || {},
      readNotificationIds: incoming.readNotificationIds || [],
      taxConfig: incoming.taxConfig || DEFAULT_TAX_CONFIG,
    };
    db.userStores[uid] = cleaned;
    saveDatabase(db);
    res.json({ store: cleaned, syncedAt: new Date().toISOString() });
  });

  // --- PUBLIC CONTENT (SCHEMES, LEARNING, FAQS, ANNOUNCEMENTS) ---
  app.get('/api/public/content', (_req, res) => {
    res.json({
      schemes: db.schemes,
      learningTopics: db.learningTopics,
      faqs: db.faqs,
      announcements: db.announcements,
    });
  });

  // --- ADMIN ROUTES ---
  app.get('/api/admin/analytics', requireAuth, requireAdmin, (_req, res) => {
    const totalUsers = Object.keys(db.users).length;
    const totalTransactions = Object.values(db.userStores).reduce(
      (sum, st) => sum + st.incomes.length + st.expenses.length,
      0
    );
    const totalGoals = Object.values(db.userStores).reduce((sum, st) => sum + st.goals.length, 0);
    res.json({
      totalUsers,
      totalTransactions,
      totalGoals,
      schemesCount: db.schemes.length,
      topicsCount: db.learningTopics.length,
      faqsCount: db.faqs.length,
      announcementsCount: db.announcements.length,
    });
  });

  app.post('/api/admin/schemes', requireAuth, requireAdmin, (req, res) => {
    const scheme = req.body as GovernmentScheme;
    if (!scheme?.name || !scheme?.officialWebsite) {
      res.status(400).json({ error: 'Scheme name and official portal URL are required.' });
      return;
    }
    const newScheme: GovernmentScheme = {
      ...scheme,
      id: scheme.id || `sch-${crypto.randomUUID().slice(0, 8)}`,
      lastVerifiedDate: scheme.lastVerifiedDate || new Date().toISOString().slice(0, 10),
    };
    db.schemes = [newScheme, ...db.schemes];
    saveDatabase(db);
    res.status(201).json({ scheme: newScheme });
  });

  app.put('/api/admin/schemes/:id', requireAuth, requireAdmin, (req, res) => {
    const { id } = req.params;
    const idx = db.schemes.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Scheme not found.' });
      return;
    }
    db.schemes[idx] = { ...db.schemes[idx], ...(req.body as Partial<GovernmentScheme>), id };
    saveDatabase(db);
    res.json({ scheme: db.schemes[idx] });
  });

  app.delete('/api/admin/schemes/:id', requireAuth, requireAdmin, (req, res) => {
    const { id } = req.params;
    db.schemes = db.schemes.filter((s) => s.id !== id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  app.post('/api/admin/learning', requireAuth, requireAdmin, (req, res) => {
    const topic = req.body as LearningTopic;
    if (!topic?.title || !topic?.simpleExplanation) {
      res.status(400).json({ error: 'Topic title and explanation are required.' });
      return;
    }
    const created: LearningTopic = {
      ...topic,
      id: topic.id || `learn-${crypto.randomUUID().slice(0, 8)}`,
    };
    db.learningTopics = [created, ...db.learningTopics];
    saveDatabase(db);
    res.status(201).json({ topic: created });
  });

  app.delete('/api/admin/learning/:id', requireAuth, requireAdmin, (req, res) => {
    db.learningTopics = db.learningTopics.filter((t) => t.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  app.post('/api/admin/faqs', requireAuth, requireAdmin, (req, res) => {
    const faq = req.body as FAQItem;
    if (!faq?.question || !faq?.answer) {
      res.status(400).json({ error: 'Question and answer are required.' });
      return;
    }
    const created: FAQItem = { ...faq, id: `faq-${crypto.randomUUID().slice(0, 8)}` };
    db.faqs = [created, ...db.faqs];
    saveDatabase(db);
    res.status(201).json({ faq: created });
  });

  app.delete('/api/admin/faqs/:id', requireAuth, requireAdmin, (req, res) => {
    db.faqs = db.faqs.filter((f) => f.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  app.post('/api/admin/announcements', requireAuth, requireAdmin, (req, res) => {
    const ann = req.body as Announcement;
    if (!ann?.title || !ann?.message) {
      res.status(400).json({ error: 'Title and message are required.' });
      return;
    }
    const created: Announcement = {
      ...ann,
      id: `ann-${crypto.randomUUID().slice(0, 8)}`,
      publishedAt: ann.publishedAt || new Date().toISOString().slice(0, 10),
    };
    db.announcements = [created, ...db.announcements];
    saveDatabase(db);
    res.status(201).json({ announcement: created });
  });

  app.delete('/api/admin/announcements/:id', requireAuth, requireAdmin, (req, res) => {
    db.announcements = db.announcements.filter((a) => a.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // --- SERVER-SIDE GEMINI AI ASSISTANT (MULTI-TURN CHAT, TRANSCRIPTION, LIVE VOICE) ---
  const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    kn: 'Kannada',
    mr: 'Marathi',
    te: 'Telugu',
    ta: 'Tamil',
    bn: 'Bengali',
    gu: 'Gujarati',
  };

  const PERSONA_PROMPTS: Record<string, string> = {
    coach: 'Role: Household Budget Coach — focus on practical monthly cashflow, expense control, emergency funds, and family savings habits.',
    schemes: 'Role: Indian Public Schemes & Tax Guide — explain Central/State schemes, eligibility basics, and Old vs New tax regime rules clearly while reminding users to check official portals.',
    tutor: 'Role: Financial Literacy Tutor — break down compound interest, SIP, EMI, inflation, and banking fundamentals with relatable rupee examples.',
  };

  function buildFinancialSystemInstruction(language?: string, persona?: string, financialContext?: unknown): string {
    const targetLang = LANGUAGE_NAMES[language || 'en'] || 'English';
    const personaNote = PERSONA_PROMPTS[persona || 'coach'] || PERSONA_PROMPTS.coach;
    const contextSection = financialContext
      ? `\n\n[User-Authorized Financial Summary]:\n${JSON.stringify(financialContext, null, 2)}`
      : '\n\n[User-Authorized Financial Summary]: Not shared for this session.';

    return `You are the AI Financial Literacy Assistant inside "Smart Financial Literacy & Budget Planner" for Indian households, students, and families.
${personaNote}
Rules:
1. Respond clearly in ${targetLang} using beginner-friendly, respectful language and Indian Rupees (₹).
2. Explain financial concepts (SIP, EMI, GST, Compound Interest, Emergency Funds, FD vs RD, Old vs New Tax Regime) simply with relatable numbers.
3. NEVER fabricate government scheme rules, deadlines, interest rates, or tax laws. If exact current quarterly rates or deadlines are needed, advise checking official portals (myscheme.gov.in, nsiindia.gov.in, incometax.gov.in).
4. NEVER promise guaranteed returns on market-linked investments or provide personalized SEBI-registered investment/tax filing advice. Always distinguish general financial education from professional advice.
5. If authorized user financial summary JSON is provided below, analyze those exact numbers accurately to answer questions about spending, savings, budgets, and top categories. If not provided, say you do not have access to their personal ledger unless they enable "Share Authorized Budget Summary".${contextSection}`;
  }

  function createGeminiClient(apiKey: string) {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  app.post('/api/ai/chat', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'Gemini AI Assistant is not configured. Add a valid GEMINI_API_KEY in Settings > Secrets to enable AI guidance.',
      });
      return;
    }

    const { message, history, language, financialContext, speedMode, persona } = req.body as {
      message?: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
      language?: string;
      financialContext?: unknown;
      speedMode?: 'general' | 'fast';
      persona?: 'coach' | 'schemes' | 'tutor';
    };

    if (!message?.trim()) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    try {
      const ai = createGeminiClient(apiKey);
      const model = speedMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen';
      const systemInstruction = buildFinancialSystemInstruction(language, persona, financialContext);

      const formattedHistory = Array.isArray(history)
        ? history
            .slice(-12)
            .filter((h) => h.content?.trim())
            .map((h) => ({
              role: h.role === 'user' ? ('user' as const) : ('model' as const),
              parts: [{ text: h.content }],
            }))
        : [];

      const chat = ai.chats.create({
        model,
        history: formattedHistory,
        config: {
          systemInstruction,
        },
      });

      const response = await chat.sendMessage({
        message: message.trim(),
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Gemini returned an empty response. Please try rephrasing your question.' });
        return;
      }

      res.json({ reply, modelUsed: model });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reach Gemini API.';
      res.status(502).json({ error: `AI service error: ${msg}` });
    }
  });

  // --- AUDIO TRANSCRIPTION (gemini-3.5-transcribe) ---
  app.post('/api/ai/transcribe', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'Audio transcription requires a valid GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const { audioBase64, mimeType, language } = req.body as {
      audioBase64?: string;
      mimeType?: string;
      language?: string;
    };

    if (!audioBase64) {
      res.status(400).json({ error: 'Recorded audio payload is required.' });
      return;
    }

    try {
      const ai = createGeminiClient(apiKey);
      const targetLang = LANGUAGE_NAMES[language || 'en'] || 'English';
      const cleanMime = (mimeType || 'audio/webm').split(';')[0].trim() || 'audio/webm';

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: cleanMime,
                data: audioBase64,
              },
            },
            {
              text: `Transcribe this spoken audio accurately into text (primary user language context: ${targetLang}). Preserve all currency amounts, numbers, and financial terms cleanly without extra commentary.`,
            },
          ],
        },
      });

      const transcript = response.text?.trim() || '';
      if (!transcript) {
        res.status(422).json({ error: 'No speech could be transcribed from the recording. Please try speaking closer to the microphone.' });
        return;
      }

      res.json({ transcript });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Audio transcription failed.';
      res.status(502).json({ error: `Transcription error: ${msg}` });
    }
  });

  const server = http.createServer(app);

  // --- VITE / STATIC SERVING ---
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: disableHmr ? false : { server },
        ws: { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // --- REAL-TIME VOICE CONVERSATIONS (gemini-3.8-live Live API) ---
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '/', 'http://localhost').pathname;
    if (pathname === '/api/ai/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (clientWs) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      clientWs.send(JSON.stringify({
        type: 'error',
        error: 'Gemini Live voice requires a valid GEMINI_API_KEY in Settings > Secrets.',
      }));
      clientWs.close();
      return;
    }

    let liveSession: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;
    let isConnecting = false;
    let closedByClient = false;

    const closeSession = () => {
      try {
        liveSession?.close();
      } catch {
        // ignore close errors
      }
      liveSession = null;
    };

    clientWs.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as {
          type?: string;
          data?: string;
          audio?: string;
          language?: string;
          persona?: string;
          voiceName?: string;
          financialContext?: unknown;
        };

        if (msg.type === 'start' && !liveSession && !isConnecting) {
          isConnecting = true;
          const ai = createGeminiClient(apiKey);
          const systemInstruction = `${buildFinancialSystemInstruction(msg.language, msg.persona, msg.financialContext)}\nKeep spoken responses concise, conversational, and easy to follow on mobile audio.`;
          const allowedVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
          const voiceName = allowedVoices.includes(msg.voiceName || '') ? msg.voiceName! : 'Zephyr';

          try {
            liveSession = await ai.live.connect({
              model: 'gemini-3.8-live',
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName } },
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction,
              },
              callbacks: {
                onopen: () => {
                  if (!closedByClient && clientWs.readyState === 1) {
                    clientWs.send(JSON.stringify({ type: 'ready' }));
                  }
                },
                onmessage: (message: LiveServerMessage) => {
                  if (clientWs.readyState !== 1) return;
                  const content = message.serverContent;
                  if (content?.inputTranscription?.text) {
                    clientWs.send(JSON.stringify({ type: 'inputTranscript', text: content.inputTranscription.text }));
                  }
                  if (content?.outputTranscription?.text) {
                    clientWs.send(JSON.stringify({ type: 'outputTranscript', text: content.outputTranscription.text }));
                  }
                  for (const part of content?.modelTurn?.parts ?? []) {
                    if (part.inlineData?.data) {
                      clientWs.send(JSON.stringify({ type: 'audio', data: part.inlineData.data }));
                    }
                  }
                  if (content?.interrupted) {
                    clientWs.send(JSON.stringify({ type: 'interrupted' }));
                  }
                  if (content?.turnComplete) {
                    clientWs.send(JSON.stringify({ type: 'turnComplete' }));
                  }
                },
                onerror: (err) => {
                  if (clientWs.readyState === 1) {
                    clientWs.send(JSON.stringify({
                      type: 'error',
                      error: err instanceof Error ? err.message : 'Gemini Live connection error.',
                    }));
                  }
                },
                onclose: () => {
                  if (!closedByClient && clientWs.readyState === 1) {
                    clientWs.send(JSON.stringify({ type: 'closed' }));
                  }
                },
              },
            });
          } catch (connectErr) {
            const errMsg = connectErr instanceof Error ? connectErr.message : 'Unable to start Gemini Live session.';
            if (clientWs.readyState === 1) {
              clientWs.send(JSON.stringify({ type: 'error', error: errMsg }));
              clientWs.close();
            }
          } finally {
            isConnecting = false;
          }
          return;
        }

        const audioData = msg.data || msg.audio;
        if ((msg.type === 'audio' || audioData) && liveSession && audioData) {
          liveSession.sendRealtimeInput({
            audio: { data: audioData, mimeType: 'audio/pcm;rate=16000' },
          });
          return;
        }

        if (msg.type === 'stop') {
          closedByClient = true;
          closeSession();
          clientWs.close();
        }
      } catch (err) {
        if (clientWs.readyState === 1) {
          clientWs.send(JSON.stringify({
            type: 'error',
            error: err instanceof Error ? err.message : 'Invalid Live session message.',
          }));
        }
      }
    });

    clientWs.on('close', () => {
      closedByClient = true;
      closeSession();
    });
  });

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Financial Literacy & Budget Planner running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
