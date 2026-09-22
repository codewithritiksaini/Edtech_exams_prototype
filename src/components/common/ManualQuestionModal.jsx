import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon,
  Edit3,
  Sliders,
  Check,
  HelpCircle,
  Stethoscope,
  Info
} from 'lucide-react';
import { questionService } from '../../services/questionService.js';
import { curriculumService } from '../../services/curriculumService.js';
import { 
  QUESTION_TYPES, 
  QUESTION_TYPE_REGISTRY, 
  questionTypeService,
  getQuestionTypeSchema,
  validateQuestionByType 
} from '../../services/questionTypeService.js';

export default function ManualQuestionModal({
  isOpen,
  onClose,
  test = {},
  defaultSubject = '',
  initialQuestion = null,
  onQuestionCreated,
  onQuestionUpdated
}) {
  if (!isOpen) return null;

  const isEditMode = Boolean(initialQuestion && initialQuestion.id);
  const testExamId = test?.examId || test?.examTrack || test?.courseId || 'neet-pg';

  // ---------------------------------------------------------------------------
  // 1. CURRICULUM SCOPE RESOLUTION
  // Filter subjects and chapters strictly to test.curriculumScope if defined
  // ---------------------------------------------------------------------------
  const { scopedSubjects, scopedChaptersMap } = useMemo(() => {
    const allExamSubjects = curriculumService.getSubjects(testExamId) || [];
    const scopeSubjects = test?.curriculumScope?.subjects;

    if (Array.isArray(scopeSubjects) && scopeSubjects.length > 0) {
      const scopeSubjectIdSet = new Set(scopeSubjects.map(s => s.subjectId));
      const filteredSubs = allExamSubjects.filter(s => scopeSubjectIdSet.has(s.id));
      
      const chapterMap = {};
      scopeSubjects.forEach(entry => {
        const allChapters = curriculumService.getChapters(entry.subjectId, testExamId) || [];
        if (Array.isArray(entry.chapterIds) && entry.chapterIds.length > 0) {
          const chIdSet = new Set(entry.chapterIds);
          chapterMap[entry.subjectId] = allChapters.filter(c => chIdSet.has(c.id));
        } else {
          chapterMap[entry.subjectId] = allChapters;
        }
      });

      return {
        scopedSubjects: filteredSubs.length > 0 ? filteredSubs : allExamSubjects,
        scopedChaptersMap: chapterMap
      };
    }

    // Default: all exam subjects
    const chapterMap = {};
    allExamSubjects.forEach(s => {
      chapterMap[s.id] = curriculumService.getChapters(s.id, testExamId) || [];
    });

    return {
      scopedSubjects: allExamSubjects,
      scopedChaptersMap: chapterMap
    };
  }, [testExamId, test?.curriculumScope]);

  // ---------------------------------------------------------------------------
  // 2. FORM STATE INITIALIZATION
  // ---------------------------------------------------------------------------
  const [questionType, setQuestionType] = useState(() => {
    if (initialQuestion?.type) {
      return questionTypeService.normalizeQuestionTypeId(initialQuestion.type) || QUESTION_TYPES.SINGLE_BEST_ANSWER;
    }
    return QUESTION_TYPES.SINGLE_BEST_ANSWER;
  });

  const [prompt, setPrompt] = useState(initialQuestion?.content?.prompt || '');
  const [vignette, setVignette] = useState(initialQuestion?.content?.vignette || '');
  const [mediaUrl, setMediaUrl] = useState(initialQuestion?.content?.mediaUrl || initialQuestion?.mediaUrl || '');

  // Subject state
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    if (initialQuestion?.metadata?.subjectId) return initialQuestion.metadata.subjectId;
    if (initialQuestion?.metadata?.subject) {
      const match = scopedSubjects.find(s => s.name.toLowerCase() === initialQuestion.metadata.subject.toLowerCase());
      if (match) return match.id;
    }
    if (defaultSubject) {
      const match = scopedSubjects.find(s => s.name.toLowerCase() === defaultSubject.toLowerCase() || s.id === defaultSubject);
      if (match) return match.id;
    }
    return scopedSubjects[0]?.id || '';
  });

  // Chapter state
  const availableChapters = useMemo(() => {
    return scopedChaptersMap[selectedSubjectId] || [];
  }, [scopedChaptersMap, selectedSubjectId]);

  const [selectedChapterId, setSelectedChapterId] = useState(() => {
    if (initialQuestion?.metadata?.chapterId) return initialQuestion.metadata.chapterId;
    if (initialQuestion?.metadata?.topic) {
      const match = availableChapters.find(c => c.title?.toLowerCase() === initialQuestion.metadata.topic.toLowerCase());
      if (match) return match.id;
    }
    return availableChapters[0]?.id || '';
  });

  const [marks, setMarks] = useState(initialQuestion?.scoring?.marks ?? 4);
  const [negativeMarks, setNegativeMarks] = useState(initialQuestion?.scoring?.negativeMarks ?? -1);
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');

  // Options & Answers state
  const [options, setOptions] = useState(() => {
    if (initialQuestion?.responseSchema?.options && initialQuestion.responseSchema.options.length > 0) {
      return initialQuestion.responseSchema.options.map((o, idx) => ({
        id: o.id || String.fromCharCode(65 + idx),
        text: o.text || ''
      }));
    }
    return [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' }
    ];
  });

  const [correctAnswers, setCorrectAnswers] = useState(() => {
    if (initialQuestion?.answer?.correct && Array.isArray(initialQuestion.answer.correct)) {
      return initialQuestion.answer.correct;
    }
    return ['A'];
  });

  const [textAnswer, setTextAnswer] = useState(() => {
    if (initialQuestion?.answer?.textAnswer) return initialQuestion.answer.textAnswer;
    if (initialQuestion?.answer?.correct && typeof initialQuestion.answer.correct[0] === 'string') {
      return initialQuestion.answer.correct[0];
    }
    return '';
  });

  const [error, setError] = useState('');

  // ---------------------------------------------------------------------------
  // 3. QUESTION TYPE CHANGE HANDLER
  // ---------------------------------------------------------------------------
  const handleTypeChange = (newType) => {
    setQuestionType(newType);
    setError('');

    const schema = getQuestionTypeSchema(newType);

    if (newType === QUESTION_TYPES.TRUE_FALSE) {
      setOptions([
        { id: 'A', text: 'True' },
        { id: 'B', text: 'False' }
      ]);
      setCorrectAnswers(['A']);
    } else if (newType === QUESTION_TYPES.SHORT_ANSWER) {
      setOptions([]);
    } else if (newType === QUESTION_TYPES.EXTENDED_MATCHING) {
      if (options.length < 5) {
        setOptions([
          { id: 'A', text: options[0]?.text || '' },
          { id: 'B', text: options[1]?.text || '' },
          { id: 'C', text: options[2]?.text || '' },
          { id: 'D', text: options[3]?.text || '' },
          { id: 'E', text: '' }
        ]);
      }
      if (correctAnswers.length === 0) setCorrectAnswers(['A']);
    } else {
      // Normal SBA, MCQ, CLINICAL_CASE, IMAGE_BASED
      if (options.length < 2) {
        setOptions([
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' }
        ]);
      }
      if (correctAnswers.length === 0) setCorrectAnswers(['A']);
    }
  };

  // Option text change
  const handleOptionTextChange = (optId, text) => {
    setOptions(prev => prev.map(o => o.id === optId ? { ...o, text } : o));
  };

  const handleAddOption = () => {
    const schema = getQuestionTypeSchema(questionType);
    if (options.length >= (schema.maxOptions || 6)) return;
    const nextLetter = String.fromCharCode(65 + options.length);
    setOptions(prev => [...prev, { id: nextLetter, text: '' }]);
  };

  const handleRemoveOption = (optId) => {
    const schema = getQuestionTypeSchema(questionType);
    if (options.length <= (schema.minOptions || 2)) return;
    const filtered = options.filter(o => o.id !== optId);
    const reindexed = filtered.map((o, idx) => ({ ...o, id: String.fromCharCode(65 + idx) }));
    setOptions(reindexed);
    setCorrectAnswers(prev => {
      const updated = prev.filter(ansId => reindexed.some(o => o.id === ansId));
      return updated.length > 0 ? updated : ['A'];
    });
  };

  const toggleCorrectAnswer = (optId) => {
    const schema = getQuestionTypeSchema(questionType);
    if (schema.multiSelect) {
      setCorrectAnswers(prev => {
        if (prev.includes(optId)) {
          if (prev.length === 1) return prev; // Keep at least one selected
          return prev.filter(id => id !== optId);
        } else {
          return [...prev, optId];
        }
      });
    } else {
      setCorrectAnswers([optId]);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. SUBMIT HANDLER
  // ---------------------------------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const schema = getQuestionTypeSchema(questionType);
    const selectedSubObj = scopedSubjects.find(s => s.id === selectedSubjectId);
    const selectedChObj = availableChapters.find(c => c.id === selectedChapterId);

    const questionPayload = {
      id: isEditMode ? initialQuestion.id : `q-manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: questionType,
      content: {
        prompt: prompt.trim(),
        vignette: vignette.trim(),
        ...(schema.requiresMedia && mediaUrl.trim() ? { mediaUrl: mediaUrl.trim() } : {})
      },
      responseSchema: {
        options: schema.requiresTextAnswer 
          ? [] 
          : options.map(o => ({ id: o.id, text: o.text.trim() }))
      },
      answer: {
        correct: schema.requiresTextAnswer ? [textAnswer.trim()] : correctAnswers,
        ...(schema.requiresTextAnswer ? { textAnswer: textAnswer.trim() } : {})
      },
      scoring: {
        marks: Number(marks) || 4,
        negativeMarks: Number(negativeMarks) || -1
      },
      metadata: {
        examId: testExamId,
        subjectId: selectedSubObj?.id || selectedSubjectId || null,
        subject: selectedSubObj?.name || 'General Medicine',
        chapterId: selectedChObj?.id || selectedChapterId || null,
        difficulty: initialQuestion?.metadata?.difficulty || 'medium',
        tags: ['Manual Build', 'Phase 4 Authoring', questionType]
      },
      explanation: explanation.trim(),
      status: initialQuestion?.status || 'published',
      createdAt: initialQuestion?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate payload against Question Type Schema
    const valResult = validateQuestionByType(questionPayload);
    if (!valResult.valid) {
      setError(valResult.errors.join(' '));
      return;
    }

    if (isEditMode) {
      const updated = questionService.updateQuestion(initialQuestion.id, questionPayload);
      if (!updated) {
        setError('Failed to update question.');
        return;
      }
      if (onQuestionUpdated) onQuestionUpdated(updated);
    } else {
      const created = questionService.createQuestion(questionPayload);
      if (!created.success) {
        setError(created.errors ? created.errors.join('; ') : 'Failed to create question.');
        return;
      }
      if (onQuestionCreated) onQuestionCreated(created.question);
    }

    onClose();
  };

  const currentSchema = getQuestionTypeSchema(questionType);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-6 p-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isEditMode ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {isEditMode ? 'Edit Question' : 'Add Question Manually'}
                </h3>
                {isEditMode && (
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {initialQuestion.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isEditMode 
                  ? 'Update question stem, type, options, and curriculum metadata.' 
                  : 'Author a new question and attach it directly to this test roster.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form id="manualQuestionForm" onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
          
          {/* 1. TOP-LEVEL QUESTION TYPE SELECTOR */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
            <label className="block text-xs font-bold text-indigo-950 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                Question Type <span className="text-red-500">*</span>
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                Selected inside Question Model
              </span>
            </label>
            <select
              value={questionType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
            >
              {QUESTION_TYPE_REGISTRY.map(qt => (
                <option key={qt.id} value={qt.id}>
                  {qt.name} ({qt.shortName}) — {qt.category}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-indigo-700/80">
              {QUESTION_TYPE_REGISTRY.find(t => t.id === questionType)?.description}
            </p>
          </div>

          {/* 2. CLINICAL VIGNETTE / CASE (Optional or Required for Case) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                Clinical Vignette / Case Scenario
                {questionType === QUESTION_TYPES.CLINICAL_CASE && (
                  <span className="text-amber-600 font-bold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                    Recommended for Clinical Case
                  </span>
                )}
              </label>
              <span className="text-[10px] text-slate-400">Optional context</span>
            </div>
            <textarea
              value={vignette}
              onChange={(e) => setVignette(e.target.value)}
              rows={2}
              placeholder="e.g. A 52-year-old male with long-standing hypertension presents to emergency with acute crushing chest pain radiating to the jaw..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 3. IMAGE / MEDIA URL (for IMAGE_BASED) */}
          {(questionType === QUESTION_TYPES.IMAGE_BASED || currentSchema.requiresMedia) && (
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-1.5">
              <label className="block text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                Image or Diagnostic Specimen URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/radiology/ct-scan-01.jpg"
                className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                required
              />
              <p className="text-[10px] text-rose-700">
                Provide a high-resolution URL for radiographic image, histopathology, or clinical diagram.
              </p>
            </div>
          )}

          {/* 4. QUESTION PROMPT / STEM */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Question Prompt / Lead-In Stem <span className="text-red-500">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. Which of the following is the most appropriate initial pharmacological therapy?"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* 5. RESPONSE SCHEME: OPTIONS OR SHORT ANSWER */}
          {currentSchema.requiresTextAnswer ? (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-amber-950">
                Accepted Answer / Keywords <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="e.g. Aspirin 300mg or Enoxaparin"
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                required
              />
              <p className="text-[10px] text-amber-800">
                Enter the exact correct numerical value, diagnostic keyword, or formula.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  Answer Options
                  <span className="text-slate-400 font-normal">
                    ({currentSchema.multiSelect ? 'Select all correct checkboxes' : 'Click letter badge to mark correct answer'})
                  </span>
                  <span className="text-red-500">*</span>
                </label>
                {currentSchema.allowCustomOptions && options.length < currentSchema.maxOptions && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {options.map((opt) => {
                  const isCorrect = correctAnswers.includes(opt.id);
                  return (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCorrectAnswer(opt.id)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition-all ${
                          isCorrect
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={isCorrect ? 'Marked as correct' : 'Click to mark as correct'}
                      >
                        {isCorrect ? <Check className="w-4 h-4" /> : opt.id}
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        disabled={!currentSchema.allowCustomOptions && questionType === QUESTION_TYPES.TRUE_FALSE}
                        onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                        placeholder={`Option ${opt.id} text...`}
                        className={`flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 ${
                          isCorrect
                            ? 'border-emerald-300 ring-1 ring-emerald-400'
                            : 'border-slate-200 focus:ring-indigo-500'
                        } ${!currentSchema.allowCustomOptions && questionType === QUESTION_TYPES.TRUE_FALSE ? 'opacity-80 font-medium' : ''}`}
                        required
                      />

                      {isCorrect && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 shrink-0">
                          Correct
                        </span>
                      )}

                      {currentSchema.allowCustomOptions && options.length > currentSchema.minOptions && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          title="Remove option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. CLASSIFICATION: SCOPED SUBJECT & CHAPTER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject <span className="text-slate-400 text-[10px] font-normal">(Curriculum Scoped)</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  const newChapters = scopedChaptersMap[e.target.value] || [];
                  setSelectedChapterId(newChapters[0]?.id || '');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {scopedSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chapter / Module</label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {availableChapters.length > 0 ? (
                  availableChapters.map(c => (
                    <option key={c.id} value={c.id}>{c.title || c.name}</option>
                  ))
                ) : (
                  <option value="">All Topics</option>
                )}
              </select>
            </div>
          </div>

          {/* 7. SCORING */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Marks</label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Negative Marks</label>
              <input
                type="number"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 8. EXPLANATION / RATIONALE */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Explanation / High-Yield Rationale (Optional)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              placeholder="Candidate explanation for the correct answer..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Questions persist directly to question bank and test roster.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="manualQuestionForm"
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                isEditMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isEditMode ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isEditMode ? 'Save Changes' : 'Create & Add Question'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
