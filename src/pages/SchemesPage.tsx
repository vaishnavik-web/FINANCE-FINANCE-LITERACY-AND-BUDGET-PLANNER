import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, Landmark, CheckCircle2, FileText, Calendar, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { GovernmentScheme } from '../types/finance';

const QUICK_FILTERS = [
  'All',
  'Central Government',
  'State Government',
  'Karnataka Government',
  'Women',
  'Students',
  'Farmers',
  'Senior Citizens',
  'General Public',
] as const;

export const SchemesPage: React.FC = () => {
  const { schemes, focusedSchemeId, setFocusedSchemeId, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(focusedSchemeId || schemes[0]?.id || '');

  useEffect(() => {
    if (focusedSchemeId && schemes.some((s) => s.id === focusedSchemeId)) {
      setSelectedSchemeId(focusedSchemeId);
      setFocusedSchemeId(null);
    }
  }, [focusedSchemeId, schemes, setFocusedSchemeId]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(schemes.map((s) => s.category)))],
    [schemes]
  );

  const filteredSchemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return schemes.filter((s) => {
      if (activeFilter === 'Central Government' && s.level !== 'Central Government') return false;
      if (activeFilter === 'State Government' && s.level === 'Central Government') return false;
      if (activeFilter === 'Karnataka Government' && s.level !== 'Karnataka Government') return false;
      if (
        ['Women', 'Students', 'Farmers', 'Senior Citizens', 'General Public'].includes(activeFilter) &&
        !s.targetAudiences.includes(activeFilter as GovernmentScheme['targetAudiences'][number])
      ) {
        return false;
      }
      if (categoryFilter !== 'All' && s.category !== categoryFilter) return false;
      if (
        q &&
        !`${s.name} ${s.shortCode || ''} ${s.category} ${s.description} ${s.eligibility.join(' ')} ${s.keywords.join(' ')}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [activeFilter, categoryFilter, schemes, searchQuery]);

  const selectedScheme = useMemo(
    () => filteredSchemes.find((s) => s.id === selectedSchemeId) || filteredSchemes[0] || null,
    [filteredSchemes, selectedSchemeId]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('schemes.subtitle')}</p>
        <div className="flex items-center gap-3 text-xs">
          <a href="https://www.myscheme.gov.in/" target="_blank" rel="noopener noreferrer" className="text-teal-700 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1">
            myScheme.gov.in <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer" className="text-teal-700 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1">
            india.gov.in <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Search & Category Select */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, eligibility, benefits, or keywords (e.g., scholarship, Karnataka, pension)..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <select
            aria-label="Filter by scheme category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Scheme Categories' : cat}</option>
            ))}
          </select>
        </div>

        {/* Audience & Level Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === f
                  ? 'bg-[#0B192C] dark:bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 max-h-[680px] overflow-y-auto">
          {filteredSchemes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No government schemes match your filter criteria.
            </div>
          ) : (
            filteredSchemes.map((s) => {
              const active = selectedScheme?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSchemeId(s.id)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer ${
                    active ? 'bg-teal-50 dark:bg-teal-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {s.level} · {s.category}
                  </p>
                  <h3 className={`text-sm font-bold mt-0.5 ${active ? 'text-teal-800 dark:text-teal-300' : 'text-slate-900 dark:text-white'}`}>
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{s.description}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {t('schemes.lastVerified')}: {s.lastVerifiedDate} · {s.targetAudiences.join(', ')}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Detailed Scheme View */}
        <div className="lg:col-span-7">
          {!selectedScheme ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-xs text-slate-500">
              Select a scheme from the list to inspect full eligibility, documents, and official links.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Landmark className="w-3.5 h-3.5 text-teal-600" />
                  <span>{selectedScheme.level}</span>
                  <span>·</span>
                  <span>{selectedScheme.category}</span>
                  <span>·</span>
                  <span>Verified {selectedScheme.lastVerifiedDate}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedScheme.name}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedScheme.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" /> Application Deadline
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{selectedScheme.deadline}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Latest Update</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{selectedScheme.latestUpdate}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Eligibility Criteria</h3>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {selectedScheme.eligibility.map((e, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Key Benefits</h3>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc pl-5">
                    {selectedScheme.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Required Documents</h3>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {selectedScheme.requiredDocuments.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Application Procedure</h3>
                  <ol className="space-y-1 text-slate-600 dark:text-slate-300 list-decimal pl-5">
                    {selectedScheme.applicationProcedure.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-3.5 space-y-1">
                  <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Important Conditions
                  </p>
                  <ul className="list-disc pl-4 text-amber-900/90 dark:text-amber-200/90 space-y-0.5">
                    {selectedScheme.importantConditions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  Target Groups: {selectedScheme.targetAudiences.join(', ')}
                </p>
                <a
                  href={selectedScheme.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] dark:bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
                >
                  {t('schemes.officialSite')} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
