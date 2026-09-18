import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  Check, 
  FileCode,
  BookOpen
} from 'lucide-react';
import { 
  extractTextFromFile, 
  parseRawTextToQuestions, 
  SAMPLE_MCQ_DOCUMENT_TEXT 
} from '../../services/questionFileParserService.js';
import { questionService } from '../../services/questionService.js';
import { curriculumService } from '../../services/curriculumService.js';

export default function UploadQuestionsModal({
  isOpen,
  onClose,
  test = {},
  defaultSubject = '',
  onQuestionsImported
}) {
  if (!isOpen) return null;

  const testExamId = test?.examId || test?.examTrack || test?.courseId || 'neet-pg';
  const availableSubjects = React.useMemo(() => {
    return curriculumService.getSubjects(testExamId) || [];
  }, [testExamId]);

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [selectedSubject, setSelectedSubject] = useState(defaultSubject || availableSubjects[0]?.name || 'Cardiology');
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const processText = (text, name = 'document') => {
    try {
      setIsParsing(true);
      setError('');
      const questions = parseRawTextToQuestions(text, {
        subject: selectedSubject,
        examId: testExamId
      });

      if (questions.length === 0) {
        setError('No standard MCQs could be detected in this text. Ensure questions have numbering (e.g., "1.") and options (e.g., "A)").');
      } else {
        setParsedQuestions(questions);
        setFileName(name);
      }
    } catch (err) {
      setError(err.message || 'Failed to parse text.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    setError('');
    setIsParsing(true);
    try {
      const text = await extractTextFromFile(file);
      setRawText(text);
      processText(text, file.name);
    } catch (err) {
      setError(err.message || 'Error reading file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_MCQ_DOCUMENT_TEXT);
    processText(SAMPLE_MCQ_DOCUMENT_TEXT, 'sample_clinical_mcqs.docx');
    setActiveTab('paste');
  };

  const handleRemoveParsedItem = (idx) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleImport = () => {
    if (parsedQuestions.length === 0) return;

    // Save all to questionService
    const createdQuestions = [];
    parsedQuestions.forEach(q => {
      const payload = {
        ...q,
        metadata: {
          ...q.metadata,
          subject: selectedSubject || q.metadata?.subject || 'Medicine'
        }
      };
      const res = questionService.createQuestion(payload);
      if (res.success && res.question) {
        createdQuestions.push(res.question);
      }
    });

    if (onQuestionsImported) {
      onQuestionsImported(createdQuestions);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-6 p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Upload &amp; Parse Questions</h3>
              <p className="text-xs text-slate-500">
                Upload Word (.docx / .doc), PDF, or plain text to automatically extract and format MCQs.
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

        {/* Tab switcher */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Upload Document (PDF / DOCX)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'paste'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Paste Document Text
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Template</span>
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Target Subject Selector */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Assign Subject to Extracted Questions:</span>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            >
              {availableSubjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                dragActive ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-200 hover:border-cyan-300 bg-slate-50/50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-3 text-cyan-600">
                {isParsing ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {isParsing ? 'Parsing questions from file...' : 'Drop your PDF or Word document here'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Supports PDF (.pdf), Microsoft Word (.docx, .doc), and text (.txt). Automatically identifies question stems, options A-E, and answer keys.
              </p>

              <div className="mt-4 flex items-center justify-center gap-3">
                <label className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors">
                  <span>Browse Document</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Paste raw questions text from PDF, Word, or text file:
              </label>
              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  if (e.target.value.trim()) processText(e.target.value, 'Pasted Text');
                }}
                rows={7}
                placeholder="1. Question prompt here...\nA) Option A\nB) Option B\nC) Option C\nD) Option D\nAnswer: B\nExplanation: ..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* Parsed Questions Preview */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Detected {parsedQuestions.length} Questions {fileName ? `from "${fileName}"` : ''}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Review items before importing</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {parsedQuestions.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative group hover:border-cyan-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-cyan-100 text-cyan-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-2">
                          {q.content?.prompt}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveParsedItem(qIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Remove question from import"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Options Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-7">
                      {(q.responseSchema?.options || []).map(opt => {
                        const isCorrect = (q.answer?.correct || []).includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            className={`px-2 py-1 rounded-lg text-[11px] flex items-center gap-1.5 ${
                              isCorrect 
                                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' 
                                : 'bg-white text-slate-600 border border-slate-100'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {opt.id}
                            </span>
                            <span className="truncate">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="text-[10px] text-slate-500 pl-7 line-clamp-1 italic">
                        <strong>Rationale:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          <div className="text-xs text-slate-500">
            {parsedQuestions.length > 0 ? `${parsedQuestions.length} ready to import` : 'No questions detected yet'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={parsedQuestions.length === 0}
              onClick={handleImport}
              className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Import {parsedQuestions.length} Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
