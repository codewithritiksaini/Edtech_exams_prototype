import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Layers, 
  HelpCircle,
  Hash,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { questionTypeService } from '../../services/questionTypeService.js';

export default function TestQuestionListReview({ questions = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [jumpPage, setJumpPage] = useState(1);

  // Extract unique subjects
  const subjects = useMemo(() => {
    const set = new Set();
    questions.forEach(q => {
      if (q.subject) set.add(q.subject);
    });
    return Array.from(set).sort();
  }, [questions]);

  // Filter questions
  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (subjectFilter !== 'ALL' && (q.subject || '').toLowerCase() !== subjectFilter.toLowerCase()) {
        return false;
      }
      if (difficultyFilter !== 'ALL' && (q.difficulty || '').toLowerCase() !== difficultyFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const text = `${q.id} ${q.stem || q.title || ''} ${q.subject || ''}`.toLowerCase();
        if (!text.includes(term)) return false;
      }
      return true;
    });
  }, [questions, subjectFilter, difficultyFilter, searchTerm]);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filtered.map(q => q.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
            Assembled Examination Roster
          </span>
          <h3 className="text-base font-black text-slate-900 mt-1">
            Question Items Inspection ({questions.length} Total)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by clinical stem or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Subject Filter */}
        <div className="sm:col-span-3">
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="ALL">All Subjects ({questions.length})</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="sm:col-span-3">
          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="ALL">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Question Items List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500">
            No questions match the current filter criteria.
          </div>
        ) : (
          filtered.map((q, idx) => {
            const isExpanded = expandedIds.has(q.id);
            const qDef = questionTypeService.getQuestionTypeById(q.type);
            const diffClass = q.difficulty === 'easy' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : q.difficulty === 'hard' 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div 
                key={q.id}
                className="rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-2xs overflow-hidden"
              >
                {/* Collapsed Header */}
                <div 
                  onClick={() => toggleExpand(q.id)}
                  className="p-4 cursor-pointer flex items-start justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {q.subject || 'General Medicine'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${diffClass}`}>
                          {q.difficulty || 'Medium'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {qDef?.name || q.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                        {q.stem || q.text || q.title || 'No question text provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {q.id}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-3.5 text-xs">
                    {/* Clinical Vignette Full Stem */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                        Full Clinical Stem
                      </span>
                      <p className="text-xs text-slate-900 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                        {q.stem || q.text || q.title}
                      </p>
                    </div>

                    {/* Options list if available */}
                    {Array.isArray(q.options) && q.options.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1.5">
                          Answer Options
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const optLabel = opt.label || String.fromCharCode(65 + optIdx);
                            const optText = typeof opt === 'string' ? opt : (opt.text || opt.title || '');
                            const isCorrect = (q.correctAnswer && (q.correctAnswer === opt.id || q.correctAnswer === optLabel || q.correctAnswer === optText)) || optIdx === 0;

                            return (
                              <div 
                                key={optIdx}
                                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                                  isCorrect 
                                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold shadow-2xs' 
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {optLabel}
                                </span>
                                <span className="flex-1 truncate">{optText}</span>
                                {isCorrect && (
                                  <span className="text-[10px] font-black text-emerald-700 uppercase bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                    Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Explanation Rationale */}
                    {q.explanation && (
                      <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-slate-700">
                        <strong className="text-indigo-900 font-bold block mb-0.5">Clinical Rationale:</strong>
                        <p className="text-[11px] leading-relaxed text-slate-600">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
