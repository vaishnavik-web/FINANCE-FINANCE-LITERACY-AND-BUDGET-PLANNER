import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, Save, Trash2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import type { CategoryBudget, HouseholdBudget } from '../types/finance';
import { formatMoney, getCurrentMonthKey } from '../utilities/formatters';
import { DEFAULT_EXPENSE_CATEGORIES } from './ExpensesPage';

export const BudgetPlannerPage: React.FC = () => {
  const { store, profile, upsertBudget, t } = useApp();
  const currency = profile?.currency || 'INR';
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const existingBudget = useMemo(
    () => store.budgets.find((b) => b.month === selectedMonth),
    [selectedMonth, store.budgets]
  );

  // Previous month carry-forward calculation
  const previousMonthKey = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);

  const prevMonthCarryForward = useMemo(() => {
    const prevBudget = store.budgets.find((b) => b.month === previousMonthKey);
    if (!prevBudget) return 0;
    const prevSpent = store.expenses
      .filter((e) => e.date.startsWith(previousMonthKey))
      .reduce((s, e) => s + e.amount, 0);
    return Math.max(0, prevBudget.totalMonthlyBudget - prevSpent);
  }, [previousMonthKey, store.budgets, store.expenses]);

  const [totalMonthlyBudget, setTotalMonthlyBudget] = useState(25000);
  const [dailyLimit, setDailyLimit] = useState(1000);
  const [weeklyLimit, setWeeklyLimit] = useState(6500);
  const [carryForwardSavings, setCarryForwardSavings] = useState(true);
  const [categories, setCategories] = useState<CategoryBudget[]>([
    { category: 'Food', allocated: 5000 },
    { category: 'Education', allocated: 4000 },
    { category: 'House rent', allocated: 7000 },
    { category: 'Transportation', allocated: 2000 },
    { category: 'Electricity', allocated: 1500 },
    { category: 'Medical', allocated: 1500 },
    { category: 'Other expenses', allocated: 4000 },
  ]);
  const [newCategoryName, setNewCategoryName] = useState('Groceries');
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (existingBudget) {
      setTotalMonthlyBudget(existingBudget.totalMonthlyBudget);
      setDailyLimit(existingBudget.dailyLimit);
      setWeeklyLimit(existingBudget.weeklyLimit);
      setCarryForwardSavings(existingBudget.carryForwardSavings);
      setCategories(existingBudget.categories);
    }
  }, [existingBudget]);

  // Compute live spending vs budget
  const analysis = useMemo(() => {
    const monthExpenses = store.expenses.filter((e) => e.date.startsWith(selectedMonth));
    const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);

    const todayIso = new Date().toISOString().slice(0, 10);
    const todaySpent = store.expenses.filter((e) => e.date === todayIso).reduce((s, e) => s + e.amount, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoIso = weekAgo.toISOString().slice(0, 10);
    const weeklySpent = store.expenses
      .filter((e) => e.date >= weekAgoIso && e.date <= todayIso)
      .reduce((s, e) => s + e.amount, 0);

    const totalAllocatedCategories = categories.reduce((s, c) => s + (Number(c.allocated) || 0), 0);
    const effectiveBudget = totalMonthlyBudget + (carryForwardSavings ? prevMonthCarryForward : 0);
    const remainingBudget = effectiveBudget - totalSpent;
    const exceededAmount = Math.max(0, totalSpent - effectiveBudget);
    const utilizationPct = effectiveBudget > 0 ? (totalSpent / effectiveBudget) * 100 : 0;

    const categoryRows = categories.map((c) => {
      const actual = monthExpenses
        .filter((e) => e.category === c.category)
        .reduce((s, e) => s + e.amount, 0);
      const pct = c.allocated > 0 ? (actual / c.allocated) * 100 : 0;
      return {
        category: c.category,
        Allocated: c.allocated,
        Actual: actual,
        remaining: c.allocated - actual,
        pct,
      };
    });

    return {
      totalSpent,
      todaySpent,
      weeklySpent,
      totalAllocatedCategories,
      effectiveBudget,
      remainingBudget,
      exceededAmount,
      utilizationPct,
      categoryRows,
    };
  }, [carryForwardSavings, categories, prevMonthCarryForward, selectedMonth, store.expenses, totalMonthlyBudget]);

  const handleSaveBudget = () => {
    const payload: HouseholdBudget = {
      id: existingBudget?.id || `budget-${selectedMonth}`,
      month: selectedMonth,
      totalMonthlyBudget: Math.max(0, Number(totalMonthlyBudget) || 0),
      dailyLimit: Math.max(0, Number(dailyLimit) || 0),
      weeklyLimit: Math.max(0, Number(weeklyLimit) || 0),
      carryForwardSavings,
      carriedForwardAmount: carryForwardSavings ? prevMonthCarryForward : 0,
      categories: categories.map((c) => ({ ...c, allocated: Math.max(0, Number(c.allocated) || 0) })),
      updatedAt: new Date().toISOString(),
    };
    upsertBudget(payload);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const addCategoryRow = () => {
    if (!newCategoryName.trim() || categories.some((c) => c.category === newCategoryName.trim())) return;
    setCategories((prev) => [...prev, { category: newCategoryName.trim(), allocated: 1000 }]);
  };

  const allCategoryOptions = Array.from(
    new Set([...DEFAULT_EXPENSE_CATEGORIES, ...(profile?.customExpenseCategories || [])])
  );

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Budget Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>
        <button
          type="button"
          onClick={handleSaveBudget}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Household Budget
        </button>
      </div>

      {savedBanner && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Household budget saved and synced with your expense tracker.</span>
        </div>
      )}

      {/* Alerts for approaching / exceeding limits */}
      {(analysis.utilizationPct >= 80 ||
        (dailyLimit > 0 && analysis.todaySpent > dailyLimit) ||
        (weeklyLimit > 0 && analysis.weeklySpent > weeklyLimit)) && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs flex items-start gap-2.5 ${
            analysis.exceededAmount > 0
              ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
              : 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {analysis.exceededAmount > 0 ? (
              <p className="font-semibold">
                Monthly budget exceeded by {formatMoney(analysis.exceededAmount, currency)} ({analysis.utilizationPct.toFixed(1)}% utilized).
              </p>
            ) : analysis.utilizationPct >= 80 ? (
              <p className="font-semibold">
                Approaching monthly budget limit: {analysis.utilizationPct.toFixed(1)}% utilized.
              </p>
            ) : null}
            {dailyLimit > 0 && analysis.todaySpent > dailyLimit && (
              <p>Today&apos;s spend ({formatMoney(analysis.todaySpent, currency)}) exceeded daily limit ({formatMoney(dailyLimit, currency)}).</p>
            )}
            {weeklyLimit > 0 && analysis.weeklySpent > weeklyLimit && (
              <p>7-day spend ({formatMoney(analysis.weeklySpent, currency)}) exceeded weekly limit ({formatMoney(weeklyLimit, currency)}).</p>
            )}
          </div>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Effective Monthly Budget</p>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(analysis.effectiveBudget, currency)}
          </p>
          {carryForwardSavings && prevMonthCarryForward > 0 && (
            <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400">
              Includes +{formatMoney(prevMonthCarryForward, currency)} carry-forward
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Category Allocations Sum</p>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(analysis.totalAllocatedCategories, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Total Amount Spent</p>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(analysis.totalSpent, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">{t('budget.remaining')}</p>
          <p
            className={`mt-1 font-mono text-xl font-bold tabular-nums ${
              analysis.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatMoney(analysis.remainingBudget, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">{t('budget.utilized')}</p>
          <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {analysis.utilizationPct.toFixed(1)}%
          </p>
          {analysis.exceededAmount > 0 && (
            <p className="mt-1 text-[11px] text-rose-600 font-semibold">
              Exceeded: {formatMoney(analysis.exceededAmount, currency)}
            </p>
          )}
        </div>
      </div>

      {/* Budget Settings & Category Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Budget Limits &amp; Rules</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Total Monthly Budget (₹)
              </label>
              <input
                type="number"
                min="0"
                value={totalMonthlyBudget}
                onChange={(e) => setTotalMonthlyBudget(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Daily Spending Limit (₹) · Today: {formatMoney(analysis.todaySpent, currency)}
              </label>
              <input
                type="number"
                min="0"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Weekly Spending Limit (₹) · 7-Day: {formatMoney(analysis.weeklySpent, currency)}
              </label>
              <input
                type="number"
                min="0"
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 pt-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={carryForwardSavings}
              onChange={(e) => setCarryForwardSavings(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-teal-600"
            />
            <span>
              Carry forward unspent savings from {previousMonthKey} ({formatMoney(prevMonthCarryForward, currency)})
            </span>
          </label>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Category Allocations</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat, idx) => (
                <div key={cat.category} className="flex items-center gap-2">
                  <span className="text-xs text-slate-700 dark:text-slate-300 flex-1 truncate">{cat.category}</span>
                  <input
                    type="number"
                    min="0"
                    aria-label={`Budget for ${cat.category}`}
                    value={cat.allocated}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, allocated: val } : c)));
                    }}
                    className="w-28 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-right text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setCategories((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label={`Remove ${cat.category}`}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <select
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              >
                {allCategoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCategoryRow}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Planned vs Actual Progress & Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Planned Budget vs Actual Spending</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.categoryRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => formatMoney(Number(val ?? 0), currency)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Allocated" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="#0B192C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Category Utilization Progress</h2>
            <div className="space-y-3.5">
              {analysis.categoryRows.map((row) => {
                const barWidth = Math.min(100, row.pct);
                const statusColor =
                  row.pct > 100 ? 'bg-rose-600' : row.pct >= 80 ? 'bg-amber-500' : 'bg-teal-600';
                return (
                  <div key={row.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{row.category}</span>
                      <span className="font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                        {formatMoney(row.Actual, currency)} / {formatMoney(row.Allocated, currency)} ({row.pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full rounded-full ${statusColor}`} style={{ width: `${barWidth}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 tabular-nums">
                      <span>
                        {row.remaining >= 0
                          ? `Remaining: ${formatMoney(row.remaining, currency)}`
                          : `Exceeded by: ${formatMoney(Math.abs(row.remaining), currency)}`}
                      </span>
                      <span>{row.pct > 100 ? 'Over Limit' : row.pct >= 80 ? 'Approaching Limit' : 'On Track'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
