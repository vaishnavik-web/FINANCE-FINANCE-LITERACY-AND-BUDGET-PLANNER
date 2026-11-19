import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { NotificationPreferences, RecurringBillReminder } from '../types/finance';
import { DEFAULT_EXPENSE_CATEGORIES } from './ExpensesPage';
import { formatMoney } from '../utilities/formatters';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    profile,
    updateProfile,
    setActiveTab,
  } = useApp();

  const currency = profile?.currency || 'INR';
  const prefs = profile?.notificationPreferences;

  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('1500');
  const [billDay, setBillDay] = useState('5');
  const [billCategory, setBillCategory] = useState('Electricity');

  const togglePref = async (key: keyof NotificationPreferences) => {
    if (!prefs) return;
    await updateProfile({
      notificationPreferences: { ...prefs, [key]: !prefs[key] },
    });
  };

  const addBillReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !billTitle.trim()) return;
    const item: RecurringBillReminder = {
      id: `rem-${Date.now()}`,
      title: billTitle.trim(),
      amount: Math.max(0, Number(billAmount) || 0),
      dueDay: Math.min(28, Math.max(1, Number(billDay) || 1)),
      category: billCategory,
      active: true,
    };
    await updateProfile({
      recurringReminders: [...(profile.recurringReminders || []), item],
    });
    setBillTitle('');
  };

  const removeBillReminder = async (id: string) => {
    if (!profile) return;
    await updateProfile({
      recurringReminders: (profile.recurringReminders || []).filter((r) => r.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Notifications Feed */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600" /> Alerts &amp; Reminders ({notifications.length})
            </h2>
            {notifications.some((n) => !n.read) && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No active alerts right now. Budget warnings, goal milestones, and bill reminders appear here automatically.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((n) => {
                const badgeColor =
                  n.severity === 'critical'
                    ? 'text-rose-700 dark:text-rose-400'
                    : n.severity === 'warning'
                      ? 'text-amber-700 dark:text-amber-400'
                      : n.severity === 'success'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-teal-700 dark:text-teal-400';
                return (
                  <div
                    key={n.id}
                    className={`p-4 flex items-start justify-between gap-3 ${
                      n.read ? 'opacity-65' : 'bg-slate-50/60 dark:bg-slate-950/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className={`text-xs font-bold ${badgeColor}`}>{n.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                      {n.actionTab && (
                        <button
                          type="button"
                          onClick={() => {
                            markNotificationRead(n.id);
                            setActiveTab(n.actionTab!);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:underline cursor-pointer pt-1"
                        >
                          Open Section <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        aria-label="Mark as read"
                        className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-teal-600 cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preferences & Recurring Bills */}
        <div className="lg:col-span-5 space-y-6">
          {prefs && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
              <div className="space-y-2.5 text-xs">
                {([
                  ['budgetApproaching', 'Budget limit approaching (80%+)'],
                  ['budgetExceeded', 'Budget limit exceeded (100%+)'],
                  ['savingsMilestones', 'Savings goal progress & completion'],
                  ['monthlySummary', 'Monthly household summary'],
                  ['billReminders', 'Upcoming recurring bill reminders'],
                  ['schemeUpdates', 'Verified government scheme announcements'],
                  ['learningUpdates', 'Financial learning progress nudges'],
                ] as [keyof NotificationPreferences, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between gap-3 py-1 cursor-pointer">
                    <span className="text-slate-700 dark:text-slate-300">{label}</span>
                    <input
                      type="checkbox"
                      checked={prefs[key]}
                      onChange={() => togglePref(key)}
                      className="rounded border-slate-300 text-teal-600"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recurring Bill Reminders</h3>
            <form onSubmit={addBillReminder} className="space-y-2.5 text-xs">
              <input
                type="text"
                required
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                placeholder="Bill name (e.g., Water Bill, House Rent)"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="Amount"
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 font-mono text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  min="1"
                  max="28"
                  required
                  value={billDay}
                  onChange={(e) => setBillDay(e.target.value)}
                  placeholder="Day (1-28)"
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 font-mono text-slate-900 dark:text-white"
                />
                <select
                  value={billCategory}
                  onChange={(e) => setBillCategory(e.target.value)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-slate-900 dark:text-white"
                >
                  {DEFAULT_EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-2 font-semibold text-white hover:bg-teal-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bill Reminder
              </button>
            </form>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {(profile?.recurringReminders || []).map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{r.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Day {r.dueDay} · {formatMoney(r.amount, currency)} · {r.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBillReminder(r.id)}
                    aria-label="Remove reminder"
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
