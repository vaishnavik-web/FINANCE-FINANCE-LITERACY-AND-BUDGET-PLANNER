import React, { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import type { ExpenseRecord, PaymentMethod } from '../types/finance';
import { formatMoney, formatShortDate, getCurrentMonthKey } from '../utilities/formatters';

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Groceries',
  'Education',
  'Transportation',
  'Electricity',
  'Water',
  'House rent',
  'Medical',
  'Shopping',
  'Entertainment',
  'Internet and mobile',
  'Travel',
  'Household expenses',
  'Other expenses',
];

const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Debit Card', 'Cash', 'Credit Card', 'Bank Transfer', 'Net Banking', 'Auto-Debit'];

export const ExpensesPage: React.FC = () => {
  const { store, profile, addExpense, updateExpense, deleteExpense, updateProfile, t } = useApp();
  const currency = profile?.currency || 'INR';

  const allCategories = useMemo(
    () => Array.from(new Set([...DEFAULT_EXPENSE_CATEGORIES, ...(profile?.customExpenseCategories || [])])),
    [profile?.customExpenseCategories]
  );

  // View timeframe: daily, weekly, monthly, or custom
  const [periodMode, setPeriodMode] = useState<'monthly' | 'weekly' | 'daily' | 'all'>('monthly');
  const [monthFilter, setMonthFilter] = useState(getCurrentMonthKey());
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [formError, setFormError] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setAmount('');
    setCategory('Groceries');
    setCustomCategoryInput('');
    setDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setPaymentMethod('UPI');
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (item: ExpenseRecord) => {
    setEditingId(item.id);
    setAmount(String(item.amount));
    setCategory(allCategories.includes(item.category) ? item.category : 'Other expenses');
    setCustomCategoryInput(allCategories.includes(item.category) ? '' : item.category);
    setDate(item.date);
    setDescription(item.description);
    setPaymentMethod(item.paymentMethod);
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = Number(amount);
    if (!Number.isFinite(numAmt) || numAmt <= 0) {
      setFormError('Please enter a valid positive expense amount.');
      return;
    }
    const finalCat = customCategoryInput.trim() || category;
    if (customCategoryInput.trim() && profile && !allCategories.includes(customCategoryInput.trim())) {
      await updateProfile({
        customExpenseCategories: [...(profile.customExpenseCategories || []), customCategoryInput.trim()],
      });
    }
    if (editingId) {
      updateExpense(editingId, { amount: numAmt, category: finalCat, date, description: description.trim(), paymentMethod });
    } else {
      addExpense({ amount: numAmt, category: finalCat, date, description: description.trim(), paymentMethod });
    }
    setShowForm(false);
  };

  const todayIso = new Date().toISOString().slice(0, 10);
  const weekStartIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return store.expenses
      .filter((e) => {
        if (periodMode === 'daily' && e.date !== todayIso) return false;
        if (periodMode === 'weekly' && (e.date < weekStartIso || e.date > todayIso)) return false;
        if (periodMode === 'monthly' && monthFilter && !e.date.startsWith(monthFilter)) return false;
        if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
        if (q && !`${e.category} ${e.description} ${e.paymentMethod} ${e.date}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [categoryFilter, monthFilter, periodMode, searchQuery, store.expenses, todayIso, weekStartIso]);

  const analysis = useMemo(() => {
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const catTotals: Record<string, number> = {};
    for (const e of filtered) {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    }
    const sortedCats = Object.entries(catTotals)
      .map(([name, Amount]) => ({ name, Amount }))
      .sort((a, b) => b.Amount - a.Amount);
    const highest = sortedCats[0] || null;

    // Month-over-Month comparison
    const baseMonth = monthFilter || getCurrentMonthKey();
    const [y, m] = baseMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthTotal = store.expenses.filter((e) => e.date.startsWith(baseMonth)).reduce((s, e) => s + e.amount, 0);
    const prevMonthTotal = store.expenses.filter((e) => e.date.startsWith(prevMonthKey)).reduce((s, e) => s + e.amount, 0);
    const momDiff = currentMonthTotal - prevMonthTotal;
    const momPct = prevMonthTotal > 0 ? (momDiff / prevMonthTotal) * 100 : 0;

    return { total, sortedCats, highest, currentMonthTotal, prevMonthTotal, prevMonthKey, momDiff, momPct };
  }, [filtered, monthFilter, store.expenses]);

  return (
    <div className="space-y-6">
      {/* Top Action & Period Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          {(['daily', 'weekly', 'monthly', 'all'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPeriodMode(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                periodMode === m
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {m === 'all' ? 'All History' : m}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] dark:bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Automatic Expense Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Selected Period Spending</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(analysis.total, currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{filtered.length} transactions</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Highest Spending Category</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white truncate">
            {analysis.highest ? analysis.highest.name : '—'}
          </p>
          <p className="mt-1 font-mono text-xs font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
            {analysis.highest ? formatMoney(analysis.highest.Amount, currency) : 'No data yet'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Month-over-Month Comparison</p>
          <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {analysis.momDiff >= 0 ? '+' : '−'}
            {formatMoney(Math.abs(analysis.momDiff), currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            vs {analysis.prevMonthKey}: {formatMoney(analysis.prevMonthTotal, currency)} ({analysis.momPct >= 0 ? '+' : ''}
            {analysis.momPct.toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <input
          type="month"
          aria-label="Filter by month"
          disabled={periodMode !== 'monthly'}
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white disabled:opacity-50"
        />
        <select
          aria-label="Filter by expense category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
        >
          <option value="All">All Categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Category Analysis Chart */}
      {analysis.sortedCats.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Category-Wise Expense Analysis</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.sortedCats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => formatMoney(Number(val ?? 0), currency)} />
                <Bar dataKey="Amount" fill="#0B192C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Expense History Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            <p>No expenses recorded for this period.</p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-3 rounded-lg bg-[#0B192C] dark:bg-teal-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-500 dark:text-slate-400">
                      {formatShortDate(item.date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{item.category}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {item.description || '—'}
                      {item.pendingSync && (
                        <span className="ml-2 text-[10px] text-amber-600 dark:text-amber-400">({t('common.unsynced')})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.paymentMethod}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                      −{formatMoney(item.amount, currency)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button type="button" onClick={() => openEdit(item)} aria-label="Edit expense" className="p-1.5 text-slate-500 hover:text-teal-600 cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => deleteExpense(item.id)} aria-label="Delete expense" className="p-1.5 text-slate-500 hover:text-rose-600 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              {formError && <p className="text-xs text-rose-600">{formError}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    {allCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Or Add Custom Category (Optional)
                </label>
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="e.g., Pet Care, Festival Gifts"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Weekly vegetables & milk"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
