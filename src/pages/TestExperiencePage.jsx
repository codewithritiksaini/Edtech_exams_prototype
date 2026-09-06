import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Flag, 
  RotateCcw, 
  BarChart3, 
  Award, 
  ChevronRight, 
  ChevronDown, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  X, 
  Check, 
  Eye, 
  ExternalLink,
  Sparkles,
  BookOpen,
  LayoutGrid
} from 'lucide-react';
import { 
  testService, 
  sampleCbtQuestionBank 
} from '../data/mockData';

export default function TestExperiencePage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  // Test metadata from service
  const [test, setTest] = useState(() => testService.getTestById(testId));

  // Current Screen State: 'instructions' | 'taking' | 'result'
  const [viewState, setViewState] = useState('instructions');

  // CBT Exam State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: 'A' | 'B' | 'C' | 'D' }
  const [markedForReview, setMarkedForReview] = useState({}); // { [qId]: boolean }
  const [secondsRemaining, setSecondsRemaining] = useState(2700); // 45 minutes
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);

  // Result & Review State
  const [resultData, setResultData] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unattempted'
  const [expandedExplanations, setExpandedExplanations] = useState({});

  // Countdown timer for taking mode
  useEffect(() => {
    if (viewState !== 'taking') return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [viewState]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start Test Action
  const handleStartTest = () => {
    setTestStartTime(Date.now());
    setSecondsRemaining(test.durationSeconds || 2700);
    setViewState('taking');
    window.scrollTo(0, 0);
  };

  // Option selection
  const handleSelectOption = (qId, optionKey) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionKey
    }));
  };

  // Clear choice
  const handleClearResponse = (qId) => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  // Toggle Mark for Review
  const handleToggleReview = (qId) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Dynamic questions: use custom questions added by Faculty/Admin or fallback to default sample bank
  const questionsToUse = (test?.questions && Array.isArray(test.questions) && test.questions.length > 0) 
    ? test.questions 
    : sampleCbtQuestionBank;

  // Calculate palette metrics
  const totalQuestions = questionsToUse.length;
  const answeredCount = Object.keys(userAnswers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  // Final Submit Handler
  const handleFinalSubmit = () => {
    setIsSubmitModalOpen(false);

    // Compute evaluation
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    questionsToUse.forEach((q) => {
      const chosen = userAnswers[q.id];
      if (!chosen) {
        unattemptedCount++;
      } else if (chosen === q.correct) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    // NEET PG / NExT marking: +5 for correct, -1 for incorrect
    // Scaled to 100 max: (20 * 5) = 100
    const rawScore = Math.max(0, (correctCount * 5) - (incorrectCount * 1));
    const percentage = Math.round((rawScore / (totalQuestions * 5)) * 100);
    const passed = percentage >= 50;

    // Time taken
    const elapsedSeconds = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : 2700 - secondsRemaining;
    const elapsedMins = Math.floor(elapsedSeconds / 60);
    const elapsedSecs = elapsedSeconds % 60;
    const timeTakenFormatted = `${elapsedMins}m ${elapsedSecs}s`;

    const attemptSummary = {
      score: rawScore,
      totalMarks: totalQuestions * 5,
      percentage: percentage,
      status: passed ? 'Pass' : 'Fail',
      percentile: percentage >= 80 ? '96.4%ile' : percentage >= 60 ? '88.2%ile' : '62.1%ile',
      rank: percentage >= 80 ? 'AIR 28' : percentage >= 60 ? 'AIR 74' : 'AIR 182',
      correctCount,
      incorrectCount,
      unattemptedCount,
      accuracy: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
      timeTakenFormatted,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save to reactive service (updates both student dashboard and faculty results!)
    testService.submitStudentAttempt(test.id, attemptSummary);

    setResultData(attemptSummary);
    setViewState('result');
    window.scrollTo(0, 0);
  };

  const currentQ = questionsToUse[currentQuestionIndex];
  const isCurrentAnswered = Boolean(userAnswers[currentQ?.id]);
  const isCurrentMarked = Boolean(markedForReview[currentQ?.id]);

  // Toggle explanation accordion
  const toggleExplanation = (id) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* ===================================================================== */}
      {/* VIEW STATE 1: INSTRUCTIONS & READINESS CHECK                         */}
      {/* ===================================================================== */}
      {viewState === 'instructions' && (
        <div className="flex-grow flex flex-col justify-between p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Student Dashboard</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-600">
                Live Assessment Window Active
              </span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl space-y-8">
            
            {/* Header Badge & Title */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>NBE / NExT Proctored Examination Format</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {test.name}
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-500">
                Assigned Track: <strong className="text-slate-800">{test.course}</strong> • Batch: <strong className="text-slate-800">{test.batch}</strong>
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Total Questions</div>
                <div className="text-xl font-black text-slate-900 mt-1">{totalQuestions} Qs</div>
                <div className="text-[10px] text-slate-400">Clinical Vignettes</div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Total Marks</div>
                <div className="text-xl font-black text-slate-900 mt-1">{test.totalMarks} Marks</div>
                <div className="text-[10px] text-slate-400">5 Marks / Question</div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Allocated Time</div>
                <div className="text-xl font-black text-amber-600 mt-1">{test.duration}</div>
                <div className="text-[10px] text-slate-400">Continuous Clock</div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Negative Marking</div>
                <div className="text-xl font-black text-rose-600 mt-1">-1 Mark</div>
                <div className="text-[10px] text-slate-400">For Incorrect Answer</div>
              </div>
            </div>

            {/* Detailed Instructions */}
            <div className="space-y-4 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>General Candidate Examination Instructions</span>
              </h3>

              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed list-disc list-inside">
                {test.instructions?.map((inst, i) => (
                  <li key={i} className="text-slate-600">
                    {inst}
                  </li>
                ))}
              </ul>
            </div>

            {/* Candidate Verification Card */}
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80" 
                  alt="Candidate" 
                  className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Candidate: Dr. Ritik Saini</div>
                  <div className="text-[11px] text-indigo-700">Roll No: MEDPREP-2026-NEET-0428 • Proctored Session ID: #8841</div>
                </div>
              </div>

              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5 self-start sm:self-center">
                <CheckCircle2 className="w-4 h-4" />
                <span>Camera & System Check Passed</span>
              </div>
            </div>

            {/* Start Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                Clicking <strong>"Start Examination"</strong> will initiate the 45-minute countdown clock.
              </div>

              <button
                onClick={handleStartTest}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start Examination Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW STATE 2: ACTIVE CBT TEST-TAKING SCREEN                          */}
      {/* ===================================================================== */}
      {viewState === 'taking' && (
        <div className="flex-grow flex flex-col h-screen overflow-hidden bg-slate-100">
          
          {/* Top Exam Header */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                CBT Mode
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate max-w-xs sm:max-w-md">
                  {test.name}
                </h2>
                <div className="text-[11px] text-slate-500">
                  Candidate: Dr. Ritik Saini (Seat: MEDPREP-0428)
                </div>
              </div>
            </div>

            {/* Center / Right controls */}
            <div className="flex items-center gap-3 sm:gap-6">
              
              {/* Live Countdown Timer */}
              <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-800 font-mono font-bold text-xs sm:text-sm shadow-xs">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>{formatTime(secondsRemaining)} remaining</span>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Test</span>
              </button>
            </div>
          </header>

          {/* Two-Column Exam Workspace */}
          <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
            
            {/* Left Column: Question & Options (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 flex flex-col justify-between bg-slate-50">
              
              <div className="max-w-3xl w-full mx-auto space-y-6">
                
                {/* Question Status Bar */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Marks: +5 | -1
                    </span>
                  </div>

                  {/* Mark for Review Toggle */}
                  <button
                    onClick={() => handleToggleReview(currentQ.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                      isCurrentMarked
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isCurrentMarked ? 'fill-amber-600 text-amber-600' : ''}`} />
                    <span>{isCurrentMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>
                </div>

                {/* Clinical Vignette Box */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="text-xs text-indigo-700 font-bold uppercase tracking-wider">
                    Clinical Scenario
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {currentQ.vignette}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                    {currentQ.question}
                  </p>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500">
                    Select one option:
                  </div>

                  {currentQ.options.map((opt) => {
                    const isSelected = userAnswers[currentQ.id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption(currentQ.id, opt.key)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-blue-50 border-brand-500 text-slate-900 shadow-sm ring-1 ring-brand-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {opt.key}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-snug">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Bottom Action Controls */}
              <div className="max-w-3xl w-full mx-auto pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {isCurrentAnswered && (
                    <button
                      onClick={() => handleClearResponse(currentQ.id)}
                      className="px-3 py-2 text-slate-500 hover:text-rose-600 text-xs font-semibold rounded-xl transition-all flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Choice</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Review & Submit</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Question Palette Sidebar */}
            <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between shrink-0 p-5 overflow-y-auto">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4 text-indigo-600" />
                    <span>Question Palette</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono font-bold">
                    {answeredCount}/{totalQuestions} Done
                  </span>
                </div>

                {/* Palette Legend */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-600 shrink-0" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0" />
                    <span>Review ({markedCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300 shrink-0" />
                    <span>Unanswered ({unansweredCount})</span>
                  </div>
                </div>

                {/* Question Button Grid */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {questionsToUse.map((q, idx) => {
                    const isAnswered = Boolean(userAnswers[q.id]);
                    const isMarked = Boolean(markedForReview[q.id]);
                    const isCurrent = idx === currentQuestionIndex;

                    let bgClass = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
                    if (isAnswered) {
                      bgClass = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                    }
                    if (isMarked) {
                      bgClass = 'bg-amber-500 text-white border-amber-500';
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-9 rounded-xl text-xs font-bold border transition-all flex items-center justify-center relative ${bgClass} ${
                          isCurrent ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white' : ''
                        }`}
                      >
                        {idx + 1}
                        {isMarked && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Palette Card */}
              <div className="pt-4 border-t border-slate-100 space-y-2 mt-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <div className="font-bold text-slate-800">Exam Window Notice</div>
                  <p className="leading-snug">Answers are saved in real time. You may review and update questions any time before submitting.</p>
                </div>
              </div>

            </div>

          </div>

          {/* Submission Confirmation Popup Modal */}
          {isSubmitModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-6 text-slate-900">
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Submit Examination?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to finalize and submit your test? Once confirmed, your answers will be evaluated immediately.
                  </p>
                </div>

                {/* Summary Table */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Total Examination Questions:</span>
                    <strong className="text-slate-900">{totalQuestions}</strong>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Questions Answered:</span>
                    <strong className="text-emerald-800">{answeredCount}</strong>
                  </div>
                  <div className="flex items-center justify-between text-amber-700">
                    <span>Marked for Review:</span>
                    <strong className="text-amber-800">{markedCount}</strong>
                  </div>
                  <div className="flex items-center justify-between text-rose-700">
                    <span>Unattempted Questions:</span>
                    <strong className="text-rose-800">{unansweredCount}</strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Return to Exam
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Submit</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW STATE 3: TEST RESULT SCREEN & ANSWER REVIEW                     */}
      {/* ===================================================================== */}
      {viewState === 'result' && resultData && (
        <div className="flex-grow p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Examination Completed Successfully</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {test.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Candidate: <strong>Dr. Ritik Saini</strong> • Submitted at: {resultData.submittedAt}
                </p>
              </div>

              {/* Status Badge */}
              <div className={`px-5 py-2.5 rounded-2xl border text-center font-black text-base self-start sm:self-center ${
                resultData.status === 'Pass'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                  : 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
              }`}>
                {resultData.status === 'Pass' ? 'PASSED' : 'NEEDS IMPROVEMENT'}
              </div>
            </div>

            {/* Score Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-gradient-to-tr from-brand-50 to-indigo-50/80 rounded-2xl p-6 border border-brand-200 text-center space-y-1">
                <div className="text-xs font-bold text-brand-700">Total Score</div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">
                  {resultData.score} <span className="text-lg text-slate-500 font-normal">/ {resultData.totalMarks}</span>
                </div>
                <div className="text-xs font-bold text-brand-600">
                  Percentage: {resultData.percentage}%
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-1">
                <div className="text-xs font-semibold text-slate-500">National Benchmark</div>
                <div className="text-4xl font-black text-amber-600 tracking-tight">
                  {resultData.percentile}
                </div>
                <div className="text-xs font-bold text-slate-700">
                  Predicted Rank: {resultData.rank}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-1">
                <div className="text-xs font-semibold text-slate-500">Pacing & Accuracy</div>
                <div className="text-4xl font-black text-indigo-600 tracking-tight">
                  {resultData.accuracy}%
                </div>
                <div className="text-xs font-bold text-slate-700">
                  Time Taken: {resultData.timeTakenFormatted}
                </div>
              </div>

            </div>

            {/* Question Breakdown Bars */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-center">
                <div className="text-emerald-700 font-black text-lg">{resultData.correctCount}</div>
                <div className="text-[11px] text-emerald-800 font-semibold">Correct (+5 ea)</div>
              </div>

              <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 text-center">
                <div className="text-rose-700 font-black text-lg">{resultData.incorrectCount}</div>
                <div className="text-[11px] text-rose-800 font-semibold">Incorrect (-1 ea)</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-700 font-black text-lg">{resultData.unattemptedCount}</div>
                <div className="text-[11px] text-slate-500 font-semibold">Unattempted</div>
              </div>
            </div>

            {/* Next Steps CTA Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                This attempt has been recorded in your student dashboard and faculty assessment roster.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button>

                <button
                  onClick={() => navigate('/faculty')}
                  className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>View in Faculty Results</span>
                </button>
              </div>
            </div>

          </div>

          {/* ================================================================= */}
          {/* SECTION: REVIEW ANSWERS MODE                                      */}
          {/* ================================================================= */}
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>Comprehensive Answer Review & Explanations</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed rationale and high-yield pearls authored by AIIMS Cardiology Faculty.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-center text-xs">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    reviewFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({totalQuestions})
                </button>
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    reviewFilter === 'correct' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Correct ({resultData.correctCount})
                </button>
                <button
                  onClick={() => setReviewFilter('incorrect')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    reviewFilter === 'incorrect' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Incorrect ({resultData.incorrectCount})
                </button>
              </div>
            </div>

            {/* Questions Review List */}
            <div className="space-y-4">
              {questionsToUse
                .filter((q) => {
                  const chosen = userAnswers[q.id];
                  if (reviewFilter === 'correct') return chosen === q.correct;
                  if (reviewFilter === 'incorrect') return chosen && chosen !== q.correct;
                  return true;
                })
                .map((q, idx) => {
                  const chosen = userAnswers[q.id];
                  const isCorrect = chosen === q.correct;
                  const isUnattempted = !chosen;
                  const isExpanded = expandedExplanations[q.id] ?? true;

                  return (
                    <div 
                      key={q.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm"
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                            Question #{q.id}
                          </span>

                          {isCorrect ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Correct (+5)</span>
                            </span>
                          ) : isUnattempted ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Unattempted (0)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <X className="w-3 h-3 text-rose-600" />
                              <span>Incorrect (-1)</span>
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => toggleExplanation(q.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'Hide Explanation' : 'View Explanation'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Vignette & Question */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {q.vignette}
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {q.question}
                      </p>

                      {/* Options Grid */}
                      <div className="space-y-2 pt-2">
                        {q.options.map((opt) => {
                          const isOptionCorrect = opt.key === q.correct;
                          const isOptionChosen = chosen === opt.key;

                          let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                          if (isOptionCorrect) {
                            optionStyle = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold';
                          } else if (isOptionChosen && !isOptionCorrect) {
                            optionStyle = 'bg-rose-50 border-rose-300 text-rose-950 font-semibold';
                          }

                          return (
                            <div 
                              key={opt.key}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-colors ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isOptionCorrect 
                                    ? 'bg-emerald-600 text-white' 
                                    : isOptionChosen 
                                    ? 'bg-rose-600 text-white' 
                                    : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {opt.key}
                                </span>
                                <span>{opt.text}</span>
                              </div>

                              <div className="shrink-0 text-[11px] font-bold">
                                {isOptionCorrect && (
                                  <span className="text-emerald-700 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Correct Answer</span>
                                  </span>
                                )}
                                {isOptionChosen && !isOptionCorrect && (
                                  <span className="text-rose-700 flex items-center gap-1">
                                    <X className="w-3.5 h-3.5" />
                                    <span>Your Selection</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Callout */}
                      {isExpanded && (
                        <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-1.5 text-xs">
                          <div className="text-indigo-900 font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Clinical Explanation & High-Yield Pearl:</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}

                    </div>
                  );
                })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
