import React, { useState, useMemo } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Sparkles, 
  Trash2, 
  RefreshCw, 
  Check, 
  FileCode,
  BookOpen,
  HelpCircle,
  Eye,
  Code2,
  Filter,
  CheckCircle,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { extractTextFromFile } from '../../services/questionFileParserService.js';
import { 
  parseQuestionRows, 
  updateParsedRowType, 
  ROW_STATUS, 
  IMPORT_ERROR_CODES, 
  IMPORT_SYNTAX 
} from '../../services/questionImportParser.js';
import { questionTypeService, QUESTION_TYPES, QUESTION_TYPE_REGISTRY } from '../../services/questionTypeService.js';
import { questionService } from '../../services/questionService.js';
import { curriculumService } from '../../services/curriculumService.js';

export const SAMPLE_SYMBOL_DOCUMENT_TEXT = `Type: SBA
1. A 58-year-old male with long-standing hypertension presents with acute chest pressure. ECG reveals ST elevation in leads V1-V4. Which coronary artery is most likely occluded?
^ Left anterior descending artery
Right coronary artery
Left circumflex artery
Posterior descending artery
Explanation: Acute anteroseptal MI is classically caused by acute thrombotic occlusion of the LAD.

Type: MCQ
2. Which of the following clinical features are classically associated with Graves' disease?
^ Exophthalmos (proptosis)
^ Pretibial myxedema
Hypothyroidism
^ Diffuse toxic goiter with thyroid bruit
Cold intolerance
Explanation: Graves' disease is an autoimmune hyperthyroidism presenting with exophthalmos, pretibial myxedema, and diffuse vascular goiter.

Type: SHORT_ANSWER
3. The first-line pharmacotherapeutic agent administered intravenously to stabilize cardiac membranes in severe hyperkalemia is \`calcium gluconate\`.
Explanation: Intravenous calcium gluconate antagonizes membrane excitability without lowering serum potassium.

4. Which nerve is vulnerable to injury in fractures of the mid-shaft humerus?
^ Radial nerve
Median nerve
Ulnar nerve
Axillary nerve
Explanation: The radial nerve runs in the spiral (radial) groove along the mid-shaft humerus.`;

