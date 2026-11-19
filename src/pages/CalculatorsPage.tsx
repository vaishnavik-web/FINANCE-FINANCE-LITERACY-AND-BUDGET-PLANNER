import React, { useEffect, useMemo, useState } from 'react';
import {
  Calculator,
  Search,
  RotateCcw,
  BookmarkCheck,
  History,
  SlidersHorizontal,
  Info,
  Trash2,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  CALCULATORS,
  CALCULATOR_CATEGORIES,
  type CalculatorCategory,
  type CalculatorDefinition,
} from '../calculators/calculatorDefinitions';
import { runCalculator, type CalcResult } from '../calculators/calculatorEngine';
import { DEFAULT_TAX_CONFIG } from '../data/glossaryAndFaqs';
import { formatShortDate } from '../utilities/formatters';

function buildDefaultInputs(calc: CalculatorDefinition): Record<string, string | number> {
  const obj: Record<string, string | number> = {};
  for (const f of calc.fields) {
    obj[f.key] = f.defaultValue;
  }
  return obj;
}

export const CalculatorsPage: React.FC = () => {
  const {
    store,
    saveCalculatorHistory,
    clearCalculatorHistory,
    updateTaxConfig,
    focusedCalculatorId,
    setFocusedCalculatorId,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CalculatorCategory>('All');
  const [activeId, setActiveId] = useState<string>(focusedCalculatorId || CALCULATORS[0].id);
  const [showHistory, setShowHistory] = useState(false);
  const [showTaxConfigModal, setShowTaxConfigModal] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync deep-link from Global Search
  useEffect(() => {
    if (focusedCalculatorId && CALCULATORS.some((c) => c.id === focusedCalculatorId)) {
      setActiveId(focusedCalculatorId);
      setFocusedCalculatorId(null);
    }
  }, [focusedCalculatorId, setFocusedCalculatorId]);

  const activeCalc = useMemo(
    () => CALCULATORS.find((c) => c.id === activeId) || CALCULATORS[0],
    [activeId]
  );

  const [inputs, setInputs] = useState<Record<string, string | number>>(() => buildDefaultInputs(activeCalc));
  const [result, setResult] = useState<CalcResult>(() => runCalculator(activeCalc.id, buildDefaultInputs(activeCalc), store.taxConfig));

  useEffect(() => {
    const defaults = buildDefaultInputs(activeCalc);
    setInputs(defaults);
    setResult(runCalculator(activeCalc.id, defaults, store.taxConfig));
    setSavedNotice(false);
  }, [activeCalc, store.taxConfig]);

  const filteredCalculators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CALCULATORS.filter((c) => {
      if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
      if (q && !`${c.name} ${c.category} ${c.shortDescription} ${c.number}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = runCalculator(activeCalc.id, inputs, store.taxConfig);
    setResult(res);
  };

  const handleReset = () => {
    const defaults = buildDefaultInputs(activeCalc);
    setInputs(defaults);
    setResult(runCalculator(activeCalc.id, defaults, store.taxConfig));
  };

  const handleSaveResult = () => {
    if (!result.valid) return;
    saveCalculatorHistory({
      calculatorId: activeCalc.id,
      calculatorName: activeCalc.name,
      category: activeCalc.category,
      inputs,
      primaryResultLabel: result.primaryLabel,
      primaryResultValue: result.primaryValue,
      summary: result.intermediateSteps[0] || activeCalc.shortDescription,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // Tax config editor local state
  const [taxDraft, setTaxDraft] = useState(store.taxConfig);
  useEffect(() => {
    setTaxDraft(store.taxConfig);
  }, [store.taxConfig]);

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('calc.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTaxConfigModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" /> Tax Rules ({store.taxConfig.financialYear})
          </button>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-teal-600" /> {t('calc.history')} ({store.calculatorHistory.length})
          </button>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-[#0B192C] dark:bg-teal-600 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          All (60)
        </button>
        {CALCULATOR_CATEGORIES.map((cat) => {
          const count = CALCULATORS.filter((c) => c.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0B192C] dark:bg-teal-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Split: Directory List + Active Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Directory */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 60 calculators..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="max-h-[540px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCalculators.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">No calculators match your search.</p>
            ) : (
              filteredCalculators.map((calc) => {
                const isSelected = calc.id === activeCalc.id;
                return (
                  <button
                    key={calc.id}
                    type="button"
                    onClick={() => setActiveId(calc.id)}
                    className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {String(calc.number).padStart(2, '0')}. {calc.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {calc.category} · {calc.shortDescription}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Active Calculator Workspace */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  {activeCalc.category} · Calculator #{activeCalc.number}
                </p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{activeCalc.name}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{activeCalc.shortDescription}</p>
              </div>
              <button
                type="button"
                onClick={handleSaveResult}
                disabled={!result.valid}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-teal-600" />
                {savedNotice ? 'Saved to History' : 'Save Result'}
              </button>
            </div>

            {activeCalc.isInvestmentEstimate && (
              <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Educational estimate only: investment returns are not guaranteed and actual market performance may differ.
                </span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeCalc.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={String(inputs[field.key] ?? field.defaultValue)}
                        onChange={(e) => setInputs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          min={field.min}
                          max={field.max}
                          step={field.step || 'any'}
                          value={inputs[field.key] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInputs((prev) => ({ ...prev, [field.key]: val === '' ? '' : Number(val) }));
                          }}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 pr-12 text-sm font-mono text-slate-900 dark:text-white"
                        />
                        {field.unit && (
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">{field.unit}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] dark:bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white hover:opacity-95 cursor-pointer"
                >
                  <Calculator className="w-4 h-4" /> {t('common.calculate')}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {t('common.reset')}
                </button>
              </div>
            </form>

            {/* Results Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {!result.valid ? (
                <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300">
                  {result.error}
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{result.primaryLabel}</p>
                      <p className="font-mono text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-400 tabular-nums mt-0.5">
                        {result.primaryValue}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {result.summaryItems.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 p-3"
                      >
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.label}</p>
                        <p
                          className={`mt-1 font-mono text-sm font-bold tabular-nums ${
                            item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {result.chartData && result.chartData.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">Visual Breakdown</p>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={result.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="primary" name={result.chartLabels?.primary || 'Primary'} fill="#0D9488" stackId="s" />
                            {result.chartLabels?.secondary && (
                              <Bar dataKey="secondary" name={result.chartLabels.secondary} fill="#0B192C" stackId="s" />
                            )}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {result.tableHeaders && result.tableRows && (
                    <div className="overflow-x-auto max-h-64 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            {result.tableHeaders.map((h) => (
                              <th key={h} className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                          {result.tableRows.map((row, idx) => (
                            <tr key={idx}>
                              {row.map((cell, cidx) => (
                                <td key={cidx} className="px-3 py-2 text-slate-700 dark:text-slate-300">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {result.disclaimer && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">{result.disclaimer}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Formula & Worked Example */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 text-xs">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{t('calc.formula')}</p>
              <p className="mt-1 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300">
                {activeCalc.formulaText}
              </p>
            </div>
            {result.intermediateSteps.length > 0 && (
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Intermediate Calculation Steps</p>
                <ul className="mt-1 space-y-1 text-slate-600 dark:text-slate-300 font-mono">
                  {result.intermediateSteps.map((st, idx) => (
                    <li key={idx}>• {st}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{t('calc.example')}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{activeCalc.exampleText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Calculation History Drawer */}
      {showHistory && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('calc.history')}</h3>
            {store.calculatorHistory.length > 0 && (
              <button
                type="button"
                onClick={clearCalculatorHistory}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            )}
          </div>
          {store.calculatorHistory.length === 0 ? (
            <p className="text-xs text-slate-500">No saved calculations yet. Click &ldquo;Save Result&rdquo; on any calculator.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {store.calculatorHistory.map((h) => (
                <div key={h.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{h.calculatorName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{h.summary}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatShortDate(h.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-500">{h.primaryResultLabel}</p>
                    <p className="font-mono text-sm font-bold text-teal-700 dark:text-teal-400">{h.primaryResultValue}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Configurable Tax Rules Modal */}
      {showTaxConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Configure Indian Income Tax Rules</h3>
              <button type="button" onClick={() => setShowTaxConfigModal(false)} className="p-1 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Tax laws update via annual Union Budgets. Adjust these parameters anytime to match the latest applicable financial year rules.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Financial Year Label</label>
                  <input
                    type="text"
                    value={taxDraft.financialYear}
                    onChange={(e) => setTaxDraft({ ...taxDraft, financialYear: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Assessment Year Label</label>
                  <input
                    type="text"
                    value={taxDraft.assessmentYear}
                    onChange={(e) => setTaxDraft({ ...taxDraft, assessmentYear: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">New Regime Std Deduction (₹)</label>
                  <input
                    type="number"
                    value={taxDraft.newRegimeStandardDeduction}
                    onChange={(e) => setTaxDraft({ ...taxDraft, newRegimeStandardDeduction: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Old Regime Std Deduction (₹)</label>
                  <input
                    type="number"
                    value={taxDraft.oldRegimeStandardDeduction}
                    onChange={(e) => setTaxDraft({ ...taxDraft, oldRegimeStandardDeduction: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">New Regime 87A Rebate Limit (₹)</label>
                  <input
                    type="number"
                    value={taxDraft.newRegimeRebateLimit}
                    onChange={(e) => setTaxDraft({ ...taxDraft, newRegimeRebateLimit: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Health &amp; Edu Cess (%)</label>
                  <input
                    type="number"
                    value={taxDraft.cessRatePercent}
                    onChange={(e) => setTaxDraft({ ...taxDraft, cessRatePercent: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setTaxDraft(DEFAULT_TAX_CONFIG)}
                  className="text-slate-500 hover:underline cursor-pointer"
                >
                  Restore Defaults
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowTaxConfigModal(false)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 font-semibold cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateTaxConfig(taxDraft);
                      setShowTaxConfigModal(false);
                    }}
                    className="rounded-lg bg-teal-600 px-4 py-1.5 font-semibold text-white cursor-pointer"
                  >
                    Apply Tax Rules
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
