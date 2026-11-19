import React, { useState } from 'react';
import { Lock, Mail, User, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { apiClient } from '../services/apiClient';
import type { LanguageCode } from '../types/finance';

type AuthView = 'login' | 'register' | 'forgot' | 'reset';

interface AuthModalProps {
  initialView?: AuthView;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialView = 'login', onClose }) => {
  const { loginUser, registerUser, enterDemoMode, language, t } = useApp();
  const [view, setView] = useState<AuthView>(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(language);
  const [monthlyIncomeRange, setMonthlyIncomeRange] = useState('');
  const [financialGoalsSummary, setFinancialGoalsSummary] = useState('');
  const [adminInviteCode, setAdminInviteCode] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);

  // Reset states
  const [resetCode, setResetCode] = useState('');
  const [generatedCodePreview, setGeneratedCodePreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginUser(email, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        fullName,
        email,
        password,
        preferredLanguage,
        monthlyIncomeRange,
        financialGoalsSummary,
        adminInviteCode: adminInviteCode.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);
    setLoading(true);
    try {
      const res = await apiClient.forgotPassword(email);
      setGeneratedCodePreview(res.verificationCode);
      setInfoMsg(`${res.message} ${res.deliveryNote}`);
      setView('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.resetPassword({ email, code: resetCode, newPassword });
      setInfoMsg(res.message);
      setPassword('');
      setView('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {view === 'login' && t('auth.signIn')}
              {view === 'register' && t('auth.register')}
              {view === 'forgot' && t('auth.forgotPassword')}
              {view === 'reset' && 'Reset Password'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smart Financial Literacy &amp; Budget Planner
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* View Tabs */}
          {(view === 'login' || view === 'register') && (
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => { setView('login'); setError(null); }}
                className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  view === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t('auth.signIn')}
              </button>
              <button
                type="button"
                onClick={() => { setView('register'); setError(null); }}
                className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  view === 'register'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t('auth.register')}
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {infoMsg && (
            <div className="rounded-lg border border-teal-200 dark:border-teal-900/60 bg-teal-50 dark:bg-teal-950/40 px-3 py-2 text-xs text-teal-800 dark:text-teal-200 space-y-1">
              <p>{infoMsg}</p>
              {generatedCodePreview && (
                <p className="font-mono font-semibold text-sm">Verification Code: {generatedCodePreview}</p>
              )}
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(null); setInfoMsg(null); }}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#0B192C] dark:bg-teal-600 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Signing in...' : t('auth.signIn')}
              </button>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Admin Review Credentials
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@smartfinance.in');
                      setPassword('Admin@2026');
                    }}
                    className="text-teal-600 dark:text-teal-400 font-medium hover:underline cursor-pointer"
                  >
                    Auto-fill Admin
                  </button>
                </div>
                <p className="mt-1 font-mono text-[11px]">admin@smartfinance.in · Admin@2026</p>
              </div>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Priya Deshmukh"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name} ({l.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Income Range (Optional)
                </label>
                <select
                  value={monthlyIncomeRange}
                  onChange={(e) => setMonthlyIncomeRange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="">Prefer not to specify</option>
                  <option value="Under ₹15,000">Under ₹15,000 (Student / Entry)</option>
                  <option value="₹15,000 - ₹35,000">₹15,000 – ₹35,000</option>
                  <option value="₹35,000 - ₹75,000">₹35,000 – ₹75,000</option>
                  <option value="₹75,000 - ₹1,50,000">₹75,000 – ₹1,50,000</option>
                  <option value="Above ₹1,50,000">Above ₹1,50,000</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Financial Goals (Optional)
                </label>
                <input
                  type="text"
                  value={financialGoalsSummary}
                  onChange={(e) => setFinancialGoalsSummary(e.target.value)}
                  placeholder="e.g., Emergency fund, education savings, debt payoff"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowAdminCode((v) => !v)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  {showAdminCode ? 'Hide Admin Invite Code' : 'Have an Administrator Invite Code?'}
                </button>
                {showAdminCode && (
                  <input
                    type="text"
                    value={adminInviteCode}
                    onChange={(e) => setAdminInviteCode(e.target.value)}
                    placeholder="Optional admin invite code"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#0B192C] dark:bg-teal-600 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Creating account...' : t('auth.register')}
              </button>
            </form>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-3.5">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enter your registered email address to generate a one-time password recovery code.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 cursor-pointer"
              >
                {loading ? 'Generating code...' : 'Generate Reset Code'}
              </button>
              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full text-xs text-slate-600 dark:text-slate-400 hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {view === 'reset' && (
            <form onSubmit={handleReset} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">6-Digit Verification Code</label>
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">New Password (min 6 chars)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New strong password"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 cursor-pointer"
              >
                {loading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                enterDemoMode();
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-teal-600/40 bg-teal-50 dark:bg-teal-950/40 py-2.5 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-950/60 transition-colors cursor-pointer"
            >
              {t('auth.tryDemo')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
