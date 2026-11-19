import React, { useState } from 'react';
import { Save, Download, Trash2, RotateCcw, KeyRound, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { apiClient } from '../services/apiClient';
import { getFirebaseEnvStatus } from '../services/firebaseConfig';
import type { CurrencyCode, LanguageCode } from '../types/finance';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    store,
    mode,
    token,
    language,
    setLanguage,
    theme,
    toggleTheme,
    updateProfile,
    deleteAccount,
    resetDemo,
    setActiveTab,
    t,
  } = useApp();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [incomeRange, setIncomeRange] = useState(profile?.monthlyIncomeRange || '');
  const [goalsSummary, setGoalsSummary] = useState(profile?.financialGoalsSummary || '');
  const [currency, setCurrency] = useState<CurrencyCode>(profile?.currency || 'INR');
  const [privacyShare, setPrivacyShare] = useState(profile?.privacyShareAnalytics || false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);

  const firebaseStatus = getFirebaseEnvStatus();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName: fullName.trim() || profile?.fullName,
      monthlyIncomeRange: incomeRange,
      financialGoalsSummary: goalsSummary,
      currency,
      preferredLanguage: language,
      privacyShareAnalytics: privacyShare,
    });
    setSavedMsg('Profile and financial preferences updated.');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    setPwdErr(null);
    if (!token) return;
    try {
      const res = await apiClient.changePassword(token, { currentPassword, newPassword });
      setPwdMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwdErr(err instanceof Error ? err.message : 'Unable to update password.');
    }
  };

  const handleExportAllJson = () => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      mode,
      profile,
      financialStore: store,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartfinance-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedMsg && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {savedMsg}
        </div>
      )}

      {/* Profile & Preferences */}
      <form onSubmit={handleSaveProfile} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Personal Information &amp; Financial Preferences</h2>
            <p className="text-xs text-slate-500">{profile?.email} · Role: {profile?.role}</p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> {t('common.save')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly Income Range</label>
            <input
              type="text"
              value={incomeRange}
              onChange={(e) => setIncomeRange(e.target.value)}
              placeholder="e.g., ₹35,000 - ₹75,000"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('settings.language')}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('settings.currency')}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
            >
              <option value="INR">INR (₹ Indian Rupee — Default)</option>
              <option value="USD">USD ($ US Dollar — Display Conversion)</option>
              <option value="EUR">EUR (€ Euro — Display Conversion)</option>
              <option value="GBP">GBP (£ Pound — Display Conversion)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Financial Goals</label>
            <input
              type="text"
              value={goalsSummary}
              onChange={(e) => setGoalsSummary(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyShare}
              onChange={(e) => setPrivacyShare(e.target.checked)}
              className="rounded border-slate-300 text-teal-600"
            />
            Allow anonymized aggregate usage analytics (keeps personal records private)
          </label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleTheme} className="text-teal-600 font-semibold hover:underline cursor-pointer">
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
            <button type="button" onClick={() => setActiveTab('budget')} className="text-teal-600 font-semibold hover:underline cursor-pointer">
              Monthly Budget Preferences →
            </button>
          </div>
        </div>
      </form>

      {/* Password Change (Authenticated Users) */}
      {mode === 'authenticated' && (
        <form onSubmit={handlePasswordChange} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-teal-600" /> Change Password
          </h3>
          {pwdMsg && <p className="text-xs text-emerald-600">{pwdMsg}</p>}
          {pwdErr && <p className="text-xs text-rose-600">{pwdErr}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <button type="submit" className="rounded-lg bg-[#0B192C] dark:bg-teal-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer">
            Update Password
          </button>
        </form>
      )}

      {/* Data Export, Backend Status & Account Controls */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Data Portability, Storage Architecture &amp; Account</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {mode === 'demo'
            ? 'Currently running in isolated Guest Demo Mode (localStorage). Registered accounts sync securely to the Node.js API store with salted scrypt password hashing.'
            : 'Your account data is stored privately on the application backend and cached locally for offline PWA access.'}
          {' '}
          {firebaseStatus.configured
            ? `Firebase environment detected (${firebaseStatus.projectId}).`
            : 'External Firebase credentials are not configured; using built-in server persistence + offline PWA cache.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportAllJson}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" /> Export All Personal Data (JSON)
          </button>

          {mode === 'demo' ? (
            <button
              type="button"
              onClick={resetDemo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-800 px-4 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Sample Data
            </button>
          ) : !confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-800 px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={deleteAccount}
                className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Confirm Permanent Deletion
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-slate-500 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
