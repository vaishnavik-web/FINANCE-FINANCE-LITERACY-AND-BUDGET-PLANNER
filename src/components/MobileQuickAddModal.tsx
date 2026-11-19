import React, { useState } from 'react';
import { X, TrendingDown, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PaymentMethod } from '../types/finance';

interface MobileQuickAddModalProps {
  onClose: () => void;
}

const STANDARD_EXPENSE_CATEGORIES = [
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

const STANDARD_INCOME_CATEGORIES = [
  'Salary',
  'Business income',
  'Freelancing',
  'Scholarship',
  'Pocket money',
  'Rental income',
  'Interest income',
  'Other income',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Bank Transfer',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Auto-Debit',
];

export const MobileQuickAddModal: React.FC<MobileQuickAddModalProps> = ({ onClose }) => {
  const { addExpense, addIncome, profile, setActiveTab } = useApp();
  const [entryType, setEntryType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Food');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const expenseCats = [...STANDARD_EXPENSE_CATEGORIES, ...(profile?.customExpenseCategories || [])];
  const incomeCats = [...STANDARD_INCOME_CATEGORIES, ...(profile?.customIncomeCategories || [])];
  const activeCats = entryType === 'expense' ? expenseCats : incomeCats;

  const switchType = (next: 'expense' | 'income') => {
    setEntryType(next);
    setCategory(next === 'expense' ? expenseCats[0] : incomeCats[0]);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }

    if (entryType === 'expense') {
      addExpense({
        amount: numeric,
        category,
        date,
        paymentMethod,
        description: description.trim() || `${category} expense`,
      });
      setActiveTab('expenses');
    } else {
      addIncome({
        amount: numeric,
        category,
        date,
        paymentMethod,
        description: description.trim() || `${category} income`,
      });
      setActiveTab('income');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-xs">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 p-5 pb-safe shadow-2xl">
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Quick Log Transaction
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick add"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Type Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4">
          <button
            type="button"
            onClick={() => switchType('expense')}
            className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              entryType === 'expense'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <TrendingDown className="w-4 h-4" /> Expense
          </button>
          <button
            type="button"
            onClick={() => switchType('income')}
            className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              entryType === 'income'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Income
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Amount
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="1"
              autoFocus
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-lg font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                {activeCats.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Note (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Milk & veggies"
                className="w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full min-h-[48px] rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-95 cursor-pointer ${
              entryType === 'expense' ? 'bg-[#0B192C] dark:bg-teal-600' : 'bg-emerald-600'
            }`}
          >
            Save {entryType === 'expense' ? 'Expense' : 'Income'}
          </button>
        </form>
      </div>
    </div>
  );
};
