import React, { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import type { IncomeRecord, PaymentMethod } from '../types/finance';
import { formatMoney, formatShortDate, getCurrentMonthKey } from '../utilities/formatters';

const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Business income',
  'Freelancing',
  'Scholarship',
  'Pocket money',
  'Rental income',
  'Interest income',
  'Other income',
];

const PAYMENT_METHODS: PaymentMethod[] = ['Bank Transfer', 'UPI', 'Cash', 'Debit Card', 'Net Banking', 'Auto-Debit'];

export const IncomePage: React.FC = () => {
  const { store, profile, addIncome, updateIncome, deleteIncome, updateProfile, t } = useApp();
  const currency = profile?.currency || 'INR';

  const allCategories = useMemo(
    () => Array.from(new Set([...DEFAULT_INCOME_CATEGORIES, ...(profile?.customIncomeCategories || [])])),
    [profile?.customIncomeCategories]
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState(getCurrentMonthKey());
  const [exactDate, setExactDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form modal state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [formError, setFormError] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setAmount('');
    setCategory('Salary');
    setCustomCategoryInput('');
    setDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setPaymentMethod('Bank Transfer');
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (item: IncomeRecord) => {
    setEditingId(item.id);
    setAmount(String(item.amount));
    setCategory(allCategories.includes(item.category) ? item.category : 'Other income');
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
      setFormError('Please enter a valid positive income amount.');
      return;
    }
    const finalCat = customCategoryInput.trim() || category;
    if (customCategoryInput.trim() && profile && !allCategories.includes(customCategoryInput.trim())) {
      await updateProfile({
        customIncomeCategories: [...(profile.customIncomeCategories || []), customCategoryInput.trim()],
      });
    }
    if (editingId) {
      updateIncome(editingId, { amount: numAmt, category: finalCat, date, description: description.trim(), paymentMethod });
    } else {
      addIncome({ amount: numAmt, category: finalCat, date, description: description.trim(), paymentMethod });
    }
    setShowForm(false);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return store.incomes
      .filter((i) => {
        if (exactDate && i.date !== exactDate) return false;
        if (!exactDate && monthFilter && !i.date.startsWith(monthFilter)) return false;
        if (categoryFilter !== 'All' && i.category !== categoryFilter) return false;
        if (q && !`${i.category} ${i.description} ${i.paymentMethod} ${i.date}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [categoryFilter, exactDate, monthFilter, searchQuery, store.incomes]);

  const totalFiltered = useMemo(() => filtered.reduce((s, i) => s + i.amount, 0), [filtered]);
  const totalAllTime = useMemo(() => store.incomes.reduce((s, i) => s + i.amount, 0), [store.incomes]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of filtered) {
      map[item.category] = (map[item.category] || 0) + item.amount;
    }
    return Object.entries(map).map(([name, Amount]) => ({ name, Amount }));
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header + Add CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record salary, business, freelancing, scholarships, and custom income sources.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Income
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Filtered Period Income</p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatMoney(totalFiltered, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Recorded Income (All-Time)</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(totalAllTime, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Matching Entries</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {filtered.length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search income description, category, method..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <input
            type="month"
            aria-label="Filter by month"
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setExactDate(''); }}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <input
            type="date"
            aria-label="Filter by exact date"
            value={exactDate}
            onChange={(e) => setExactDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
          >
            <option value="All">All Categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {(monthFilter || exactDate || categoryFilter !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => { setMonthFilter(''); setExactDate(''); setCategoryFilter('All'); setSearchQuery(''); }}
              className="text-xs text-teal-600 font-semibold whitespace-nowrap cursor-pointer"
            >
              All Time
            </button>
          )}
        </div>
      </div>

      {/* Category Breakdown Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Income by Source</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => formatMoney(Number(val ?? 0), currency)} />
                <Bar dataKey="Amount" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Income History Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            <p>No income records match your current filters.</p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
            >
              Log Income Entry
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
                  <th className="px-4 py-3 font-medium">Payment Method</th>
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
                    <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                      +{formatMoney(item.amount, currency)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        aria-label="Edit income"
                        className="p-1.5 text-slate-500 hover:text-teal-600 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteIncome(item.id)}
                        aria-label="Delete income"
                        className="p-1.5 text-slate-500 hover:text-rose-600 cursor-pointer"
                      >
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

      {/* Add/Edit Income Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Income Entry' : 'Add Income Entry'}
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
                  placeholder="e.g., Tuition Classes, Dividend"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., October Salary Credit"
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
