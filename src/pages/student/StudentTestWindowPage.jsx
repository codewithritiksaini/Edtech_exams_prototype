import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Flag, 
  CheckCircle2, 
  RotateCcw, 
  Send, 
  AlertTriangle, 
  Award, 
  FileText, 
  X, 
  LogOut, 
  ShieldCheck, 
  Check, 
  Sparkles,
  HelpCircle,
  AlertCircle,
  Layers,
  Pause,
  Play,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { testPresentationService } from '../../services/testPresentationService.js';
import { testAttemptService } from '../../services/testAttemptService.js';
import { authService } from '../../services/authService.js';
import QuestionRenderer from '../../components/common/QuestionRenderer.jsx';
import QuestionPalette from '../../components/common/QuestionPalette.jsx';

export default function StudentTestWindowPage() {
  const params = useParams();
  const testId = params.testId || params.id;
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const currentStudentId = currentUser?.id || 'student-ritik';
  const studentName = currentUser?.name || 'Dr. Ritik Saini (Candidate)';

  const [test, setTest] = useState(null);
  const [deliveryModel, setDeliveryModel] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  // Guards for async event listeners
  const isSubmittingRef = useRef(false);
  const isPausedRef = useRef(false);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // 1. Load Test and Delivery Model with Consent Enforcement
  useEffect(() => {
    setIsLoading(true);
    try {
      const resolved = testPresentationService.getTestById(testId);
      if (resolved) {
        setTest(resolved);
        const model = testPresentationService.getTestDeliveryModel(resolved);
        setDeliveryModel(model);

        // Check if student has an attempt with valid consent
        const currentAttempt = testAttemptService.getAttempt(resolved.id, currentStudentId);
        if (!currentAttempt || !currentAttempt.consent) {
          // Gatekeeper: Student cannot enter test without instructions & consent!
          navigate(`/student/tests/${resolved.id}/start`, { replace: true });
          return;
        }

        setAttempt(currentAttempt);
        if (currentAttempt.status === 'PAUSED') {
          setIsPaused(true);
        }
      }
    } catch (e) {
      console.error('[StudentTestWindowPage] Error loading test:', e);
    } finally {
      setIsLoading(false);
    }
  }, [testId, currentStudentId, navigate]);

  // 2. Active Question & Navigation Data
  const questions = deliveryModel?.questions || [];
  const sections = deliveryModel?.sections || [];
  const navigationRules = deliveryModel?.navigation || { mode: 'FREE', allowBackNavigation: true, allowSkip: true };
  const currentIdx = attempt?.currentQuestionIndex || 0;
  const currentQ = questions[currentIdx] || null;

  // 3. Live Countdown Timer (Driven by test.rules.timing, frozen if paused)
  useEffect(() => {
    if (!attempt || attempt.status !== 'IN_PROGRESS' || isPaused) return;

    const timer = setInterval(() => {
      setAttempt(prev => {
        if (!prev || prev.status !== 'IN_PROGRESS' || isPausedRef.current) return prev;
        const nextRemaining = Math.max(0, prev.remainingSeconds - 1);
        testAttemptService.updateTimer(testId, nextRemaining, currentStudentId);

        // Auto-Submit on Timer Expiry
        if (nextRemaining === 0) {
          clearInterval(timer);
          isSubmittingRef.current = true;
          const submitted = testAttemptService.submitAttempt(testId, 'TIME_EXPIRED', test, currentStudentId);
          setIsSubmitModalOpen(false);
          return submitted;
        }

        return {
          ...prev,
          remainingSeconds: nextRemaining
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testId, currentStudentId, attempt?.status, isPaused, test]);

  // 4. Tab / Window Focus & Visibility Monitoring Engine
  useEffect(() => {
    if (!attempt || attempt.status !== 'IN_PROGRESS' || isPaused) return;

    const handleVisibilityViolation = (triggerType) => {
      // Guard: do not trigger if explicitly paused, already submitting, or not in progress
      if (isPausedRef.current || isSubmittingRef.current) return;
      const cur = testAttemptService.getAttempt(testId, currentStudentId);
      if (!cur || cur.status !== 'IN_PROGRESS') return;

      isSubmittingRef.current = true;
      console.warn(`[StudentTestWindowPage] Monitoring violation detected via ${triggerType}. Auto-submitting assessment.`);

      testAttemptService.recordViolation(testId, currentStudentId, {
        trigger: triggerType,
        visibilityState: typeof document !== 'undefined' ? document.visibilityState : 'unknown',
        detectedAt: new Date().toISOString()
      });

      const autoSubmitted = testAttemptService.submitAttempt(testId, 'TAB_OR_WINDOW_VIOLATION', test, currentStudentId);
      setIsSubmitModalOpen(false);
      setAttempt({ ...autoSubmitted });
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        handleVisibilityViolation('document_visibility_hidden');
      }
    };

    const handleBlur = () => {
      handleVisibilityViolation('window_blur');
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('blur', handleBlur);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('blur', handleBlur);
      }
    };
  }, [testId, currentStudentId, attempt?.status, isPaused, test]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const formatClock = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 5. Pause / Resume Handlers
  const handlePauseExam = () => {
    if (attempt?.status !== 'IN_PROGRESS') return;
    const paused = testAttemptService.pauseAttempt(testId, currentStudentId);
    setAttempt({ ...paused });
    setIsPaused(true);
    showToast('Assessment paused. Timer frozen.');
  };

  const handleResumeExam = () => {
    const resumed = testAttemptService.resumeAttempt(testId, currentStudentId);
    setAttempt({ ...resumed });
    setIsPaused(false);
    showToast('Assessment resumed. Timer active.');
  };

  // 6. Candidate Question Interaction Handlers
  const handleAnswerChange = (val) => {
    if (!currentQ || attempt?.status !== 'IN_PROGRESS' || isPaused) return;
    const updated = testAttemptService.saveAnswer(testId, currentQ.id, val, currentStudentId);
    setAttempt({ ...updated });
  };

  const handleClearAnswer = () => {
    if (!currentQ || attempt?.status !== 'IN_PROGRESS' || isPaused) return;
    const updated = testAttemptService.clearAnswer(testId, currentQ.id, currentStudentId);
    setAttempt({ ...updated });
  };

  const handleToggleMark = () => {
    if (!currentQ || attempt?.status !== 'IN_PROGRESS' || isPaused) return;
    const updated = testAttemptService.toggleMarkForReview(testId, currentQ.id, currentStudentId);
    setAttempt({ ...updated });
  };

  const handleSelectQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length || attempt?.status !== 'IN_PROGRESS' || isPaused) return;

    // Navigation Rule: Check if skip is restricted
    if (!navigationRules.allowSkip && idx > currentIdx) {
      const isAnswered = attempt.answers[currentQ?.id] !== undefined;
      if (!isAnswered) {
        showToast('Rule constraint: You must answer this question before advancing.');
        return;
      }
    }

    const updated = testAttemptService.setQuestionIndex(testId, idx, currentStudentId);
    const targetQ = questions[idx];
    if (targetQ) {
      testAttemptService.recordVisit(testId, targetQ.id, currentStudentId);
    }
    setAttempt({ ...updated });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      handleSelectQuestion(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      // Navigation Rule: Check if back navigation is permitted
      if (!navigationRules.allowBackNavigation) {
        showToast('Rule constraint: Backward navigation is restricted for this examination.');
        return;
      }
      handleSelectQuestion(currentIdx - 1);
    }
  };

  const handleConfirmSubmit = () => {
    isSubmittingRef.current = true;
    const finalized = testAttemptService.submitAttempt(testId, 'STUDENT_SUBMITTED', test, currentStudentId);
    setAttempt(finalized);
    setIsSubmitModalOpen(false);
  };

  // Metrics for submit modal and review
  const answers = attempt?.answers || {};
  const markedList = attempt?.markedForReview || [];
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedList.length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const isCurrentMarked = currentQ ? markedList.includes(currentQ.id) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Preparing Examination Environment...</p>
        </div>
      </div>
    );
  }

  if (!test || !deliveryModel) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 text-center max-w-md space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold">Assessment Not Found</h3>
          <p className="text-xs text-slate-400">
            This examination is not available or has expired.
          </p>
          <Link
            to="/student/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Tests Directory
          </Link>
        </div>
      </div>
    );
  }

  // 5. Submitted State: Scorecard & Result Presentation
  const isSubmitted = attempt?.status === 'COMPLETED' || attempt?.status === 'AUTO_SUBMITTED' || attempt?.status === 'SUBMITTED';
  if (isSubmitted) {
    const summary = attempt.scoringSummary || {};
    const isViolation = attempt.submissionReason === 'TAB_OR_WINDOW_VIOLATION';
    const isTimeout = attempt.submissionReason === 'TIME_EXPIRED';

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 animate-fadeIn text-slate-100">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            {isViolation ? (
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                <ShieldAlert className="w-8 h-8" />
              </div>
            ) : isTimeout ? (
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <Clock className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            )}

            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
              isViolation 
                ? 'bg-rose-950/80 text-rose-400 border-rose-800/80'
                : isTimeout
                  ? 'bg-amber-950/80 text-amber-400 border-amber-800/80'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
            }`}>
              {isViolation ? 'Test Automatically Submitted' : isTimeout ? 'Test Time Expired' : 'Test Submitted Successfully'}
            </span>

            <h2 className="text-2xl font-black text-white">
              {deliveryModel.testName}
            </h2>
            <p className="text-xs text-slate-400">
              Candidate: <strong>{studentName}</strong> • Submitted: {new Date(attempt.submittedAt).toLocaleTimeString()}
            </p>
          </div>

          {/* Explicit Violation Notice Box */}
          {isViolation && (
            <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-xs space-y-1.5 text-rose-200">
              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Reason: Test window/tab violation detected.</span>
              </div>
              <p className="text-rose-200 leading-relaxed text-[11px]">
                Your assessment was automatically submitted because an unauthorized tab switch, window minimization, or focus change was detected. Your recorded answers up to that moment have been finalized.
              </p>
            </div>
          )}

          {/* Explicit Time Expiry Notice Box */}
          {isTimeout && (
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs space-y-1.5 text-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Reason: Configured examination duration ended.</span>
              </div>
              <p className="text-amber-200 leading-relaxed text-[11px]">
                Your assessment was automatically submitted because the allotted countdown time reached zero.
              </p>
            </div>
          )}

          {/* Score Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Score</span>
              <span className="text-xl font-black text-white">{summary.totalScore} / {summary.maxMarks}</span>
            </div>
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Correct</span>
              <span className="text-xl font-black text-emerald-400">{summary.correctCount}</span>
            </div>
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">Incorrect</span>
              <span className="text-xl font-black text-rose-400">{summary.incorrectCount}</span>
            </div>
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block">Percentage</span>
              <span className="text-xl font-black text-cyan-400">{summary.percentage}%</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Questions Answered:</span>
              <strong className="text-white font-mono">{summary.answeredCount} of {summary.totalQuestions}</strong>
            </div>
            <div className="flex justify-between">
              <span>Unanswered Questions:</span>
              <strong className="text-slate-300 font-mono">{summary.unansweredCount}</strong>
            </div>
            <div className="flex justify-between">
              <span>Submission Reason:</span>
              <strong className="text-cyan-400 font-mono text-[11px] uppercase">{attempt.submissionReason || 'STUDENT_SUBMITTED'}</strong>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {!isViolation && (
              <button
                type="button"
                onClick={() => {
                  testAttemptService.clearAttempt(testId, currentStudentId);
                  navigate(`/student/tests/${test.id}/start`);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                Retake Assessment
              </button>
            )}
            <Link
              to="/student/tests"
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              Back to Tests Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 6. Active Test Taking Window
  const remainingSeconds = attempt?.remainingSeconds ?? (deliveryModel.timing?.totalSeconds || 3600);
  const isTimeCritical = remainingSeconds <= 300; // < 5 mins

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold animate-fadeIn flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Full-Screen Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Pause className="w-8 h-8 fill-current" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/60">
                Assessment Paused
              </span>
              <h3 className="text-2xl font-black text-white">Timer is Currently Frozen</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Your recorded answers and session progress are preserved. Browser visibility monitoring is suspended while paused.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1.5 text-left">
              <div className="flex justify-between">
                <span>Time Remaining:</span>
                <strong className="font-mono text-cyan-400">{formatClock(remainingSeconds)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Questions Answered:</span>
                <strong className="font-mono text-white">{answeredCount} of {questions.length}</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResumeExam}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Assessment</span>
              </button>
              <Link
                to="/student/tests"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors text-center"
              >
                Exit to Directory
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Candidate-Facing Focused Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 shadow-md shrink-0 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              MP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                  {deliveryModel.testName}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Anti-Tab Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Candidate: <span className="text-slate-200 font-medium">{studentName}</span>
              </p>
            </div>
          </div>

          {/* Live Countdown Timer & Controls */}
          <div className="flex items-center gap-3">
            {/* Live Countdown Timer Display */}
            <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold transition-colors ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : isTimeCritical
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-100 border-slate-700'
            }`}>
              {isPaused ? <Pause className="w-4 h-4 text-amber-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
              <span>{formatClock(remainingSeconds)}</span>
              {isPaused && <span className="text-[10px] uppercase font-bold text-amber-400">(Paused)</span>}
            </div>

            {/* Pause Exam Button (when permitted) */}
            {test?.rules?.timing?.allowPause !== false && (
              <button
                type="button"
                onClick={isPaused ? handleResumeExam : handlePauseExam}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                  isPaused
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                }`}
                title={isPaused ? 'Resume assessment' : 'Pause examination and freeze countdown timer'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit Test</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Question Panel */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Question Sequence Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Question
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {currentIdx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    of {questions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {navigationRules.allowQuestionReview && (
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
                  )}

                  <button
                    type="button"
                    onClick={handleClearAnswer}
                    disabled={!answers[currentQ?.id]}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    Clear Response
                  </button>
                </div>
              </div>

              {/* Canonical Question Renderer in mode="student" */}
              <QuestionRenderer
                question={currentQ}
                value={currentQ ? answers[currentQ.id] : null}
                onChange={handleAnswerChange}
                mode="student"
              />

              {/* Step Navigation Bar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIdx === 0 || !navigationRules.allowBackNavigation}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIdx === questions.length - 1}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Palette */}
          <div className="lg:col-span-4 space-y-4">
            <QuestionPalette
              questions={questions}
              sections={sections}
              currentIndex={currentIdx}
              onSelectQuestion={handleSelectQuestion}
              answers={answers}
              markedForReview={markedList}
              visitedQuestionIds={attempt?.visitedQuestionIds || []}
              navigation={navigationRules}
              isStudent={true}
            />
          </div>
        </div>
      </main>

      {/* Candidate Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-brand-600" />
                Confirm Examination Submission
              </h3>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to conclude and submit your test? Here is your current attempt summary:
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

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong>Notice:</strong> Once submitted, your answers will be graded and you will not be able to modify your responses.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Confirm &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
