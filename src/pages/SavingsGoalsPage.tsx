import React, { useMemo, useState } from 'react';
import { Plus, Target, Trash2, Pencil, X, ArrowUpCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import type { SavingsGoal } from '../types/finance';
import { formatMoney, formatShortDate } from '../utilities/formatters';

const GOAL_CATEGORIES = ['Emergency fund', 'Education savings', 'Laptop purchase', 'Family expenses', 'Travel savings', 'Home down payment', 'Other'];

export const SavingsGoalsPage: React.FC = () => {
  const { store, profile, addGoal, updateGoal, deleteGoal, t } = useApp();
  const currency = profile?.currency || 'INR';

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Emergency fund');
  const [targetAmount, setTargetAmount] = useState('100000');
  const [currentSaved, setCurrentSaved] = useState('10000');
  const [monthlyContribution, setMonthlyContribution] = useState('5000');
  const [targetDate, setTargetDate] = useState('2027-12-31');

  const [topUpGoal, setTopUpGoal] = useState<SavingsGoal | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('2000');

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setCategory('Emergency fund');
    setTargetAmount('100000');
    setCurrentSaved('0');
    setMonthlyContribution('5000');
    setTargetDate('2027-12-31');
    setShowModal(true);
  };

  const openEdit = (g: SavingsGoal) => {
    setEditingId(g.id);
    setName(g.name);
    setCategory(g.category);
    setTargetAmount(String(g.targetAmount));
    setCurrentSaved(String(g.currentSaved));
    setMonthlyContribution(String(g.monthlyContribution));
    setTargetDate(g.targetDate);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tgt = Math.max(1, Number(targetAmount) || 0);
    const cur = Math.max(0, Number(currentSaved) || 0);
    const mon = Math.max(0, Number(monthlyContribution) || 0);
    if (!name.trim()) return;
    if (editingId) {
      updateGoal(editingId, { name: name.trim(), category, targetAmount: tgt, currentSaved: cur, monthlyContribution: mon, targetDate });
    } else {
      addGoal({ name: name.trim(), category, targetAmount: tgt, currentSaved: cur, monthlyContribution: mon, targetDate });
    }
    setShowModal(false);
  };

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpGoal) return;
    const amt = Math.max(0, Number(topUpAmount) || 0);
    updateGoal(topUpGoal.id, { currentSaved: topUpGoal.currentSaved + amt });
    setTopUpGoal(null);
  };

  const summary = useMemo(() => {
    const totalTarget = store.goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved = store.goals.reduce((s, g) => s + g.currentSaved, 0);
    const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const chartData = store.goals.map((g) => ({
      name: g.name.slice(0, 18),
      Saved: g.currentSaved,
      Remaining: Math.max(0, g.targetAmount - g.currentSaved),
    }));
    return { totalTarget, totalSaved, overallPct, chartData };
  }, [store.goals]);

  const estimateCompletion = (g: SavingsGoal) => {
    const rem = Math.max(0, g.targetAmount - g.currentSaved);
    if (rem === 0) return 'Goal Achieved';
    if (g.monthlyContribution <= 0) return 'Set monthly contribution';
    const months = Math.ceil(rem / g.monthlyContribution);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return `${d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} (${months} mo)`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Set household savings goals, record deposits, and track projected completion dates.
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t('goals.newGoal')}
        </button>
      </div>

      {/* Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Total Saved Across Goals</p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatMoney(summary.totalSaved, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Total Target Corpus</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(summary.totalTarget, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Overall Goal Completion</p>
          <p className="mt-1 font-mono text-2xl font-bold text-teal-700 dark:text-teal-400 tabular-nums">
            {summary.overallPct.toFixed(1)}%
          </p>
        </div>
      </div>

      {summary.chartData.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Goal Funding Progress</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => formatMoney(Number(val ?? 0), currency)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Saved" stackId="a" fill="#16A34A" />
                <Bar dataKey="Remaining" stackId="a" fill="#CBD5E1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {store.goals.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-xs text-slate-500">
          <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p>You have not added any savings goals yet.</p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {store.goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(100, (g.currentSaved / g.targetAmount) * 100) : 0;
            const rem = Math.max(0, g.targetAmount - g.currentSaved);
            return (
              <div key={g.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{g.category} · Target {formatShortDate(g.targetDate)}</p>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{g.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(g)} aria-label="Edit goal" className="p-1.5 text-slate-400 hover:text-teal-600 cursor-pointer">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => deleteGoal(g.id)} aria-label="Delete goal" className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5 tabular-nums">
                    <span className="font-mono font-semibold text-teal-700 dark:text-teal-400">
                      {formatMoney(g.currentSaved, currency)} saved
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-300">
                      {pct.toFixed(1)}% of {formatMoney(g.targetAmount, currency)}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <p className="text-slate-500 text-[11px]">Remaining</p>
                    <p className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">{formatMoney(rem, currency)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[11px]">Monthly Plan</p>
                    <p className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">{formatMoney(g.monthlyContribution, currency)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[11px]">Est. Completion</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{estimateCompletion(g)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setTopUpGoal(g); setTopUpAmount('2000'); }}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-teal-600/40 bg-teal-50 dark:bg-teal-950/30 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-950/60 cursor-pointer"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" /> Add Savings Deposit
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Emergency Fund, College Tuition"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    {GOAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date *</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Saved Now (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={currentSaved}
                    onChange={(e) => setCurrentSaved(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit Modal */}
      {topUpGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Deposit to {topUpGoal.name}</h3>
            <form onSubmit={handleTopUp} className="space-y-3">
              <input
                type="number"
                min="1"
                required
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setTopUpGoal(null)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white cursor-pointer">
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
