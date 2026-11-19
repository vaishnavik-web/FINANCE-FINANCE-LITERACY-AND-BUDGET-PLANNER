import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Plus, ArrowUpRight, ArrowDownRight, Target, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMoney, formatShortDate, getCurrentMonthKey, getMonthLabel } from '../utilities/formatters';

const CHART_COLORS = ['#0D9488', '#0B192C', '#16A34A', '#0284C7', '#D97706', '#64748B', '#DC2626', '#14B8A6'];

export const DashboardPage: React.FC = () => {
  const { store, profile, setActiveTab, t } = useApp();
  const currency = profile?.currency || 'INR';
  const currentMonth = getCurrentMonthKey();
  const todayIso = new Date().toISOString().slice(0, 10);

  const metrics = useMemo(() => {
    const monthlyIncomes = store.incomes.filter((i) => i.date.startsWith(currentMonth));
    const monthlyExpenses = store.expenses.filter((e) => e.date.startsWith(currentMonth));

    const monthlyIncomeTotal = monthlyIncomes.reduce((s, i) => s + i.amount, 0);
    const primarySalaryIncome = monthlyIncomes.filter((i) => i.category === 'Salary').reduce((s, i) => s + i.amount, 0);
    const additionalIncome = monthlyIncomeTotal - primarySalaryIncome;

    const monthlyExpenseTotal = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
    const todayExpenseTotal = store.expenses.filter((e) => e.date === todayIso).reduce((s, e) => s + e.amount, 0);

    const allTimeIncome = store.incomes.reduce((s, i) => s + i.amount, 0);
    const allTimeExpenses = store.expenses.reduce((s, e) => s + e.amount, 0);

    const monthlySavings = monthlyIncomeTotal - monthlyExpenseTotal;
    const accumulatedSavings = allTimeIncome - allTimeExpenses;
    const savingsPercent = monthlyIncomeTotal > 0 ? (monthlySavings / monthlyIncomeTotal) * 100 : 0;

    // Category distribution for current month (or all-time if month empty)
    const expSource = monthlyExpenses.length > 0 ? monthlyExpenses : store.expenses;
    const catMap: Record<string, number> = {};
    for (const e of expSource) {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    }
    const categoryPie = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Monthly Income vs Expenses & Savings Growth across last 6 months
    const monthKeys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthKeys.push(d.toISOString().slice(0, 7));
    }

    let runningSavings = 0;
    const monthlySeries = monthKeys.map((m) => {
      const inc = store.incomes.filter((i) => i.date.startsWith(m)).reduce((s, i) => s + i.amount, 0);
      const exp = store.expenses.filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0);
      const sav = inc - exp;
      runningSavings += sav;
      return {
        month: getMonthLabel(m),
        Income: inc,
        Expenses: exp,
        MonthlySavings: sav,
        CumulativeSavings: runningSavings,
      };
    });

    // Weekly spending (last 7 days)
    const weeklySeries = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const total = store.expenses.filter((e) => e.date === iso).reduce((s, e) => s + e.amount, 0);
      return { day: label, Spent: total };
    });

    // Yearly financial overview (grouped by year)
    const yearsSet = new Set<string>([
      ...store.incomes.map((i) => i.date.slice(0, 4)),
      ...store.expenses.map((e) => e.date.slice(0, 4)),
    ]);
    const yearlySeries = Array.from(yearsSet)
      .filter(Boolean)
      .sort()
      .map((yr) => {
        const inc = store.incomes.filter((i) => i.date.startsWith(yr)).reduce((s, i) => s + i.amount, 0);
        const exp = store.expenses.filter((e) => e.date.startsWith(yr)).reduce((s, e) => s + e.amount, 0);
        return { year: yr, Income: inc, Expenses: exp, NetSavings: inc - exp };
      });

    // Combined recent transactions
    const recent = [
      ...store.incomes.map((i) => ({ ...i, kind: 'income' as const })),
      ...store.expenses.map((e) => ({ ...e, kind: 'expense' as const })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8);

    return {
      monthlyIncomeTotal,
      primarySalaryIncome,
      additionalIncome,
      monthlyExpenseTotal,
      todayExpenseTotal,
      monthlySavings,
      accumulatedSavings,
      savingsPercent,
      availableBalance: accumulatedSavings,
      categoryPie,
      monthlySeries,
      weeklySeries,
      yearlySeries,
      recent,
    };
  }, [currentMonth, store.expenses, store.incomes, todayIso]);

  return (
    <div className="space-y-6">
      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active Period: <span className="font-semibold text-slate-800 dark:text-slate-200">{getMonthLabel(currentMonth)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Income
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B192C] dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Expense
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('dash.totalIncome')}</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(metrics.monthlyIncomeTotal, currency)}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Salary: {formatMoney(metrics.primarySalaryIncome, currency)} · Other: {formatMoney(metrics.additionalIncome, currency)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('dash.totalExpenses')}</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(metrics.monthlyExpenseTotal, currency)}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Today: {formatMoney(metrics.todayExpenseTotal, currency)} · Categories: {metrics.categoryPie.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('dash.totalSavings')}</span>
            <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
              {metrics.savingsPercent.toFixed(1)}%
            </span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(metrics.monthlySavings, currency)}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Accumulated: {formatMoney(metrics.accumulatedSavings, currency)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('dash.availableBalance')}</span>
            <Wallet className="w-4 h-4 text-teal-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(metrics.availableBalance, currency)}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Cumulative income minus expenses
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Monthly Income vs Expenses (6-Month Trend)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => formatMoney(Number(val ?? 0), currency)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Income" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#0B192C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Expense Distribution
          </h2>
          {metrics.categoryPie.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center text-xs text-slate-500">
              <p>No expense entries logged yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab('expenses')}
                className="mt-2 text-teal-600 font-semibold hover:underline cursor-pointer"
              >
                Log your first expense
              </button>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={metrics.categoryPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {metrics.categoryPie.map((entry, idx) => (
                      <Cell key={entry.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatMoney(Number(val ?? 0), currency)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Savings Growth + Weekly Spending + Yearly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Savings Growth</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => formatMoney(Number(val ?? 0), currency)} />
                <Line type="monotone" dataKey="CumulativeSavings" name="Cumulative Savings" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Weekly Spending (Last 7 Days)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.weeklySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => formatMoney(Number(val ?? 0), currency)} />
                <Bar dataKey="Spent" fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Yearly Financial Overview</h2>
          {metrics.yearlySeries.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500">No yearly records yet.</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.yearlySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => formatMoney(Number(val ?? 0), currency)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Income" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#64748B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="NetSavings" name="Net Savings" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Financial Goals + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-600" /> {t('dash.financialGoals')}
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab('goals')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Manage Goals
            </button>
          </div>

          {store.goals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <p>No savings goals created yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab('goals')}
                className="mt-2 text-teal-600 font-semibold hover:underline cursor-pointer"
              >
                Create your first savings goal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {store.goals.slice(0, 4).map((g) => {
                const pct = g.targetAmount > 0 ? Math.min(100, (g.currentSaved / g.targetAmount) * 100) : 0;
                const remaining = Math.max(0, g.targetAmount - g.currentSaved);
                return (
                  <div key={g.id} className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">{g.name}</span>
                      <span className="font-mono font-semibold text-teal-700 dark:text-teal-400 tabular-nums shrink-0">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>Saved: {formatMoney(g.currentSaved, currency)} / {formatMoney(g.targetAmount, currency)}</span>
                      <span>Left: {formatMoney(remaining, currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('dash.recentTransactions')}</h2>
            <div className="flex items-center gap-3 text-xs">
              <button type="button" onClick={() => setActiveTab('income')} className="text-teal-600 font-semibold hover:underline cursor-pointer">
                All Income
              </button>
              <button type="button" onClick={() => setActiveTab('expenses')} className="text-slate-600 dark:text-slate-300 font-semibold hover:underline cursor-pointer">
                All Expenses
              </button>
            </div>
          </div>

          {metrics.recent.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No transactions recorded yet. Add income or an expense to populate your dashboard.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">Description</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {metrics.recent.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
                        {formatShortDate(tx.date)}
                      </td>
                      <td className="py-2.5 text-slate-900 dark:text-white font-medium max-w-[180px] truncate">
                        {tx.description || tx.category}
                        {tx.pendingSync && (
                          <span className="ml-2 text-[10px] text-amber-600 dark:text-amber-400">({t('common.unsynced')})</span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{tx.category}</td>
                      <td
                        className={`py-2.5 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                          tx.kind === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {tx.kind === 'income' ? '+' : '−'}
                        {formatMoney(tx.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
