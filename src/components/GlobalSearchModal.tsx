import React, { useMemo, useState } from 'react';
import { Search, X, Calculator, Landmark, BookOpen, Receipt, HelpCircle, BookMarked, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CALCULATORS } from '../calculators/calculatorDefinitions';
import { GLOSSARY_TERMS } from '../data/glossaryAndFaqs';
import { loadRecentSearches, pushRecentSearch } from '../services/offlineSync';
import { formatMoney } from '../utilities/formatters';

interface GlobalSearchModalProps {
  onClose: () => void;
}

type SearchGroup = 'All' | 'Calculators' | 'Schemes' | 'Learning' | 'Transactions' | 'Glossary & FAQs';

interface SearchResultItem {
  id: string;
  group: Exclude<SearchGroup, 'All'>;
  title: string;
  subtitle: string;
  keywords: string;
  onSelect: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose }) => {
  const {
    schemes,
    learningTopics,
    faqs,
    store,
    profile,
    setActiveTab,
    setFocusedCalculatorId,
    setFocusedSchemeId,
    setFocusedTopicId,
  } = useApp();

  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<SearchGroup>('All');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());
  const currency = profile?.currency || 'INR';

  const allItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    for (const calc of CALCULATORS) {
      items.push({
        id: `calc-${calc.id}`,
        group: 'Calculators',
        title: calc.name,
        subtitle: `${calc.category} · ${calc.shortDescription}`,
        keywords: `${calc.name} ${calc.category} ${calc.shortDescription} ${calc.formulaText}`.toLowerCase(),
        onSelect: () => {
          setFocusedCalculatorId(calc.id);
          setActiveTab('calculators');
          onClose();
        },
      });
    }

    for (const s of schemes) {
      items.push({
        id: `scheme-${s.id}`,
        group: 'Schemes',
        title: s.name,
        subtitle: `${s.level} · ${s.category} · ${s.targetAudiences.join(', ')}`,
        keywords: `${s.name} ${s.category} ${s.level} ${s.description} ${s.eligibility.join(' ')} ${s.keywords.join(' ')}`.toLowerCase(),
        onSelect: () => {
          setFocusedSchemeId(s.id);
          setActiveTab('schemes');
          onClose();
        },
      });
    }

    for (const topic of learningTopics) {
      items.push({
        id: `topic-${topic.id}`,
        group: 'Learning',
        title: topic.title,
        subtitle: `${topic.categoryName} · ${topic.level} · ${topic.readTimeMinutes} min`,
        keywords: `${topic.title} ${topic.categoryName} ${topic.level} ${topic.simpleExplanation}`.toLowerCase(),
        onSelect: () => {
          setFocusedTopicId(topic.id);
          setActiveTab('learning');
          onClose();
        },
      });
    }

    for (const inc of store.incomes) {
      items.push({
        id: `inc-${inc.id}`,
        group: 'Transactions',
        title: `Income: ${inc.description || inc.category} (${formatMoney(inc.amount, currency)})`,
        subtitle: `${inc.category} · ${inc.date} · ${inc.paymentMethod}`,
        keywords: `${inc.category} ${inc.description} ${inc.paymentMethod} ${inc.date} income`.toLowerCase(),
        onSelect: () => {
          setActiveTab('income');
          onClose();
        },
      });
    }

    for (const exp of store.expenses) {
      items.push({
        id: `exp-${exp.id}`,
        group: 'Transactions',
        title: `Expense: ${exp.description || exp.category} (${formatMoney(exp.amount, currency)})`,
        subtitle: `${exp.category} · ${exp.date} · ${exp.paymentMethod}`,
        keywords: `${exp.category} ${exp.description} ${exp.paymentMethod} ${exp.date} expense`.toLowerCase(),
        onSelect: () => {
          setActiveTab('expenses');
          onClose();
        },
      });
    }

    for (const term of GLOSSARY_TERMS) {
      items.push({
        id: `term-${term.id}`,
        group: 'Glossary & FAQs',
        title: term.term,
        subtitle: `${term.category} · ${term.shortDef}`,
        keywords: `${term.term} ${term.shortDef} ${term.category}`.toLowerCase(),
        onSelect: () => {
          setActiveTab('learning');
          onClose();
        },
      });
    }

    for (const faq of faqs) {
      items.push({
        id: `faq-${faq.id}`,
        group: 'Glossary & FAQs',
        title: faq.question,
        subtitle: faq.answer,
        keywords: `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase(),
        onSelect: () => {
          setActiveTab('learning');
          onClose();
        },
      });
    }

    return items;
  }, [currency, faqs, learningTopics, onClose, schemes, setActiveTab, setFocusedCalculatorId, setFocusedSchemeId, setFocusedTopicId, store.expenses, store.incomes]);

  const suggestions = ['SIP Calculator', 'Sukanya Samriddhi', 'Karnataka', 'Emergency Fund', 'Income Tax', 'UPI Fraud'];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems
      .filter((item) => {
        if (groupFilter !== 'All' && item.group !== groupFilter) return false;
        if (!q) return true;
        return item.keywords.includes(q) || item.title.toLowerCase().includes(q);
      })
      .slice(0, 30);
  }, [allItems, groupFilter, query]);

  const handleSelectItem = (item: SearchResultItem) => {
    if (query.trim()) {
      setRecentSearches(pushRecentSearch(query));
    }
    item.onSelect();
  };

  const groupIcon = (group: SearchResultItem['group']) => {
    switch (group) {
      case 'Calculators':
        return <Calculator className="w-4 h-4 text-teal-600 shrink-0" />;
      case 'Schemes':
        return <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'Learning':
        return <BookOpen className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'Transactions':
        return <Receipt className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const groups: SearchGroup[] = ['All', 'Calculators', 'Schemes', 'Learning', 'Transactions', 'Glossary & FAQs'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/65 p-4 pt-12 sm:pt-20">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across 60 calculators, government schemes, lessons, transactions, FAQs..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50 dark:bg-slate-950/50">
          {groups.map((grp) => (
            <button
              key={grp}
              type="button"
              onClick={() => setGroupFilter(grp)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                groupFilter === grp
                  ? 'bg-[#0B192C] dark:bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Suggestions & Recent Searches when query is empty */}
        {!query.trim() && (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 space-y-2.5">
            {recentSearches.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Recent Searches</p>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((rs) => (
                    <button
                      key={rs}
                      type="button"
                      onClick={() => setQuery(rs)}
                      className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      {rs}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Popular Lookups</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sg) => (
                  <button
                    key={sg}
                    type="button"
                    onClick={() => setQuery(sg)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 cursor-pointer"
                  >
                    {sg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
          {results.length === 0 ? (
            <div className="p-8 text-center">
              <BookMarked className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No matching results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try keywords like EMI, PPF, Karnataka, Budget, GST, or UPI safety.
              </p>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between gap-3 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">{groupIcon(item.group)}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400">
                  <span>{item.group}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
