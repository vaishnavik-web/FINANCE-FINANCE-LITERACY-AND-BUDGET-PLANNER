import React, { useMemo, useState } from 'react';
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { exportToCSV, exportToExcel, exportToPDF } from '../services/reportExporter';
import { formatMoney, formatShortDate, getCurrentMonthKey, getMonthLabel } from '../utilities/formatters';

type ReportType =
  | 'monthly'
  | 'yearly'
  | 'daily'
  | 'weekly'
  | 'income'
  | 'expenses'
  | 'savings'
  | 'category'
  | 'budget';

export const ReportsPage: React.FC = () => {
  const { store, profile, t } = useApp();
  const currency = profile?.currency || 'INR';
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const reportData = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartIso = weekStart.toISOString().slice(0, 10);

    const monthIncomes = store.incomes.filter((i) => i.date.startsWith(selectedMonth));
    const monthExpenses = store.expenses.filter((e) => e.date.startsWith(selectedMonth));

    const totalMonthInc = monthIncomes.reduce((s, i) => s + i.amount, 0);
    const totalMonthExp = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const monthSav = totalMonthInc - totalMonthExp;
    const savPct = totalMonthInc > 0 ? (monthSav / totalMonthInc) * 100 : 0;

    // 6-month trend for comparison
    const trendMonths = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - idx));
      const key = d.toISOString().slice(0, 7);
      const inc = store.incomes.filter((i) => i.date.startsWith(key)).reduce((s, i) => s + i.amount, 0);
      const exp = store.expenses.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      return {
        label: getMonthLabel(key),
        Income: inc,
        Expenses: exp,
        Savings: inc - exp,
      };
    });

    // Build table & summary according to reportType
    let title = 'Financial Report';
    let subtitle = `Generated on ${formatShortDate(todayIso)}`;
    let headers: string[] = ['Date', 'Type', 'Category', 'Description', 'Method', 'Amount'];
    let rows: (string | number)[][] = [];
    let summaryPairs: { label: string; value: string }[] = [
      { label: 'Selected Month Income', value: formatMoney(totalMonthInc, currency) },
      { label: 'Selected Month Expenses', value: formatMoney(totalMonthExp, currency) },
      { label: 'Net Monthly Savings', value: formatMoney(monthSav, currency) },
      { label: 'Savings Rate', value: `${savPct.toFixed(1)}%` },
    ];

    if (reportType === 'daily') {
      title = `Daily Financial Report (${todayIso})`;
      const dayInc = store.incomes.filter((i) => i.date === todayIso);
      const dayExp = store.expenses.filter((e) => e.date === todayIso);
      rows = [
        ...dayInc.map((i) => [i.date, 'Income', i.category, i.description || '—', i.paymentMethod, formatMoney(i.amount, currency)]),
        ...dayExp.map((e) => [e.date, 'Expense', e.category, e.description || '—', e.paymentMethod, formatMoney(e.amount, currency)]),
      ];
    } else if (reportType === 'weekly') {
      title = `Weekly Financial Report (${weekStartIso} to ${todayIso})`;
      const wInc = store.incomes.filter((i) => i.date >= weekStartIso && i.date <= todayIso);
      const wExp = store.expenses.filter((e) => e.date >= weekStartIso && e.date <= todayIso);
      rows = [
        ...wInc.map((i) => [i.date, 'Income', i.category, i.description || '—', i.paymentMethod, formatMoney(i.amount, currency)]),
        ...wExp.map((e) => [e.date, 'Expense', e.category, e.description || '—', e.paymentMethod, formatMoney(e.amount, currency)]),
      ];
    } else if (reportType === 'monthly') {
      title = `Monthly Financial Report (${getMonthLabel(selectedMonth)})`;
      rows = [
        ...monthIncomes.map((i) => [i.date, 'Income', i.category, i.description || '—', i.paymentMethod, formatMoney(i.amount, currency)]),
        ...monthExpenses.map((e) => [e.date, 'Expense', e.category, e.description || '—', e.paymentMethod, formatMoney(e.amount, currency)]),
      ].sort((a, b) => String(b[0]).localeCompare(String(a[0])));
    } else if (reportType === 'yearly') {
      title = `Yearly Financial Report (${selectedYear})`;
      const yInc = store.incomes.filter((i) => i.date.startsWith(selectedYear));
      const yExp = store.expenses.filter((e) => e.date.startsWith(selectedYear));
      const yIncSum = yInc.reduce((s, i) => s + i.amount, 0);
      const yExpSum = yExp.reduce((s, e) => s + e.amount, 0);
      summaryPairs = [
        { label: `${selectedYear} Total Income`, value: formatMoney(yIncSum, currency) },
        { label: `${selectedYear} Total Expenses`, value: formatMoney(yExpSum, currency) },
        { label: `${selectedYear} Net Savings`, value: formatMoney(yIncSum - yExpSum, currency) },
        { label: 'Annual Savings Rate', value: yIncSum > 0 ? `${(((yIncSum - yExpSum) / yIncSum) * 100).toFixed(1)}%` : '0%' },
      ];
      rows = [
        ...yInc.map((i) => [i.date, 'Income', i.category, i.description || '—', i.paymentMethod, formatMoney(i.amount, currency)]),
        ...yExp.map((e) => [e.date, 'Expense', e.category, e.description || '—', e.paymentMethod, formatMoney(e.amount, currency)]),
      ].sort((a, b) => String(b[0]).localeCompare(String(a[0])));
    } else if (reportType === 'income') {
      title = `Income Report (${getMonthLabel(selectedMonth)})`;
      rows = monthIncomes.map((i) => [i.date, 'Income', i.category, i.description || '—', i.paymentMethod, formatMoney(i.amount, currency)]);
    } else if (reportType === 'expenses') {
      title = `Expense Report (${getMonthLabel(selectedMonth)})`;
      rows = monthExpenses.map((e) => [e.date, 'Expense', e.category, e.description || '—', e.paymentMethod, formatMoney(e.amount, currency)]);
    } else if (reportType === 'savings') {
      title = 'Savings & Goal Progress Report';
      headers = ['Goal Name', 'Category', 'Saved', 'Target', 'Remaining', 'Completion'];
      rows = store.goals.map((g) => {
        const pct = g.targetAmount > 0 ? (g.currentSaved / g.targetAmount) * 100 : 0;
        return [
          g.name,
          g.category,
          formatMoney(g.currentSaved, currency),
          formatMoney(g.targetAmount, currency),
          formatMoney(Math.max(0, g.targetAmount - g.currentSaved), currency),
          `${pct.toFixed(1)}%`,
        ];
      });
    } else if (reportType === 'category') {
      title = `Category-Wise Spending Report (${getMonthLabel(selectedMonth)})`;
      headers = ['Category', 'Transactions', 'Total Spent', 'Share of Month Spend'];
      const map: Record<string, { count: number; total: number }> = {};
      for (const e of monthExpenses) {
        if (!map[e.category]) map[e.category] = { count: 0, total: 0 };
        map[e.category].count += 1;
        map[e.category].total += e.amount;
      }
      rows = Object.entries(map)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([cat, info]) => [
          cat,
          info.count,
          formatMoney(info.total, currency),
          totalMonthExp > 0 ? `${((info.total / totalMonthExp) * 100).toFixed(1)}%` : '0%',
        ]);
    } else if (reportType === 'budget') {
      title = `Budget Performance Report (${getMonthLabel(selectedMonth)})`;
      headers = ['Category', 'Planned Budget', 'Actual Spend', 'Variance', 'Utilization %'];
      const b = store.budgets.find((bg) => bg.month === selectedMonth);
      rows = (b?.categories || []).map((c) => {
        const spent = monthExpenses.filter((e) => e.category === c.category).reduce((s, e) => s + e.amount, 0);
        const variance = c.allocated - spent;
        const pct = c.allocated > 0 ? (spent / c.allocated) * 100 : 0;
        return [
          c.category,
          formatMoney(c.allocated, currency),
          formatMoney(spent, currency),
          `${variance >= 0 ? '+' : '−'}${formatMoney(Math.abs(variance), currency)}`,
          `${pct.toFixed(1)}%`,
        ];
      });
    }

    return { title, subtitle, headers, rows, summaryPairs, trendMonths };
  }, [currency, reportType, selectedMonth, selectedYear, store.budgets, store.expenses, store.goals, store.incomes]);

  const fileSlug = `smartfinance-${reportType}-${selectedMonth}`;

  return (
    <div className="space-y-6">
      {/* Report Type Selector & Export Buttons */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="month"
              aria-label="Report month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
            />
            <input
              type="number"
              aria-label="Report year"
              min="2020"
              max="2035"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => exportToPDF(fileSlug, reportData)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B192C] dark:bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> {t('reports.exportPdf')}
            </button>
            <button
              type="button"
              onClick={() => exportToExcel(fileSlug, reportData)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> {t('reports.exportExcel')}
            </button>
            <button
              type="button"
              onClick={() => exportToCSV(fileSlug, reportData)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-teal-600" /> {t('reports.exportCsv')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {([
            ['daily', 'Daily Report'],
            ['weekly', 'Weekly Report'],
            ['monthly', 'Monthly Report'],
            ['yearly', 'Yearly Report'],
            ['income', 'Income Report'],
            ['expenses', 'Expense Report'],
            ['savings', 'Savings Report'],
            ['category', 'Category Spending'],
            ['budget', 'Budget Performance'],
          ] as [ReportType, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setReportType(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                reportType === key
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportData.summaryPairs.map((p) => (
          <div key={p.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <p className="text-xs text-slate-500">{p.label}</p>
            <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">{p.value}</p>
          </div>
        ))}
      </div>

      {/* Month-to-Month Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Month-to-Month Income vs Expenses</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.trendMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatMoney(Number(v ?? 0), currency)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Income" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#0B192C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Net Monthly Savings Trend</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.trendMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatMoney(Number(v ?? 0), currency)} />
                <Line type="monotone" dataKey="Savings" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{reportData.title}</h3>
          <span className="text-xs text-slate-500">{reportData.rows.length} rows</span>
        </div>
        {reportData.rows.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No entries recorded for this report period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  {reportData.headers.map((h) => (
                    <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    {row.map((cell, cidx) => (
                      <td key={cidx} className="px-4 py-2.5 text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
