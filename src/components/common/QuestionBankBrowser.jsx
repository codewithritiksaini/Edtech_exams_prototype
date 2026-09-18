import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Check, 
  HelpCircle, 
  Tag, 
  Sparkles, 
  CheckSquare, 
  Square, 
  X,
  Eye,
  AlertTriangle,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { questionBankService } from '../../services/questionBankService.js';
import { curriculumService } from '../../services/curriculumService.js';
import { questionTypeService } from '../../services/questionTypeService.js';
import { Link } from 'react-router-dom';

export default function QuestionBankBrowser({
  test,
  selectedQuestionIds = [],
  onAddQuestion,
  onAddQuestions,
  onPreviewQuestion,
  role = 'admin',
  requestingFaculty = null,
  isLocked = false,
  authorLink = null
}) {
  const testExamId = test?.examId || test?.examTrack || test?.courseId || 'neet-pg';
  const testSubjectId = test?.subjectId;

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(
    testSubjectId && testSubjectId !== 'all' ? testSubjectId : 'all'
  );
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Multi-select bulk selection state (Set of question IDs)
  const [bulkSelectedIds, setBulkSelectedIds] = useState(new Set());

  // Available subjects for the test's exam track
  const examSubjects = useMemo(() => {
    return curriculumService.getSubjects(testExamId) || [];
  }, [testExamId]);

  // Allowed question types on this test
  const allowedTestTypes = useMemo(() => {
    return test?.questionTypeConfig?.allowedTypes || [];
  }, [test]);

  // Query and scope questions from Question Bank via questionBankService
  const rawScopedQuestions = useMemo(() => {
    if (!test) return [];
    return questionBankService.getAvailableQuestionsForTest(
      test,
      {},
      role,
      requestingFaculty
    );
  }, [test, role, requestingFaculty]);

  // Extract unique topics for the filter dropdown
  const availableTopics = useMemo(() => {
    const topics = new Set();
    rawScopedQuestions.forEach(q => {
      const t = q.metadata?.topic;
      if (t) topics.add(t);
    });
    return Array.from(topics).sort();
  }, [rawScopedQuestions]);

  // Filter and search questions
  const filteredQuestions = useMemo(() => {
    let list = rawScopedQuestions;

    // Apply Subject Filter
    if (selectedSubject !== 'all') {
      list = list.filter(q => {
        const qSubId = q.metadata?.subjectId || q.subjectId;
        const qSubName = (q.metadata?.subject || '').toLowerCase();
        const subObj = curriculumService.getSubjectById(selectedSubject);
        const subName = (subObj?.name || '').toLowerCase();

        if (qSubId && String(qSubId).toLowerCase() === String(selectedSubject).toLowerCase()) {
          return true;
        }
        if (subName && qSubName && (subName.includes(qSubName) || qSubName.includes(subName))) {
          return true;
        }
        return false;
      });
    }

    // Apply Topic Filter
    if (selectedTopic !== 'all') {
      list = list.filter(q => {
        const t = (q.metadata?.topic || '').toLowerCase();
        return t === selectedTopic.toLowerCase();
      });
    }

    // Apply Difficulty Filter
    if (selectedDifficulty !== 'all') {
      list = list.filter(q => {
        const d = (q.metadata?.difficulty || '').toLowerCase();
        return d === selectedDifficulty.toLowerCase();
      });
    }

    // Apply Question Type Filter
    if (selectedType !== 'all') {
      list = list.filter(q => {
        const normQType = questionTypeService.normalizeQuestionTypeId(q.type);
        const normFilterType = questionTypeService.normalizeQuestionTypeId(selectedType);
        return normQType === normFilterType;
      });
    }

    // Apply Search Query (case-insensitive across prompt, vignette, explanation, tags, options)
    if (searchQuery && searchQuery.trim()) {
      const qClean = searchQuery.toLowerCase().trim();
      list = list.filter(q => {
        if (String(q.id).toLowerCase().includes(qClean)) return true;
        const prompt = (q.content?.prompt || q.question || '').toLowerCase();
        if (prompt.includes(qClean)) return true;
        const vignette = (q.content?.vignette || q.vignette || '').toLowerCase();
        if (vignette.includes(qClean)) return true;
        const subject = (q.metadata?.subject || '').toLowerCase();
        if (subject.includes(qClean)) return true;
        const topic = (q.metadata?.topic || '').toLowerCase();
        if (topic.includes(qClean)) return true;
        const tags = Array.isArray(q.metadata?.tags) ? q.metadata.tags.map(t => String(t).toLowerCase()) : [];
        if (tags.some(t => t.includes(qClean))) return true;
        const options = q.responseSchema?.options || q.options || [];
        if (Array.isArray(options)) {
          for (const opt of options) {
            const optText = (opt.text || opt.label || '').toLowerCase();
            if (optText.includes(qClean)) return true;
          }
        }
        return false;
      });
    }

    return list;
  }, [rawScopedQuestions, selectedSubject, selectedTopic, selectedDifficulty, selectedType, searchQuery]);

  // Selected question IDs Set
  const selectedSet = useMemo(() => {
    return new Set((selectedQuestionIds || []).map(String));
  }, [selectedQuestionIds]);

  // Eligible unselected questions for bulk selection
  const eligibleBulkQuestions = useMemo(() => {
    return filteredQuestions.filter(q => !selectedSet.has(String(q.id)) && q.isCompatible !== false);
  }, [filteredQuestions, selectedSet]);

  // Handlers for Bulk Selection
  const handleSelectAllVisible = () => {
    const next = new Set(bulkSelectedIds);
    eligibleBulkQuestions.forEach(q => next.add(String(q.id)));
    setBulkSelectedIds(next);
  };

  const handleClearBulkSelection = () => {
    setBulkSelectedIds(new Set());
  };

  const handleToggleBulkItem = (id) => {
    const next = new Set(bulkSelectedIds);
    const strId = String(id);
    if (next.has(strId)) {
      next.delete(strId);
    } else {
      next.add(strId);
    }
    setBulkSelectedIds(next);
  };

  const handleAddBulkSelected = () => {
    if (bulkSelectedIds.size === 0 || isLocked) return;
    const idsToAdd = Array.from(bulkSelectedIds);
    if (onAddQuestions) {
      onAddQuestions(idsToAdd);
    } else if (onAddQuestion) {
      idsToAdd.forEach(id => onAddQuestion(id));
    }
    setBulkSelectedIds(new Set());
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject(testSubjectId && testSubjectId !== 'all' ? testSubjectId : 'all');
    setSelectedTopic('all');
    setSelectedDifficulty('all');
    setSelectedType('all');
  };

  const difficultyColors = {
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    hard: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs flex flex-col h-full overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Question Bank Repository</h2>
              <p className="text-[11px] text-slate-400">
                Scoped to {testExamId.toUpperCase()} • {filteredQuestions.length} matching questions
              </p>
            </div>
          </div>

          {authorLink && !isLocked && (
            <Link
              to={authorLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              title="Author a new question"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Author New</span>
            </Link>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by clinical prompt, vignette, ID, or topic..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Composable Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
          {/* Subject Filter */}
          {!testSubjectId || testSubjectId === 'all' ? (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Subjects</option>
              {examSubjects.map(s => {
                const inScope = test?.curriculumScope?.subjects?.some(cs => cs.subjectId === s.id);
                return (
                  <option key={s.id} value={s.id}>
                    {inScope ? `★ ${s.name} (In Scope)` : s.name}
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="px-2.5 py-1.5 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs font-semibold text-indigo-800 truncate">
              {curriculumService.getSubjectById(testSubjectId)?.name || 'Scoped Subject'}
            </div>
          )}

          {/* Topic Filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Topics</option>
            {availableTopics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Question Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Question Types</option>
            <option value="single_choice">Single Choice / SBA</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="extended_matching">Extended Matching (EMQ)</option>
            <option value="clinical_case">Clinical Case</option>
            <option value="image_based">Image / Radiology</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short Answer</option>
            <option value="fill_blank">Fill in Blank</option>
          </select>
        </div>

        {/* Multi-Select Bulk Actions Bar */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {!isLocked && (
              <>
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  disabled={eligibleBulkQuestions.length === 0}
                  className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Select All Visible ({eligibleBulkQuestions.length})
                </button>

                {bulkSelectedIds.size > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleClearBulkSelection}
                      className="font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Clear ({bulkSelectedIds.size})
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {!isLocked && bulkSelectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleAddBulkSelected}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 animate-in fade-in"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Selected ({bulkSelectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Questions Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100 max-h-[600px]">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-700">No matching questions found</div>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Try adjusting your search keywords or resetting filters to browse all available clinical items.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const strId = String(q.id);
            const isAlreadyAdded = selectedSet.has(strId);
            const isBulkChecked = bulkSelectedIds.has(strId);
            const isCompatible = q.isCompatible !== false;
            const compatibilityReason = q.compatibilityReason;

            const prompt = q.content?.prompt || q.question || 'Clinical prompt unavailable';
            const vignette = q.content?.vignette || q.vignette || '';
            const difficulty = (q.metadata?.difficulty || 'medium').toLowerCase();
            const subject = q.metadata?.subject || 'General';
            const topic = q.metadata?.topic || 'General Topic';
            const typeDef = questionTypeService.getQuestionTypeById(q.type);

            return (
              <div 
                key={strId} 
                className={`pt-3 first:pt-0 group transition-all rounded-2xl p-3.5 ${
                  isAlreadyAdded 
                    ? 'bg-slate-50/70 border border-slate-200/80 opacity-80' 
                    : !isCompatible
                      ? 'bg-rose-50/30 border border-rose-100'
                      : isBulkChecked 
                        ? 'bg-indigo-50/50 border border-indigo-200 shadow-2xs' 
                        : 'hover:bg-slate-50/80 border border-slate-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Bulk Checkbox */}
                  {!isLocked && !isAlreadyAdded && isCompatible && (
                    <button
                      type="button"
                      onClick={() => handleToggleBulkItem(strId)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                    >
                      {isBulkChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                      )}
                    </button>
                  )}

                  {/* Question Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {strId}
                      </span>
                      <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {subject}
                      </span>
                      <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {topic}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase border ${difficultyColors[difficulty] || difficultyColors.medium}`}>
                        {difficulty}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-semibold border ${typeDef?.badgeClass || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {typeDef?.shortName || q.type}
                      </span>
                    </div>

                    {/* Incompatible Type Alert */}
                    {!isCompatible && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-medium">{compatibilityReason || 'Question format not permitted by test settings.'}</span>
                      </div>
                    )}

                    {/* Vignette snippet if present */}
                    {vignette && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed">
                        &quot;{vignette}&quot;
                      </p>
                    )}

                    {/* Primary Prompt */}
                    <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                      {prompt}
                    </h3>
                  </div>

                  {/* Actions: Preview & Add */}
                  <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                    {onPreviewQuestion && (
                      <button
                        type="button"
                        onClick={() => onPreviewQuestion(q)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Preview question inspection"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {isAlreadyAdded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <Check className="w-3.5 h-3.5" /> Added
                      </span>
                    ) : !isCompatible ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed">
                        Incompatible
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => onAddQuestion && onAddQuestion(strId)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
