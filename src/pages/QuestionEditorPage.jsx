import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Eye, 
  Sparkles, 
  Layers, 
  FileText, 
  CheckSquare, 
  Check, 
  HelpCircle 
} from 'lucide-react';
import { questionService } from '../services/questionService.js';
import { 
  QUESTION_TYPES, 
  QUESTION_TYPE_CONFIG, 
  QUESTION_STATUSES,
  getDefaultQuestionStructure 
} from '../utils/questionTypes.js';
import { validateQuestionAuthoring } from '../utils/examValidation.js';
import TagInput from '../components/questions/TagInput.jsx';
import QuestionPreview from '../components/questions/QuestionPreview.jsx';

export default function QuestionEditorPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditing = Boolean(questionId);
  const basePath = location.pathname.startsWith('/faculty') ? '/faculty' : '/admin';

  // Core Question State
  const [type, setType] = useState(QUESTION_TYPES.SINGLE_CHOICE);
  const [vignette, setVignette] = useState('');
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' }
  ]);
  const [correctAnswers, setCorrectAnswers] = useState(['A']);
  const [shortAnswers, setShortAnswers] = useState(['']);
  const [fillBlankAnswers, setFillBlankAnswers] = useState(['']);
  const [placeholder, setPlaceholder] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Scoring
  const [marks, setMarks] = useState(5);
  const [negativeMarks, setNegativeMarks] = useState(-1);

  // Metadata
  const [subject, setSubject] = useState('Medicine');
  const [topic, setTopic] = useState('Cardiology');
  const [difficulty, setDifficulty] = useState('medium');
  const [tags, setTags] = useState(['High-Yield']);
  const [status, setStatus] = useState(QUESTION_STATUSES.DRAFT);
  const [explanation, setExplanation] = useState('');

  // UI state
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing question if in edit mode
  useEffect(() => {
    if (isEditing) {
      const q = questionService.getQuestionById(questionId);
      if (q) {
        setType(q.type || QUESTION_TYPES.SINGLE_CHOICE);
        setVignette(q.content?.vignette || '');
        setPrompt(q.content?.prompt || '');
        setStatus(q.status || QUESTION_STATUSES.DRAFT);
        setMarks(q.scoring?.marks ?? 5);
        setNegativeMarks(q.scoring?.negativeMarks ?? -1);
        setSubject(q.metadata?.subject || 'Medicine');
        setTopic(q.metadata?.topic || 'Cardiology');
        setDifficulty(q.metadata?.difficulty || 'medium');
        setTags(Array.isArray(q.metadata?.tags) ? q.metadata.tags : []);
        setExplanation(q.explanation || '');

        const correct = Array.isArray(q.answer?.correct) 
          ? q.answer.correct 
          : (q.answer?.correct ? [q.answer.correct] : []);

        if (q.type === QUESTION_TYPES.SINGLE_CHOICE || q.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
          if (Array.isArray(q.responseSchema?.options) && q.responseSchema.options.length > 0) {
            setOptions(q.responseSchema.options);
          }
          setCorrectAnswers(correct);
        } else if (q.type === QUESTION_TYPES.TRUE_FALSE) {
          setCorrectAnswers(correct.length > 0 ? [String(correct[0]).toLowerCase()] : ['true']);
        } else if (q.type === QUESTION_TYPES.SHORT_ANSWER) {
          setShortAnswers(correct.length > 0 ? correct : ['']);
          setCaseSensitive(Boolean(q.responseSchema?.caseSensitive));
        } else if (q.type === QUESTION_TYPES.FILL_BLANK) {
          setFillBlankAnswers(correct.length > 0 ? correct : ['']);
          setPlaceholder(q.responseSchema?.placeholder || '');
        }
      } else {
        setErrors([`Question "${questionId}" was not found in the Question Bank.`]);
      }
    }
  }, [questionId, isEditing]);

  // Handle Type Change with friendly preservation
  const handleTypeChange = (newType) => {
    if (newType === type) return;
    setType(newType);
    const defaults = getDefaultQuestionStructure(newType);
    if (newType === QUESTION_TYPES.SINGLE_CHOICE) {
      if (options.length < 2) setOptions(defaults.responseSchema.options);
      setCorrectAnswers(['A']);
    } else if (newType === QUESTION_TYPES.MULTIPLE_CHOICE) {
      if (options.length < 2) setOptions(defaults.responseSchema.options);
      setCorrectAnswers(['A']);
    } else if (newType === QUESTION_TYPES.TRUE_FALSE) {
      setCorrectAnswers(['true']);
    } else if (newType === QUESTION_TYPES.SHORT_ANSWER) {
      if (shortAnswers.length === 0) setShortAnswers(['']);
    } else if (newType === QUESTION_TYPES.FILL_BLANK) {
      if (fillBlankAnswers.length === 0) setFillBlankAnswers(['']);
    }
  };

  // Option actions for single/multiple choice
  const handleAddOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length);
    setOptions([...options, { id: nextLetter, text: '' }]);
  };

  const handleRemoveOption = (indexToRemove) => {
    if (options.length <= 2) return;
    const removedId = options[indexToRemove].id;
    const updated = options.filter((_, idx) => idx !== indexToRemove).map((opt, idx) => ({
      id: String.fromCharCode(65 + idx),
      text: opt.text
    }));
    setOptions(updated);
    setCorrectAnswers(correctAnswers.filter(id => id !== removedId).map(id => {
      // adjust correct answers if needed
      return id;
    }));
  };

  const handleOptionTextChange = (index, text) => {
    const updated = [...options];
    updated[index].text = text;
    setOptions(updated);
  };

  const handleSingleChoiceSelect = (optionId) => {
    setCorrectAnswers([optionId]);
  };

  const handleMultipleChoiceToggle = (optionId) => {
    if (correctAnswers.includes(optionId)) {
      setCorrectAnswers(correctAnswers.filter(id => id !== optionId));
    } else {
      setCorrectAnswers([...correctAnswers, optionId]);
    }
  };

  // Assemble current question object
  const buildQuestionPayload = (targetStatus = status) => {
    let responseSchema = {};
    let answer = { correct: [] };

    if (type === QUESTION_TYPES.SINGLE_CHOICE || type === QUESTION_TYPES.MULTIPLE_CHOICE) {
      responseSchema = { options };
      answer = { correct: correctAnswers };
    } else if (type === QUESTION_TYPES.TRUE_FALSE) {
      responseSchema = {
        options: [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' }
        ]
      };
      answer = { correct: correctAnswers };
    } else if (type === QUESTION_TYPES.SHORT_ANSWER) {
      responseSchema = {
        placeholder: 'Enter response...',
        caseSensitive
      };
      answer = { correct: shortAnswers.map(s => s.trim()).filter(Boolean) };
    } else if (type === QUESTION_TYPES.FILL_BLANK) {
      responseSchema = {
        placeholder: placeholder.trim() || 'Missing term'
      };
      answer = { correct: fillBlankAnswers.map(s => s.trim()).filter(Boolean) };
    }

    return {
      id: isEditing ? questionId : undefined,
      type,
      content: {
        vignette: vignette.trim() || undefined,
        prompt: prompt.trim()
      },
      responseSchema,
      answer,
      scoring: {
        marks: Number(marks) || 5,
        negativeMarks: Number(negativeMarks) || 0
      },
      metadata: {
        subject: subject.trim(),
        topic: topic.trim(),
        difficulty,
        tags
      },
      explanation: explanation.trim(),
      status: targetStatus
    };
  };

  // Save handler (Draft or Publish)
  const handleSave = (targetStatus) => {
    setIsSubmitting(true);
    const payload = buildQuestionPayload(targetStatus);
    const validation = validateQuestionAuthoring(payload, targetStatus);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setWarnings(validation.warnings || []);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    setWarnings(validation.warnings || []);

    if (isEditing) {
      const updated = questionService.updateQuestion(questionId, payload);
      if (updated) {
        setToastMessage(`Question "${questionId}" updated successfully!`);
        setTimeout(() => navigate(`${basePath}/questions`), 1200);
      } else {
        setErrors(['Failed to update question in Question Bank.']);
        setIsSubmitting(false);
      }
    } else {
      const res = questionService.createQuestion(payload);
      if (res.success) {
        setToastMessage(`Question "${res.question.id}" created successfully!`);
        setTimeout(() => navigate(`${basePath}/questions`), 1200);
      } else {
        setErrors(res.errors || ['Failed to create question in Question Bank.']);
        setIsSubmitting(false);
      }
    }
  };

  const currentPreviewQuestion = buildQuestionPayload(status);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation & Action Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Link
              to={`${basePath}/questions`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Question Bank</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {isEditing ? `Editing: ${questionId}` : 'New Question Authoring'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isEditing ? 'Edit Assessment Question' : 'Create Question'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Author and configure standardized medical assessment items for reuse across mock exams and CBT tests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowLivePreview(prev => !prev)}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              showLivePreview
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{showLivePreview ? 'Hide Preview' : 'Live Preview'}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(QUESTION_STATUSES.DRAFT)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(QUESTION_STATUSES.PUBLISHED)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish Question</span>
          </button>
        </div>
      </div>

      {/* Validation Banner if errors or warnings exist */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-2">
          {errors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1 text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Please correct the following errors before publishing:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-rose-700 pl-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Draft notes: {warnings.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Live Preview Toggle Panel */}
      {showLivePreview && (
        <div className="p-6 bg-slate-50 border border-amber-200 rounded-3xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>Real-Time Instructor Preview</span>
            </h3>
            <span className="text-[11px] text-slate-500">Updates live as you edit below</span>
          </div>
          <QuestionPreview question={currentPreviewQuestion} />
        </div>
      )}

      {/* Main Authoring Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(QUESTION_STATUSES.PUBLISHED); }} className="space-y-6">
        
        {/* SECTION A: QUESTION TYPE & BASIC INFO */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Section A: Question Type & Workflow Status
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                Select Interaction & Response Format *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  QUESTION_TYPES.SINGLE_CHOICE,
                  QUESTION_TYPES.MULTIPLE_CHOICE,
                  QUESTION_TYPES.TRUE_FALSE,
                  QUESTION_TYPES.SHORT_ANSWER,
                  QUESTION_TYPES.FILL_BLANK
                ].map((t) => {
                  const conf = QUESTION_TYPE_CONFIG[t];
                  const isSelected = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{conf.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{conf.description}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">{conf.category}</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Supported</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                  Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                >
                  <option value={QUESTION_STATUSES.DRAFT}>Draft (Work in Progress)</option>
                  <option value={QUESTION_STATUSES.REVIEW}>Under Review (Faculty Peer Review)</option>
                  <option value={QUESTION_STATUSES.APPROVED}>Approved (Ready for Inclusion)</option>
                  <option value={QUESTION_STATUSES.PUBLISHED}>Published (Active in Bank)</option>
                  <option value={QUESTION_STATUSES.ARCHIVED}>Archived (Retired)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                  Target Pedagogical Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                >
                  <option value="easy">Easy (Recall & Foundational)</option>
                  <option value="medium">Medium (Clinical Vignette & Application)</option>
                  <option value="hard">Hard (Multi-step Synthesis & Rare Presentations)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: STEM & PROMPT */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Section B: Question Stem & Clinical Prompt
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Patient Vignette / Background Stem (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Contextual clinical scenario</span>
              </div>
              <textarea
                rows={3}
                value={vignette}
                onChange={(e) => setVignette(e.target.value)}
                placeholder="A 58-year-old male with long-standing hypertension presents to the emergency department with sudden severe chest pain..."
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Question Prompt / Interrogative Statement *
                </label>
                <span className="text-[11px] text-rose-500 font-bold">Required</span>
              </div>
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Which of the following is the most definitive first-line diagnostic investigation?"
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION C: RESPONSE & ANSWER KEY EDITOR */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Section C: Response Options & Key Configuration
              </h2>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              {QUESTION_TYPE_CONFIG[type]?.shortLabel || type}
            </span>
          </div>

          {/* Sub-Editor: Single Choice */}
          {type === QUESTION_TYPES.SINGLE_CHOICE && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Provide options and click the radio button to designate the <strong className="text-slate-700">single correct answer</strong>.
              </p>
              <div className="space-y-3">
                {options.map((opt, idx) => {
                  const isCorrect = correctAnswers[0] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border transition-all ${
                        isCorrect
                          ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSingleChoiceSelect(opt.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all cursor-pointer shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-slate-500 border border-slate-300 hover:border-emerald-500'
                        }`}
                        title={isCorrect ? 'Correct option selected' : 'Click to select as correct option'}
                      >
                        {isCorrect ? <Check className="w-4 h-4" /> : opt.id}
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        placeholder={`Option ${opt.id} description...`}
                        className="flex-1 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                          title="Remove option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddOption}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Option</span>
              </button>
            </div>
          )}

          {/* Sub-Editor: Multiple Choice */}
          {type === QUESTION_TYPES.MULTIPLE_CHOICE && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Provide options and check the box for <strong className="text-slate-700">every correct answer</strong> (multi-select).
              </p>
              <div className="space-y-3">
                {options.map((opt, idx) => {
                  const isCorrect = correctAnswers.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border transition-all ${
                        isCorrect
                          ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleMultipleChoiceToggle(opt.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all cursor-pointer shrink-0 ${
                          isCorrect
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-slate-500 border border-slate-300 hover:border-indigo-500'
                        }`}
                        title={isCorrect ? 'Correct option selected' : 'Click to toggle correct option'}
                      >
                        {isCorrect ? <Check className="w-4 h-4" /> : opt.id}
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        placeholder={`Option ${opt.id} description...`}
                        className="flex-1 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                          title="Remove option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddOption}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Option</span>
              </button>
            </div>
          )}

          {/* Sub-Editor: True / False */}
          {type === QUESTION_TYPES.TRUE_FALSE && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Select whether the statement assertion in the prompt is <strong className="text-slate-700">True</strong> or <strong className="text-slate-700">False</strong>.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                {['true', 'false'].map((val) => {
                  const isSelected = correctAnswers.includes(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCorrectAnswers([val])}
                      className={`p-5 rounded-2xl border text-center font-black text-sm transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="uppercase tracking-wider">{val}</span>
                      {isSelected ? (
                        <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                          <Check className="w-3 h-3" /> Correct Key
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-normal">Click to mark</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-Editor: Short Answer */}
          {type === QUESTION_TYPES.SHORT_ANSWER && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Specify accepted student response answers (synonyms, abbreviations, or variants).
                </p>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Case-sensitive matching</span>
                </label>
              </div>

              <div className="space-y-2.5">
                {shortAnswers.map((ans, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ans}
                      onChange={(e) => {
                        const next = [...shortAnswers];
                        next[idx] = e.target.value;
                        setShortAnswers(next);
                      }}
                      placeholder={`Accepted answer phrase #${idx + 1} (e.g. Myocardial Infarction or MI)`}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                    {shortAnswers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShortAnswers(shortAnswers.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove accepted phrase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShortAnswers([...shortAnswers, ''])}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Accepted Answer Variant</span>
              </button>
            </div>
          )}

          {/* Sub-Editor: Fill in the Blank */}
          {type === QUESTION_TYPES.FILL_BLANK && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Specify the placeholder and acceptable input values for the candidate to fill in.
              </p>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                  Blank Input Placeholder
                </label>
                <input
                  type="text"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  placeholder="e.g. Target INR range (e.g. 2.5 to 3.5)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
                  Accepted Blank Target Values
                </label>
                {fillBlankAnswers.map((ans, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ans}
                      onChange={(e) => {
                        const next = [...fillBlankAnswers];
                        next[idx] = e.target.value;
                        setFillBlankAnswers(next);
                      }}
                      placeholder={`Target solution #${idx + 1}`}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                    {fillBlankAnswers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFillBlankAnswers(fillBlankAnswers.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove target value"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setFillBlankAnswers([...fillBlankAnswers, ''])}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Accepted Target Value</span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION D: SCORING RULES */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Section D: Item Scoring Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                Correct Response Score (+Marks) *
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default: 5 marks per correct response.</p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                Negative Penalty Deduction (-Marks)
              </label>
              <input
                type="number"
                max="0"
                step="0.5"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Deducted for incorrect response (e.g. -1 or 0 for no penalty).</p>
            </div>
          </div>
        </div>

        {/* SECTION E: CLINICAL EXPLANATION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Section E: Pedagogical Explanation & Clinical Rationale
            </h2>
          </div>

          <div>
            <textarea
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Detailed explanation of the pathophysiology, ACC/AHA guidelines, or rationale justifying why the correct answer is standard-of-care and why distractors are incorrect..."
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* SECTION F: METADATA & TAGS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Section F: Subject Taxonomy & Tagging
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject / Discipline
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Medicine, Pharmacology, Surgery"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                  Topic / Subspecialty
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Cardiology, Arrhythmias, Sepsis"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                Keywords & Tags
              </label>
              <TagInput tags={tags} onChange={setTags} />
            </div>
          </div>
        </div>

        {/* Form Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/questions`)}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(QUESTION_STATUSES.DRAFT)}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isEditing ? 'Save Changes' : 'Publish to Question Bank'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
