import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Flag, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Layers, 
  BookOpen, 
  Sparkles, 
  Play, 
  Pause,
  AlertTriangle,
  Send
} from 'lucide-react';
import QuestionRenderer from './QuestionRenderer.jsx';
import QuestionPalette from './QuestionPalette.jsx';
import StudentTestInstructionsPage from '../../pages/student/StudentTestInstructionsPage.jsx';

export default function TestPreviewShell({
  previewModel,
  role = 'admin', // 'admin' | 'faculty'
  exitUrl = '/admin/tests',
  className = ''
}) {
  if (!previewModel) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Test Preview Unavailable</h3>
          <p className="text-xs text-slate-500">
            The requested test configuration could not be loaded for simulation.
          </p>
          <Link
            to={exitUrl}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Review
          </Link>
        </div>
      </div>
    );
  }

  const {
    testName,
    testCode,
    examName,
    testType,
    assessmentMethod,
    totalQuestions,
    durationMinutes,
    questions = [],
    sections = [],
    navigation = {},
    scoring = {}
  } = previewModel;

  // View Mode: 'questions' | 'instructions'
  const [previewTab, setPreviewTab] = useState('questions');

  // Local In-Memory Simulation State (Non-Destructive!)
  const [currentIdx, setCurrentIdx] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [visitedIds, setVisitedIds] = useState(questions.length > 0 ? [questions[0].id] : []);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Optional Preview Timer Simulation
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [simulatedSeconds, setSimulatedSeconds] = useState(durationMinutes * 60);

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelectQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIdx(idx);
    const targetQ = questions[idx];
    if (targetQ && !visitedIds.includes(targetQ.id)) {
      setVisitedIds(prev => [...prev, targetQ.id]);
    }
  };

  const handleAnswerChange = (val) => {
    if (!currentQ) return;
    setPreviewAnswers(prev => ({
      ...prev,
      [currentQ.id]: val
    }));
  };

  const handleClearAnswer = () => {
    if (!currentQ) return;
    setPreviewAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleToggleMark = () => {
    if (!currentQ) return;
    setMarkedQuestions(prev => {
      if (prev.includes(currentQ.id)) {
        return prev.filter(id => id !== currentQ.id);
      }
      return [...prev, currentQ.id];
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      handleSelectQuestion(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      handleSelectQuestion(currentIdx - 1);
    }
  };

  const isCurrentMarked = currentQ ? markedQuestions.includes(currentQ.id) : false;

  const answeredCount = Object.keys(previewAnswers).length;
  const markedCount = markedQuestions.length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col font-sans ${className}`}>
      {/* 1. Mandatory Read-Only Preview Watermark Banner */}
      <div className={`px-4 py-2 text-center text-xs font-bold tracking-wide uppercase shadow-xs shrink-0 flex items-center justify-between ${
        role === 'faculty'
          ? 'bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-700 text-white'
          : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white'
      }`}>
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Eye className="w-4 h-4" />
          <span>
            {role === 'faculty' ? 'FACULTY PREVIEW' : 'PREVIEW MODE'} — You're viewing this Test as a candidate. Answers are temporary and will not be saved.
          </span>
        </div>
        <Link
          to={exitUrl}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Preview</span>
        </Link>
      </div>

      {/* 2. Test Configuration Header Bar */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-4 shadow-xs shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {testCode}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                {testType}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-100">
                {assessmentMethod}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">
                {examName}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {testName}
            </h1>
          </div>

          {/* Quick Simulation Metrics, Tab Toggle & Exit Action */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Toggle: Preview Instructions vs Questions */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setPreviewTab('instructions')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'instructions'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Instructions &amp; Consent</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('questions')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'questions'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Questions UI</span>
              </button>
            </div>

            <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs text-slate-700">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Configured: <strong>{durationMinutes} mins</strong></span>
            </div>

            <Link
              to={exitUrl}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Preview</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Conditional: Instructions Gateway Preview vs Questions Preview */}
      {previewTab === 'instructions' ? (
        <div className="flex-1 bg-slate-100">
          <StudentTestInstructionsPage
            previewMode={true}
            previewTest={previewModel.test}
            onPreviewStart={() => setPreviewTab('questions')}
          />
        </div>
      ) : (
        /* 3. Main Body: Question Workspace & Palette */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Column: Question Card & Controls */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Question Sequence Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Question
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {currentIdx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    of {questions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleMark}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrentMarked
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isCurrentMarked ? 'fill-current' : ''}`} />
                    <span>{isCurrentMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearAnswer}
                    disabled={!previewAnswers[currentQ?.id]}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    Clear Response
                  </button>
                </div>
              </div>

              {/* Canonical Question Renderer in mode="preview" */}
              <QuestionRenderer
                question={currentQ}
                value={currentQ ? previewAnswers[currentQ.id] : null}
                onChange={handleAnswerChange}
                mode="preview"
              />

              {/* Bottom Step Navigation Bar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSummaryModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Preview Submit</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIdx === questions.length - 1}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Question Palette */}
          <div className="lg:col-span-4 space-y-4">
            <QuestionPalette
              questions={questions}
              sections={sections}
              currentIndex={currentIdx}
              onSelectQuestion={handleSelectQuestion}
              answers={previewAnswers}
              markedForReview={markedQuestions}
              visitedQuestionIds={visitedIds}
              navigation={navigation}
            />

            {/* Simulation Note Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 text-xs text-amber-950 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                Preview Mode Information:
              </span>
              <p className="leading-relaxed text-slate-700">
                You are currently interacting with the test in safe preview mode. Selecting answers updates the question palette in real time, but does not record attempts in the student database.
              </p>
            </div>
          </div>
        </div>
      </main>
      )}

      {/* Preview Submit Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700">
                <Eye className="w-5 h-5" />
                <h3 className="font-bold text-slate-900">Candidate Submission Simulation</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              In live test-taking, candidates receive this summary before confirming final submission:
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Answered</span>
                <span className="text-xl font-black text-emerald-900">{answeredCount}</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Marked</span>
                <span className="text-xl font-black text-amber-900">{markedCount}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Unanswered</span>
                <span className="text-xl font-black text-slate-900">{unansweredCount}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong>Preview Notice:</strong> Clicking close returns you to the preview shell. No submission is recorded.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800"
              >
                Close Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
