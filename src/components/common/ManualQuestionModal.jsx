import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  HelpCircle, 
  Award,
  FileText,
  Sliders,
  Check
} from 'lucide-react';
import { questionService } from '../../services/questionService.js';
import { curriculumService } from '../../services/curriculumService.js';

export default function ManualQuestionModal({
  isOpen,
  onClose,
  test = {},
  defaultSubject = '',
  onQuestionCreated
}) {
  if (!isOpen) return null;

  const testExamId = test?.examId || test?.examTrack || test?.courseId || 'neet-pg';

  // Retrieve available subjects for the exam
  const availableSubjects = React.useMemo(() => {
    return curriculumService.getSubjects(testExamId) || [];
  }, [testExamId]);

  const [prompt, setPrompt] = useState('');
  const [vignette, setVignette] = useState('');
  const [subject, setSubject] = useState(defaultSubject || availableSubjects[0]?.name || 'Cardiology');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [marks, setMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(-1);
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' }
  ]);
  const [correctOption, setCorrectOption] = useState('A');
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultSubject) {
      setSubject(defaultSubject);
    }
  }, [defaultSubject]);

  const handleOptionTextChange = (optId, text) => {
    setOptions(prev => prev.map(o => o.id === optId ? { ...o, text } : o));
  };

  const handleAddOption = () => {
    if (options.length >= 6) return;
    const nextLetter = String.fromCharCode(65 + options.length);
    setOptions(prev => [...prev, { id: nextLetter, text: '' }]);
  };

  const handleRemoveOption = (optId) => {
    if (options.length <= 2) return;
    const filtered = options.filter(o => o.id !== optId);
    // Re-index letter IDs A, B, C...
    const reindexed = filtered.map((o, idx) => ({ ...o, id: String.fromCharCode(65 + idx) }));
    setOptions(reindexed);
    if (correctOption === optId || !reindexed.some(o => o.id === correctOption)) {
      setCorrectOption('A');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Question prompt / stem is required.');
      return;
    }

    const emptyOptions = options.filter(o => !o.text.trim());
    if (emptyOptions.length > 0) {
      setError('All options must have text.');
      return;
    }

    const newQuestion = {
      id: `q-manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'single_choice',
      content: {
        prompt: prompt.trim(),
        vignette: vignette.trim()
      },
      responseSchema: {
        options: options.map(o => ({ id: o.id, text: o.text.trim() }))
      },
      answer: {
        correct: [correctOption]
      },
      scoring: {
        marks: Number(marks) || 4,
        negativeMarks: Number(negativeMarks) || -1
      },
      metadata: {
        subject: subject || 'General',
        topic: topic.trim() || 'Clinical Practice',
        difficulty,
        tags: ['Manual Build', 'Phase 5 Authoring'],
        examId: testExamId
      },
      explanation: explanation.trim(),
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const res = questionService.createQuestion(newQuestion);
    if (!res.success) {
      setError(res.errors ? res.errors.join('; ') : 'Failed to create question.');
      return;
    }

    if (onQuestionCreated) {
      onQuestionCreated(res.question);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-6 p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add Question Manually</h3>
              <p className="text-xs text-slate-500">
                Author a new assessment question and immediately attach it to this test.
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
          {/* Clinical Vignette (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Vignette / Case Scenario (Optional)
            </label>
            <textarea
              value={vignette}
              onChange={(e) => setVignette(e.target.value)}
              rows={2}
              placeholder="e.g. A 45-year-old male presents with sudden onset crushing chest pain..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Question Prompt / Stem */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Question Prompt / Stem <span className="text-red-500">*</span>
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

          {/* Options Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Answer Options (Select the correct option radio) <span className="text-red-500">*</span>
              </label>
              {options.length < 6 && (
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
              {options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectOption(opt.id)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition-all ${
                      correctOption === opt.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                    title={`Mark option ${opt.id} as correct`}
                  >
                    {opt.id}
                  </button>

                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                    placeholder={`Option ${opt.id} text...`}
                    className={`flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 ${
                      correctOption === opt.id
                        ? 'border-emerald-300 ring-1 ring-emerald-400'
                        : 'border-slate-200 focus:ring-indigo-500'
                    }`}
                    required
                  />

                  {correctOption === opt.id && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 shrink-0">
                      Correct
                    </span>
                  )}

                  {options.length > 2 && (
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
              ))}
            </div>
          </div>

          {/* Classification: Subject, Difficulty, Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {availableSubjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Chapter</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. ECG Analysis"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Scoring */}
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

          {/* Explanation / Rationale */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Explanation / Rationale (Optional)
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
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
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
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Create &amp; Add Question</span>
          </button>
        </div>
      </div>
    </div>
  );
}
