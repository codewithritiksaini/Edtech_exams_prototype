import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Check, 
  HelpCircle, 
  Tag, 
  Layers, 
  Sparkles, 
  CheckSquare, 
  Square, 
  X,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { questionService } from '../../../services/questionService';
import { curriculumService } from '../../../services/curriculumService';
import { checkQuestionCompatibility } from '../../../services/cbtTestService';
import { Link } from 'react-router-dom';

export default function FacultyQuestionBankPanel({
  test,
  selectedQuestionIds = [],
  onAddQuestion,
  onAddQuestions,
  isLocked = false
}) {
  const testExamId = test.examId || test.examTrack || test.courseId || 'neet-pg';
  const testSubjectId = test.subjectId;

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(testSubjectId && testSubjectId !== 'all' ? testSubjectId : 'all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Multi-select bulk selection state (Set of question IDs)
  const [bulkSelectedIds, setBulkSelectedIds] = useState(new Set());

  // Available subjects for current test's exam
  const examSubjects = useMemo(() => {
    return curriculumService.getSubjects(testExamId) || [];
  }, [testExamId]);

  // Query and scope questions from Question Bank
  const allBankQuestions = useMemo(() => {
    // Get questions matching the exam and accessibility
    const rawList = questionService.getQuestions();

    return rawList.filter(q => {
      // Must pass basic test scope compatibility
      const comp = checkQuestionCompatibility(q, test);
      return comp.compatible;
    });
  }, [test]);

  // Extract unique topics from available questions
  const availableTopics = useMemo(() => {
    const topics = new Set();
    allBankQuestions.forEach(q => {
      const topic = q.metadata?.topic;
      if (topic) topics.add(topic);
    });
    return Array.from(topics).sort();
  }, [allBankQuestions]);

  // Apply UI Filters & Search
  const filteredQuestions = useMemo(() => {
    return allBankQuestions.filter(q => {
      // Subject filter
      if (selectedSubject !== 'all') {
        const qSubId = q.metadata?.subjectId;
        const qSubName = (q.metadata?.subject || '').toLowerCase();
        const testSubObj = curriculumService.getSubjectById(selectedSubject);
        const subName = (testSubObj?.name || '').toLowerCase();

        if (qSubId && qSubId !== selectedSubject) return false;
        if (!qSubId && subName && !subName.includes(qSubName) && !qSubName.includes(selectedSubject.toLowerCase())) {
          return false;
        }
      }

      // Topic filter
      if (selectedTopic !== 'all' && q.metadata?.topic !== selectedTopic) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && q.metadata?.difficulty !== selectedDifficulty) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && q.type !== selectedType) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const id = String(q.id).toLowerCase();
        const prompt = (q.content?.prompt || q.question || '').toLowerCase();
        const vignette = (q.content?.vignette || q.vignette || '').toLowerCase();
        const topic = (q.metadata?.topic || '').toLowerCase();
        const subject = (q.metadata?.subject || '').toLowerCase();

        return id.includes(query) || prompt.includes(query) || vignette.includes(query) || topic.includes(query) || subject.includes(query);
      }

      return true;
    });
  }, [allBankQuestions, selectedSubject, selectedTopic, selectedDifficulty, selectedType, searchQuery]);

  // Visible questions not yet in test (eligible for bulk select)
  const unselectedVisibleQuestions = useMemo(() => {
    const alreadySelectedSet = new Set(selectedQuestionIds.map(String));
    return filteredQuestions.filter(q => !alreadySelectedSet.has(String(q.id)));
  }, [filteredQuestions, selectedQuestionIds]);

  // Bulk Selection Handlers
  const handleSelectAllVisible = () => {
    const next = new Set(bulkSelectedIds);
    unselectedVisibleQuestions.forEach(q => next.add(String(q.id)));
    setBulkSelectedIds(next);
  };

  const handleClearBulkSelection = () => {
    setBulkSelectedIds(new Set());
  };

  const handleToggleBulkItem = (questionId) => {
    const next = new Set(bulkSelectedIds);
    const strId = String(questionId);
    if (next.has(strId)) {
      next.delete(strId);
    } else {
      next.add(strId);
    }
    setBulkSelectedIds(next);
  };

  const handleAddBulkSelected = () => {
    if (bulkSelectedIds.size === 0) return;
    const idsToAdd = Array.from(bulkSelectedIds);
    onAddQuestions(idsToAdd);
    setBulkSelectedIds(new Set());
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject(testSubjectId && testSubjectId !== 'all' ? testSubjectId : 'all');
    setSelectedTopic('all');
    setSelectedDifficulty('all');
    setSelectedType('all');
  };

  const selectedSet = useMemo(() => new Set(selectedQuestionIds.map(String)), [selectedQuestionIds]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Question Bank</h2>
              <p className="text-[11px] text-slate-400">
                Scoped to {test.course || testExamId.toUpperCase()} • {filteredQuestions.length} eligible questions
              </p>
            </div>
          </div>

          <Link
            to={`/faculty/tests/${test.id}/questions/create`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            title="Author a new question for this assessment"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Author New</span>
          </Link>
        </div>

        {/* Search Bar */}
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

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Subject Filter (if test is not single-subject locked) */}
          {!testSubjectId || testSubjectId === 'all' ? (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Subjects</option>
              {examSubjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
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
            <option value="all">All Types</option>
            <option value="single_choice">Single Choice</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="matching">Matching</option>
            <option value="fill_blank">Fill in Blank</option>
            <option value="short_answer">Short Answer</option>
          </select>
        </div>

        {/* Bulk Selection Actions Bar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {!isLocked && (
              <>
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  disabled={unselectedVisibleQuestions.length === 0}
                  className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 disabled:cursor-not-allowed"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Select All Visible ({unselectedVisibleQuestions.length})
                </button>

                {bulkSelectedIds.size > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleClearBulkSelection}
                      className="font-medium text-slate-400 hover:text-slate-600"
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
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 animate-in fade-in"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Selected ({bulkSelectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Questions Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-700">No matching questions found</div>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Try broadening your search query or reset filters to explore all available clinical questions.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const strId = String(q.id);
            const isAlreadyAdded = selectedSet.has(strId);
            const isBulkChecked = bulkSelectedIds.has(strId);

            const prompt = q.content?.prompt || q.question || 'Clinical prompt unavailable';
            const vignette = q.content?.vignette || q.vignette || '';
            const difficulty = q.metadata?.difficulty || 'medium';
            const subject = q.metadata?.subject || 'Medicine';
            const topic = q.metadata?.topic || 'General';
            const type = q.type || 'single_choice';

            const difficultyColors = {
              easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              medium: 'bg-amber-50 text-amber-700 border-amber-200',
              hard: 'bg-rose-50 text-rose-700 border-rose-200'
            };

            return (
              <div 
                key={strId} 
                className={`pt-3 first:pt-0 group transition-all rounded-xl p-3 ${
                  isAlreadyAdded 
                    ? 'bg-slate-50/60 opacity-80 border border-slate-100' 
                    : isBulkChecked 
                      ? 'bg-indigo-50/40 border border-indigo-200/80 shadow-xs' 
                      : 'hover:bg-slate-50/80 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Bulk Checkbox (if not already added and test not locked) */}
                  {!isLocked && !isAlreadyAdded && (
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
                      <span className="font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {strId}
                      </span>
                      <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {subject}
                      </span>
                      <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {topic}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase border ${difficultyColors[difficulty] || difficultyColors.medium}`}>
                        {difficulty}
                      </span>
                      <span className="text-slate-400 capitalize">
                        {type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Vignette snippet if present */}
                    {vignette && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed">
                        "{vignette}"
                      </p>
                    )}

                    {/* Primary Prompt */}
                    <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                      {prompt}
                    </h3>
                  </div>

                  {/* Add / Added CTA */}
                  <div className="shrink-0 pt-0.5">
                    {isAlreadyAdded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <Check className="w-3.5 h-3.5" /> Added
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => onAddQuestion(strId)}
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
