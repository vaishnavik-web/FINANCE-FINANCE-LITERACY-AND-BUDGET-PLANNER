import React, { useEffect, useState } from 'react';
import { Shield, Plus, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import type { GovernmentScheme, LearningCategoryId, LearningLevel, SchemeLevel } from '../types/finance';

export const AdminPage: React.FC = () => {
  const { profile, token, mode, schemes, learningTopics, faqs, announcements, refreshPublicContent } = useApp();
  const isServerAdmin = mode === 'authenticated' && profile?.role === 'admin' && Boolean(token);

  const [analytics, setAnalytics] = useState<{
    totalUsers: number;
    totalTransactions: number;
    totalGoals: number;
    schemesCount: number;
    topicsCount: number;
    faqsCount: number;
    announcementsCount: number;
  } | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Add Scheme Form
  const [schemeName, setSchemeName] = useState('');
  const [schemeCategory, setSchemeCategory] = useState('Savings schemes');
  const [schemeLevel, setSchemeLevel] = useState<SchemeLevel>('Central Government');
  const [schemeDesc, setSchemeDesc] = useState('');
  const [schemeUrl, setSchemeUrl] = useState('https://www.myscheme.gov.in/');
  const [schemeVerifiedDate, setSchemeVerifiedDate] = useState(new Date().toISOString().slice(0, 10));
  const [schemeEligibility, setSchemeEligibility] = useState('Indian resident citizens meeting scheme criteria.');

  // Add Topic Form
  const [topicTitle, setTopicTitle] = useState('');
  const [topicCat, setTopicCat] = useState<LearningCategoryId>('basic_knowledge');
  const [topicLevel, setTopicLevel] = useState<LearningLevel>('Beginner');
  const [topicExplain, setTopicExplain] = useState('');

  // Add FAQ & Announcement
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annMsg, setAnnMsg] = useState('');

  useEffect(() => {
    if (isServerAdmin && token) {
      apiClient.adminGetAnalytics(token).then(setAnalytics).catch(() => {});
    }
  }, [isServerAdmin, token]);

  const handleAddScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isServerAdmin || !token) return;
    setErrMsg(null);
    setStatusMsg(null);
    try {
      const payload: Omit<GovernmentScheme, 'id'> = {
        name: schemeName.trim(),
        category: schemeCategory,
        level: schemeLevel,
        targetAudiences: ['General Public'],
        description: schemeDesc.trim(),
        eligibility: [schemeEligibility.trim()],
        requiredDocuments: ['Aadhaar Card', 'Bank Account Passbook'],
        benefits: ['Verify benefit amounts on the official portal.'],
        applicationProcedure: ['Apply through the official portal linked below.'],
        importantConditions: ['Check latest official circular before applying.'],
        deadline: 'Check official portal',
        officialWebsite: schemeUrl.trim(),
        lastVerifiedDate: schemeVerifiedDate,
        latestUpdate: `Verified and published by Admin on ${schemeVerifiedDate}.`,
        keywords: [schemeName.toLowerCase(), schemeCategory.toLowerCase()],
      };
      await apiClient.adminCreateScheme(token, payload);
      await refreshPublicContent();
      setSchemeName('');
      setSchemeDesc('');
      setStatusMsg('Government scheme added and verified.');
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Failed to add scheme.');
    }
  };

  const handleVerifySchemeNow = async (s: GovernmentScheme) => {
    if (!isServerAdmin || !token) return;
    const today = new Date().toISOString().slice(0, 10);
    await apiClient.adminUpdateScheme(token, s.id, {
      lastVerifiedDate: today,
      latestUpdate: `Re-verified against official portal on ${today}.`,
    });
    await refreshPublicContent();
    setStatusMsg(`Updated last-verified date for ${s.name}.`);
  };

  const handleDeleteScheme = async (id: string) => {
    if (!isServerAdmin || !token) return;
    await apiClient.adminDeleteScheme(token, id);
    await refreshPublicContent();
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isServerAdmin || !token) return;
    await apiClient.adminCreateLearningTopic(token, {
      categoryId: topicCat,
      categoryName: topicCat.replace('_', ' '),
      title: topicTitle.trim(),
      level: topicLevel,
      readTimeMinutes: 4,
      simpleExplanation: topicExplain.trim(),
      realLifeExample: 'Practical example added by administrator.',
      visualDiagramSummary: [{ label: 'Key Concept', value: topicLevel, note: topicTitle.trim() }],
      importantPoints: ['Review key formulas in the Financial Calculator Centre.'],
      quiz: [],
    });
    await refreshPublicContent();
    setTopicTitle('');
    setTopicExplain('');
    setStatusMsg('New financial literacy topic published.');
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isServerAdmin || !token) return;
    await apiClient.adminCreateFaq(token, { question: faqQ.trim(), answer: faqA.trim(), category: 'General' });
    await refreshPublicContent();
    setFaqQ('');
    setFaqA('');
    setStatusMsg('FAQ published.');
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isServerAdmin || !token) return;
    await apiClient.adminCreateAnnouncement(token, {
      title: annTitle.trim(),
      message: annMsg.trim(),
      publishedAt: new Date().toISOString().slice(0, 10),
    });
    await refreshPublicContent();
    setAnnTitle('');
    setAnnMsg('');
    setStatusMsg('Announcement published to user notifications.');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-teal-600 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Administrator Content &amp; Verification Panel</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage verified Indian government schemes, educational topics, FAQs, and official announcements.
            </p>
          </div>
        </div>
        {!isServerAdmin && (
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg">
            Read-Only Preview: Sign in as Administrator (admin@smartfinance.in) to modify server records.
          </span>
        )}
      </div>

      {statusMsg && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {statusMsg}
        </div>
      )}
      {errMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">{errMsg}</div>
      )}

      {/* Platform Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Registered Accounts</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {analytics ? analytics.totalUsers : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Synced Transactions</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {analytics ? analytics.totalTransactions : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Verified Schemes</p>
          <p className="mt-1 font-mono text-2xl font-bold text-teal-700 dark:text-teal-400 tabular-nums">
            {schemes.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500">Learning Topics &amp; FAQs</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {learningTopics.length} / {faqs.length}
          </p>
        </div>
      </div>

      {/* Manage Government Schemes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form onSubmit={handleAddScheme} className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Verified Government Scheme</h3>
          <input
            type="text"
            required
            disabled={!isServerAdmin}
            value={schemeName}
            onChange={(e) => setSchemeName(e.target.value)}
            placeholder="Official Scheme Name"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              disabled={!isServerAdmin}
              value={schemeLevel}
              onChange={(e) => setSchemeLevel(e.target.value as SchemeLevel)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 text-slate-900 dark:text-white"
            >
              <option value="Central Government">Central Government</option>
              <option value="State Government">State Government</option>
              <option value="Karnataka Government">Karnataka Government</option>
            </select>
            <input
              type="text"
              disabled={!isServerAdmin}
              value={schemeCategory}
              onChange={(e) => setSchemeCategory(e.target.value)}
              placeholder="Category"
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 text-slate-900 dark:text-white"
            />
          </div>
          <input
            type="url"
            required
            disabled={!isServerAdmin}
            value={schemeUrl}
            onChange={(e) => setSchemeUrl(e.target.value)}
            placeholder="Official Portal URL (https://...gov.in)"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <input
            type="date"
            required
            disabled={!isServerAdmin}
            value={schemeVerifiedDate}
            onChange={(e) => setSchemeVerifiedDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <textarea
            rows={2}
            required
            disabled={!isServerAdmin}
            value={schemeDesc}
            onChange={(e) => setSchemeDesc(e.target.value)}
            placeholder="Accurate summary of scheme benefits..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <input
            type="text"
            required
            disabled={!isServerAdmin}
            value={schemeEligibility}
            onChange={(e) => setSchemeEligibility(e.target.value)}
            placeholder="Key eligibility criteria"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!isServerAdmin}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-2 font-semibold text-white hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Scheme Record
          </button>
        </form>

        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Scheme Verification Registry</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto text-xs">
            {schemes.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Verified: {s.lastVerifiedDate} · {s.officialWebsite}
                  </p>
                </div>
                {isServerAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleVerifySchemeNow(s)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-medium text-teal-700 dark:text-teal-400 hover:bg-slate-100 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Verify Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteScheme(s.id)}
                      aria-label="Delete scheme"
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Learning Topic, FAQ & Announcement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        <form onSubmit={handleAddTopic} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Learning Topic</h3>
          <input
            type="text"
            required
            disabled={!isServerAdmin}
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            placeholder="Topic Title"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              disabled={!isServerAdmin}
              value={topicCat}
              onChange={(e) => setTopicCat(e.target.value as LearningCategoryId)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2"
            >
              <option value="basic_knowledge">Basic Finance</option>
              <option value="saving_budgeting">Saving &amp; Budgeting</option>
              <option value="investment_education">Investment</option>
              <option value="loans_credit">Loans &amp; Credit</option>
              <option value="tax_education">Tax Education</option>
              <option value="financial_safety">Financial Safety</option>
            </select>
            <select
              disabled={!isServerAdmin}
              value={topicLevel}
              onChange={(e) => setTopicLevel(e.target.value as LearningLevel)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <textarea
            rows={3}
            required
            disabled={!isServerAdmin}
            value={topicExplain}
            onChange={(e) => setTopicExplain(e.target.value)}
            placeholder="Beginner-friendly explanation..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!isServerAdmin}
            className="w-full rounded-lg bg-[#0B192C] dark:bg-teal-600 py-2 font-semibold text-white disabled:opacity-50 cursor-pointer"
          >
            Publish Topic
          </button>
        </form>

        <form onSubmit={handleAddFaq} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add FAQ Entry</h3>
          <input
            type="text"
            required
            disabled={!isServerAdmin}
            value={faqQ}
            onChange={(e) => setFaqQ(e.target.value)}
            placeholder="Question"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <textarea
            rows={4}
            required
            disabled={!isServerAdmin}
            value={faqA}
            onChange={(e) => setFaqA(e.target.value)}
            placeholder="Clear factual answer..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!isServerAdmin}
            className="w-full rounded-lg bg-[#0B192C] dark:bg-teal-600 py-2 font-semibold text-white disabled:opacity-50 cursor-pointer"
          >
            Add FAQ
          </button>
        </form>

        <form onSubmit={handleAddAnnouncement} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Publish Announcement</h3>
          <input
            type="text"
            required
            disabled={!isServerAdmin}
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
            placeholder="Announcement Title"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <textarea
            rows={3}
            required
            disabled={!isServerAdmin}
            value={annMsg}
            onChange={(e) => setAnnMsg(e.target.value)}
            placeholder="Verified update message..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!isServerAdmin}
            className="w-full rounded-lg bg-teal-600 py-2 font-semibold text-white disabled:opacity-50 cursor-pointer"
          >
            Publish Announcement
          </button>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 max-h-28 overflow-y-auto">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate text-slate-600 dark:text-slate-300">{a.title}</span>
                {isServerAdmin && (
                  <button
                    type="button"
                    onClick={() => apiClient.adminDeleteAnnouncement(token!, a.id).then(refreshPublicContent)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
