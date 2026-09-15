import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Copy, 
  Edit3, 
  Eye, 
  Archive, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  FileText,
  X,
  ChevronDown,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { questionService } from '../services/questionService.js';
import { 
  QUESTION_TYPES, 
  QUESTION_TYPE_CONFIG, 
  QUESTION_STATUSES,
  QUESTION_STATUS_LABELS 
} from '../utils/questionTypes.js';
import QuestionStatusBadge from '../components/questions/QuestionStatusBadge.jsx';
import QuestionDifficultyBadge from '../components/questions/QuestionDifficultyBadge.jsx';
import QuestionPreview from '../components/questions/QuestionPreview.jsx';

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/faculty') ? '/faculty' : '/admin';

  // State
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, review: 0, approved: 0, draft: 0, archived: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Reload questions & stats
  const reloadData = () => {
    const list = questionService.getQuestions();
    setQuestions(list);
    setStats(questionService.getSummaryStats());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Compute distinct subjects & topics for filter dropdowns
  const availableSubjects = useMemo(() => {
    const set = new Set();
    questions.forEach(q => {
      if (q.metadata?.subject) set.add(q.metadata.subject);
    });
    return Array.from(set).sort();
  }, [questions]);

  // Filtered and searched list
  const filteredQuestions = useMemo(() => {
    return questionService.searchQuestions({
      search: searchTerm,
      type: filterType,
      subject: filterSubject,
      difficulty: filterDifficulty,
      status: filterStatus
    });
  }, [questions, searchTerm, filterType, filterSubject, filterDifficulty, filterStatus]);

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterSubject !== 'all' || filterDifficulty !== 'all' || filterStatus !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterSubject('all');
    setFilterDifficulty('all');
    setFilterStatus('all');
  };

  // Clone Question Action
  const handleClone = (id) => {
    const res = questionService.cloneQuestion(id);
    if (res.success && res.question) {
      setToastMessage(`Duplicated question as new draft: "${res.question.id}"`);
      reloadData();
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  // Status Change Action
  const handleStatusChange = (id, newStatus) => {
    const updated = questionService.changeQuestionStatus(id, newStatus);
    if (updated) {
      setToastMessage(`Question "${id}" status changed to ${QUESTION_STATUS_LABELS[newStatus] || newStatus}`);
      reloadData();
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Archive Question Action
  const handleArchive = (id) => {
    const updated = questionService.archiveQuestion(id);
    if (updated) {
      setToastMessage(`Question "${id}" moved to Archived.`);
      reloadData();
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Delete Question Action
  const handleDelete = (id) => {
    const deleted = questionService.deleteQuestion(id);
    if (deleted) {
      setToastMessage(`Question "${id}" permanently removed.`);
      setConfirmDeleteId(null);
      reloadData();
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Reset demo questions action
  const handleResetDefaults = () => {
    if (window.confirm('Reset Question Bank to default demo curriculum questions? Any unsaved custom items will be restored to initial fixtures.')) {
      questionService.resetToDefaults();
      setToastMessage('Question Bank reset to default educational demo fixtures.');
      reloadData();
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Assessment Item Bank
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Phase 3 Canonical Architecture
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Create, manage, and reuse standardized assessment questions across mock exams and CBT test suites independently from individual tests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Reload default demo question fixtures"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo Data</span>
          </button>

          <Link
            to={`${basePath}/questions/new`}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Question</span>
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Items</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.total}</p>
          <span className="text-[10px] text-slate-400 font-medium">All formats</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">Published</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-700">{stats.published}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Available for exams</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">Under Review</span>
          <p className="text-xl sm:text-2xl font-black text-amber-700">{stats.review}</p>
          <span className="text-[10px] text-amber-600 font-medium">Peer verification</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">Approved</span>
          <p className="text-xl sm:text-2xl font-black text-blue-700">{stats.approved}</p>
          <span className="text-[10px] text-blue-600 font-medium">Ready to publish</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Drafts</span>
          <p className="text-xl sm:text-2xl font-black text-slate-700">{stats.draft}</p>
          <span className="text-[10px] text-slate-400 font-medium">Work in progress</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600">Archived</span>
          <p className="text-xl sm:text-2xl font-black text-purple-700">{stats.archived}</p>
          <span className="text-[10px] text-purple-600 font-medium">Retired curriculum</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Question ID, prompt, clinical vignette, subject, topic, or tags..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white outline-none"
            >
              <option value="all">All Question Formats</option>
              <option value={QUESTION_TYPES.SINGLE_CHOICE}>Single Best Answer</option>
              <option value={QUESTION_TYPES.MULTIPLE_CHOICE}>Multiple Choice (Multi-Select)</option>
              <option value={QUESTION_TYPES.TRUE_FALSE}>True / False</option>
              <option value={QUESTION_TYPES.SHORT_ANSWER}>Short Answer</option>
              <option value={QUESTION_TYPES.FILL_BLANK}>Fill in the Blank</option>
              <option value={QUESTION_TYPES.MATCHING}>Matching Pairs</option>
            </select>

            {/* Subject Filter */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white outline-none"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white outline-none"
            >
              <option value="all">All Statuses</option>
              <option value={QUESTION_STATUSES.PUBLISHED}>Published</option>
              <option value={QUESTION_STATUSES.REVIEW}>Under Review</option>
              <option value={QUESTION_STATUSES.APPROVED}>Approved</option>
              <option value={QUESTION_STATUSES.DRAFT}>Draft</option>
              <option value={QUESTION_STATUSES.ARCHIVED}>Archived</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{filteredQuestions.length}</strong> of{' '}
            <strong className="text-slate-800">{questions.length}</strong> questions
          </span>
          {hasActiveFilters && (
            <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
              Filtered results active
            </span>
          )}
        </div>
      </div>

      {/* Questions Table / List View */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredQuestions.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-black text-slate-800">No questions found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No questions matched your active search and filter criteria. Try adjusting your query or clear filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer shadow-sm mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6">Question & Prompt</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">Subject / Topic</th>
                  <th className="py-3.5 px-3">Difficulty</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Usage</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredQuestions.map((q) => {
                  const typeConf = QUESTION_TYPE_CONFIG[q.type] || { shortLabel: q.type, badgeClass: 'bg-slate-100 text-slate-700' };
                  const usage = questionService.getQuestionUsage(q.id);
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Col 1: Prompt & ID */}
                      <td className="py-4 px-4 sm:px-6 max-w-sm sm:max-w-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {q.id}
                            </span>
                            {q.content?.vignette && (
                              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                Clinical Stem
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                            {q.content?.prompt || 'Untitled question prompt'}
                          </p>
                          {q.content?.vignette && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                              {q.content.vignette}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Col 2: Type */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeConf.badgeClass}`}>
                          {typeConf.shortLabel}
                        </span>
                      </td>

                      {/* Col 3: Subject & Topic */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{q.metadata?.subject || 'General'}</p>
                          <p className="text-[11px] text-slate-400">{q.metadata?.topic || 'Uncategorized'}</p>
                        </div>
                      </td>

                      {/* Col 4: Difficulty */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <QuestionDifficultyBadge difficulty={q.metadata?.difficulty} />
                      </td>

                      {/* Col 5: Status */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <QuestionStatusBadge status={q.status} />
                      </td>

                      {/* Col 6: Usage */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        {usage.count > 0 ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100"
                            title={`Used in: ${usage.assessments.map(a => a.title).join(', ')}`}
                          >
                            <BookOpen className="w-3 h-3 text-indigo-600" />
                            <span>{usage.count} {usage.count === 1 ? 'Exam' : 'Exams'}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Unassigned</span>
                        )}
                      </td>

                      {/* Col 7: Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewQuestion(q)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Quick Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Full Preview Page Link */}
                          <Link
                            to={`${basePath}/questions/${q.id}/preview`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Open Instructor Audit Preview"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Edit Link */}
                          <Link
                            to={`${basePath}/questions/${q.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Question"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {/* Duplicate / Clone */}
                          <button
                            type="button"
                            onClick={() => handleClone(q.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Duplicate Question"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Status Quick Toggle */}
                          <select
                            value={q.status || QUESTION_STATUSES.DRAFT}
                            onChange={(e) => handleStatusChange(q.id, e.target.value)}
                            className="text-[10px] font-bold py-1 px-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white cursor-pointer outline-none ml-1"
                            title="Quick Change Status"
                          >
                            <option value={QUESTION_STATUSES.DRAFT}>Draft</option>
                            <option value={QUESTION_STATUSES.REVIEW}>Review</option>
                            <option value={QUESTION_STATUSES.APPROVED}>Approved</option>
                            <option value={QUESTION_STATUSES.PUBLISHED}>Published</option>
                            <option value={QUESTION_STATUSES.ARCHIVED}>Archived</option>
                          </select>

                          {/* Delete / Archive */}
                          {q.status === QUESTION_STATUSES.PUBLISHED ? (
                            <button
                              type="button"
                              onClick={() => handleArchive(q.id)}
                              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer ml-1"
                              title="Archive Question"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(q.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Quick Modal Preview
                </span>
                <span className="font-mono text-xs text-slate-400">{previewQuestion.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <QuestionPreview question={previewQuestion} />

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <Link
                to={`${basePath}/questions/${previewQuestion.id}/edit`}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Open in Full Editor
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black text-slate-900">Delete Question?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete question <strong className="font-mono text-slate-900">"{confirmDeleteId}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
