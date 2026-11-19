import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, HelpCircle, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEARNING_CATEGORIES } from '../data/learningData';
import { GLOSSARY_TERMS } from '../data/glossaryAndFaqs';
import type { LearningCategoryId, LearningLevel } from '../types/finance';

export const LearningPage: React.FC = () => {
  const { learningTopics, faqs, store, markTopicCompleted, focusedTopicId, setFocusedTopicId, t } = useApp();

  const [selectedCat, setSelectedCat] = useState<'all' | LearningCategoryId>('all');
  const [selectedLevel, setSelectedLevel] = useState<'All' | LearningLevel>('All');
  const [activeTopicId, setActiveTopicId] = useState<string>(focusedTopicId || learningTopics[0]?.id || '');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (focusedTopicId && learningTopics.some((tp) => tp.id === focusedTopicId)) {
      setActiveTopicId(focusedTopicId);
      setFocusedTopicId(null);
    }
  }, [focusedTopicId, learningTopics, setFocusedTopicId]);

  const filteredTopics = useMemo(() => {
    return learningTopics.filter((tp) => {
      if (selectedCat !== 'all' && tp.categoryId !== selectedCat) return false;
      if (selectedLevel !== 'All' && tp.level !== selectedLevel) return false;
      return true;
    });
  }, [learningTopics, selectedCat, selectedLevel]);

  const activeTopic = useMemo(
    () => filteredTopics.find((tp) => tp.id === activeTopicId) || filteredTopics[0] || null,
    [activeTopicId, filteredTopics]
  );

  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  }, [activeTopic?.id]);

  const progressPct = learningTopics.length > 0
    ? Math.round((store.completedTopicIds.length / learningTopics.length) * 100)
    : 0;

  const handleSubmitQuiz = () => {
    if (!activeTopic) return;
    let correct = 0;
    for (const q of activeTopic.quiz) {
      if (quizAnswers[q.id] === q.correctIndex) correct++;
    }
    const score = activeTopic.quiz.length > 0 ? Math.round((correct / activeTopic.quiz.length) * 100) : 100;
    setQuizSubmitted(true);
    markTopicCompleted(activeTopic.id, score);
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('learn.subtitle')}</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            Learning Progress: {store.completedTopicIds.length} / {learningTopics.length} Topics Completed ({progressPct}%)
          </p>
        </div>
        <div className="w-full sm:w-56">
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Category & Level Filters */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-[#0B192C] dark:bg-teal-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Modules
          </button>
          {LEARNING_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedCat === c.id
                  ? 'bg-[#0B192C] dark:bg-teal-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {c.shortName}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Difficulty:</span>
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Topics List & Lesson Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 max-h-[650px] overflow-y-auto">
          {filteredTopics.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-500">No topics match this filter.</p>
          ) : (
            filteredTopics.map((tp) => {
              const active = activeTopic?.id === tp.id;
              const completed = store.completedTopicIds.includes(tp.id);
              return (
                <button
                  key={tp.id}
                  type="button"
                  onClick={() => setActiveTopicId(tp.id)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer ${
                    active ? 'bg-teal-50 dark:bg-teal-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{tp.level} · {tp.readTimeMinutes} min</span>
                    {completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <p className={`text-sm font-bold mt-0.5 ${active ? 'text-teal-800 dark:text-teal-300' : 'text-slate-900 dark:text-white'}`}>
                    {tp.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{tp.categoryName}</p>
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-8 space-y-5">
          {activeTopic && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  {activeTopic.categoryName} · {activeTopic.level} · {activeTopic.readTimeMinutes} min read
                </p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{activeTopic.title}</h2>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" /> Simple Explanation
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeTopic.simpleExplanation}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Real-Life Indian Example</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{activeTopic.realLifeExample}</p>
              </div>

              {/* Structured Visual Concept Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeTopic.visualDiagramSummary.map((block) => (
                  <div key={block.label} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
                    <p className="text-[11px] font-medium text-slate-500">{block.label}</p>
                    <p className="text-sm font-bold text-teal-700 dark:text-teal-400 mt-0.5">{block.value}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{block.note}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Important Points to Remember</h3>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {activeTopic.importantPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Quiz */}
              {activeTopic.quiz.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-teal-600" /> {t('learn.takeQuiz')}
                    </h3>
                    {store.quizScores[activeTopic.id] !== undefined && (
                      <span className="text-xs font-mono font-semibold text-emerald-600">
                        Best Score: {store.quizScores[activeTopic.id]}%
                      </span>
                    )}
                  </div>

                  {activeTopic.quiz.map((q, qIdx) => (
                    <div key={q.id} className="space-y-2 text-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const picked = quizAnswers[q.id] === optIdx;
                          const isCorrect = optIdx === q.correctIndex;
                          let style = 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800';
                          if (quizSubmitted) {
                            if (isCorrect) style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200';
                            else if (picked && !isCorrect) style = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200';
                          } else if (picked) {
                            style = 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200';
                          }
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={quizSubmitted}
                              onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              className={`text-left rounded-lg border px-3 py-2 transition-colors cursor-pointer ${style}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizSubmitted && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center gap-3">
                    {!quizSubmitted ? (
                      <button
                        type="button"
                        onClick={handleSubmitQuiz}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
                      >
                        Submit Quiz &amp; Mark Complete
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold cursor-pointer"
                      >
                        Retake Quiz
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Glossary & FAQs Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Essential Financial Glossary</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {GLOSSARY_TERMS.map((g) => (
              <div key={g.id} className="py-2.5 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">{g.term}</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{g.shortDef}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-600" /> Frequently Asked Questions
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {faqs.map((faq) => (
              <div key={faq.id} className="py-2.5 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">{faq.question}</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