export default function UploadQuestionsModal({
  isOpen,
  onClose,
  test = {},
  defaultSubject = '',
  onQuestionsImported
}) {
  if (!isOpen) return null;

  const testExamId = test?.examId || test?.examTrack || test?.courseId || 'neet-pg';
  const availableSubjects = useMemo(() => {
    const allSubs = curriculumService.getSubjects(testExamId) || [];
    const scopeSubs = test?.curriculumScope?.subjects;
    if (Array.isArray(scopeSubs) && scopeSubs.length > 0) {
      const scopeIds = new Set(scopeSubs.map(s => s.subjectId));
      const filtered = allSubs.filter(s => scopeIds.has(s.id));
      return filtered.length > 0 ? filtered : allSubs;
    }
    return allSubs;
  }, [testExamId, test?.curriculumScope]);

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [selectedSubject, setSelectedSubject] = useState(defaultSubject || availableSubjects[0]?.name || 'Cardiology');
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'valid' | 'action'
  const [inspectedRowIndex, setInspectedRowIndex] = useState(null);
  const [viewMode, setViewMode] = useState('parsed'); // 'parsed' | 'source'

  const processText = (text, name = 'document') => {
    try {
      setIsParsing(true);
      setError('');
      setInspectedRowIndex(null);

      const rows = parseQuestionRows(text, {
        defaultSubject: selectedSubject,
        examId: testExamId
      });

      if (rows.length === 0) {
        setError('No questions could be detected. Ensure items are separated by blank lines or numbering.');
        setParsedRows([]);
      } else {
        setParsedRows(rows);
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
    setRawText(SAMPLE_SYMBOL_DOCUMENT_TEXT);
    processText(SAMPLE_SYMBOL_DOCUMENT_TEXT, 'sample_symbol_questions.txt');
    setActiveTab('paste');
  };

  const handleRemoveRow = (rowIdx) => {
    setParsedRows(prev => prev.filter((_, i) => i !== rowIdx));
    if (inspectedRowIndex === rowIdx) {
      setInspectedRowIndex(null);
    }
  };

  const handleRowTypeChange = (rowIdx, newType) => {
    setParsedRows(prev => {
      const updated = [...prev];
      updated[rowIdx] = updateParsedRowType(updated[rowIdx], newType, {
        defaultSubject: selectedSubject,
        examId: testExamId
      });
      return updated;
    });
  };

  // Metrics
  const validRows = useMemo(() => parsedRows.filter(r => r.status === ROW_STATUS.VALID), [parsedRows]);
  const actionRows = useMemo(() => parsedRows.filter(r => r.status === ROW_STATUS.REQUIRES_ACTION), [parsedRows]);
  const invalidRows = useMemo(() => parsedRows.filter(r => r.status === ROW_STATUS.INVALID), [parsedRows]);
  const blockedRowsCount = actionRows.length + invalidRows.length;

  const filteredRows = useMemo(() => {
    if (filterMode === 'valid') return validRows;
    if (filterMode === 'action') return parsedRows.filter(r => r.status !== ROW_STATUS.VALID);
    return parsedRows;
  }, [parsedRows, filterMode, validRows]);

  const handleImport = () => {
    if (validRows.length === 0) return;

    // Save only valid questions to questionService
    const createdQuestions = [];
    validRows.forEach(row => {
      if (!row.normalizedQuestion) return;

      const payload = {
        ...row.normalizedQuestion,
        metadata: {
          ...row.normalizedQuestion.metadata,
          subject: selectedSubject || row.normalizedQuestion.metadata?.subject || 'Medicine'
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

  const getTypeBadgeClass = (type) => {
    if (!type) return 'bg-amber-50 text-amber-700 border-amber-200';
    const def = questionTypeService.getQuestionTypeById(type);
    return def?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden space-y-5 p-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Bulk Question Upload</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Symbol-Based Parsing
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Use <code className="font-mono bg-slate-100 text-cyan-700 px-1 py-0.5 rounded">^</code> for correct options (SBA / MCQ) and <code className="font-mono bg-slate-100 text-cyan-700 px-1 py-0.5 rounded">`answer`</code> backticks for blanks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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

        {/* Tab switcher & Sample template */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Upload File (PDF / DOCX / TXT)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Paste Formatted Text
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Syntax Sample</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Target Subject Selector */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Assign Subject Scope:</span>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                if (parsedRows.length > 0) {
                  // update all rows with new subject
                  setParsedRows(prev => prev.map(r => ({
                    ...r,
                    normalizedQuestion: r.normalizedQuestion ? {
                      ...r.normalizedQuestion,
                      metadata: { ...r.normalizedQuestion.metadata, subject: e.target.value }
                    } : null
                  })));
                }
              }}
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
              className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
                dragActive ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-200 hover:border-cyan-300 bg-slate-50/50'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center mx-auto mb-2 text-cyan-600">
                {isParsing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <UploadCloud className="w-5 h-5" />
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {isParsing ? 'Parsing questions from file...' : 'Drop your Word (.docx), PDF, or text file here'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Parser automatically identifies stems, <code className="text-cyan-700 font-mono">^</code> correct markers, and <code className="text-cyan-700 font-mono">`backtick`</code> blanks.
              </p>

              <div className="mt-3 flex items-center justify-center gap-3">
                <label className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors">
                  <span>Browse File</span>
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Paste questions with symbol markers:
                </label>
                <span className="text-[11px] text-slate-400">
                  Tip: Separate questions with blank lines
                </span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  if (e.target.value.trim()) processText(e.target.value, 'Pasted Content');
                  else setParsedRows([]);
                }}
                rows={5}
                placeholder="Type: SBA&#10;What is the capital of France?&#10;^ Paris&#10;London&#10;Berlin&#10;Madrid&#10;&#10;Type: MCQ&#10;Which are programming languages?&#10;^ Python&#10;^ Java&#10;HTML&#10;&#10;Type: SHORT_ANSWER&#10;The process by which plants convert light energy is `photosynthesis`."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              {/* Toolbar & Filter Metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-white text-slate-800 shadow-2xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    All ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('valid')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      filterMode === 'valid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                        : 'text-emerald-600 hover:bg-emerald-50/50'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Valid ({validRows.length})</span>
                  </button>
                  {blockedRowsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterMode('action')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        filterMode === 'action'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs'
                          : 'text-amber-600 hover:bg-amber-50/50'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Action / Errors ({blockedRowsCount})</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">View Mode:</span>
                  <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode('parsed')}
                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                        viewMode === 'parsed' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Parsed Clean
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('source')}
                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                        viewMode === 'source' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Raw Source
                    </button>
                  </div>
                </div>
              </div>

              {/* Table of Parsed Questions */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {filteredRows.map((row, idx) => {
                    const originalIndex = parsedRows.indexOf(row);
                    const isInspected = inspectedRowIndex === originalIndex;
                    const isValid = row.status === ROW_STATUS.VALID;
                    const isAction = row.status === ROW_STATUS.REQUIRES_ACTION;
                    const isInvalid = row.status === ROW_STATUS.INVALID;

                    return (
                      <div key={row.rowNumber || idx} className="p-3 hover:bg-slate-50/80 transition-colors space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          {/* Row Number & Type */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center">
                              {row.rowNumber}
                            </span>

                            {/* Type Dropdown / Pill */}
                            <select
                              value={row.type || ''}
                              onChange={(e) => handleRowTypeChange(originalIndex, e.target.value)}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-cyan-500 ${getTypeBadgeClass(row.type)}`}
                              title="Click to reclassify or assign Question Type"
                            >
                              <option value="">-- Missing Type --</option>
                              {QUESTION_TYPE_REGISTRY.map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.shortName} ({t.name})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Stem Prompt Preview */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 line-clamp-2">
                              {viewMode === 'parsed' ? (row.normalizedQuestion?.content?.prompt || row.original?.prompt) : row.original?.prompt}
                            </p>
                          </div>

                          {/* Status Badge & Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isValid && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Valid</span>
                              </span>
                            )}
                            {isAction && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Action Needed</span>
                              </span>
                            )}
                            {isInvalid && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Invalid</span>
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => setInspectedRowIndex(isInspected ? null : originalIndex)}
                              className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                                isInspected ? 'bg-cyan-100 text-cyan-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title="Toggle inspection details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveRow(originalIndex)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Parsed Answer preview snippet */}
                        <div className="flex items-center justify-between text-[11px] pl-7 pr-1">
                          <div className="flex items-center gap-1.5 text-slate-600 truncate">
                            <span className="font-semibold text-slate-500">Parsed Answer:</span>
                            <span className={`font-medium truncate ${isValid ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>
                              {row.parsedAnswerSummary || '—'}
                            </span>
                          </div>

                          {/* Error or Warning snippet if present */}
                          {row.validation?.errors?.length > 0 && (
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 truncate max-w-xs">
                              {row.validation.errors[0].message}
                            </span>
                          )}
                        </div>

                        {/* Expanded Inspection Drawer */}
                        {isInspected && (
                          <div className="mt-2 pl-7 pt-2 border-t border-slate-100 space-y-2 bg-slate-50/60 -mx-3 -mb-3 p-3 rounded-b-2xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Source Representation */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  <Code2 className="w-3 h-3 text-cyan-600" />
                                  <span>Original Source Input</span>
                                </div>
                                <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 space-y-1 overflow-x-auto">
                                  <div className="text-slate-500 font-semibold">{row.original?.prompt}</div>
                                  {(row.original?.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} className={opt.isCorrect ? 'text-cyan-700 font-bold' : 'text-slate-600'}>
                                      {opt.originalText || opt.text}
                                    </div>
                                  ))}
                                  {row.original?.explanation && (
                                    <div className="text-slate-400 italic text-[10px] pt-1 border-t border-slate-100">
                                      Explanation: {row.original.explanation}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Normalized Canonical Representation */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>Normalized Clean Output</span>
                                </div>
                                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-800 space-y-1.5 overflow-x-auto">
                                  <div className="font-medium text-slate-900">
                                    {row.normalizedQuestion?.content?.prompt || 'Requires valid type & syntax to generate'}
                                  </div>

                                  {row.normalizedQuestion?.responseSchema?.options?.length > 0 ? (
                                    <div className="space-y-1">
                                      {row.normalizedQuestion.responseSchema.options.map(opt => {
                                        const isCorrect = (row.normalizedQuestion.answer?.correct || []).includes(opt.id);
                                        return (
                                          <div
                                            key={opt.id}
                                            className={`px-2 py-0.5 rounded-lg flex items-center gap-2 ${
                                              isCorrect
                                                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                                                : 'bg-slate-50 text-slate-600'
                                            }`}
                                          >
                                            <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold ${
                                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                              {opt.id}
                                            </span>
                                            <span className="truncate">{opt.text}</span>
                                            {isCorrect && <Check className="w-3 h-3 text-emerald-600 ml-auto shrink-0" />}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    row.normalizedQuestion?.answer?.textAnswer && (
                                      <div className="p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold text-[11px]">
                                        Accepted Answer: {row.normalizedQuestion.answer.textAnswer}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Validation Errors callout if present */}
                            {row.validation?.errors?.length > 0 && (
                              <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                                  Validation Issues:
                                </span>
                                <ul className="list-disc list-inside text-xs text-rose-700 space-y-0.5">
                                  {row.validation.errors.map((e, eIdx) => (
                                    <li key={eIdx}>
                                      <strong className="font-mono text-[10px]">{e.code}:</strong> {e.message}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {blockedRowsCount > 0 && (
                <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    <strong>{blockedRowsCount} questions require attention:</strong> assign a Question Type or fix missing/multiple markers above. Only valid questions will be imported.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span>
                <strong className="text-slate-800 font-bold">{validRows.length}</strong> of {parsedRows.length} questions ready to import
              </span>
            ) : (
              'No questions parsed yet'
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validRows.length === 0}
              onClick={handleImport}
              className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Import {validRows.length} Valid Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
