import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  LayoutGrid,
  AlertTriangle,
  Lock,
  Play,
  Pause,
  Save,
  LogOut
} from 'lucide-react';
import { 
  cbtTestService, 
  CBT_STATUS, 
  getTestStatus, 
  getTestTimes, 
  formatTestCountdown 
} from '../services/cbtTestService';
import { authService } from '../services/authService';
import { sampleCbtQuestionBank } from '../data/mockData';

export default function TestExperiencePage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const currentStudentId = currentUser?.id || 'student-ritik';

  // Reactive clock updating every 1s
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Retrieve test definition
  const [test, setTest] = useState(() => cbtTestService.getTestById(testId));
  const [attempt, setAttempt] = useState(() => cbtTestService.getActiveAttempt(testId, currentStudentId) || cbtTestService.getCompletedAttempt(testId, currentStudentId));

  // Sync with service updates
  useEffect(() => {
    const unsub = cbtTestService.subscribe(() => {
      setTest(cbtTestService.getTestById(testId));
      setAttempt(cbtTestService.getActiveAttempt(testId, currentStudentId) || cbtTestService.getCompletedAttempt(testId, currentStudentId));
    });
    return unsub;
  }, [testId, currentStudentId]);

  // Current view state: 'barrier' | 'instructions' | 'taking' | 'paused' | 'result'
  const isCompleted = attempt && attempt.status === CBT_STATUS.SUBMITTED;
  const isTaking = attempt && attempt.status === CBT_STATUS.IN_PROGRESS;
  const isPaused = attempt && attempt.status === CBT_STATUS.PAUSED;

  // Modals & UI states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unattempted'
  const [expandedExplanations, setExpandedExplanations] = useState({});
  const [isPaletteDrawerOpen, setIsPaletteDrawerOpen] = useState(false);

  // Tab switch counter (prototype integrity feature)
  useEffect(() => {
    if (!isTaking || isPaused) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cbtTestService.recordTabSwitch(testId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTaking, isPaused, testId]);

  // ===========================================================================
  // BROWSER BACK & NAVIGATION INTERCEPTION
  // Leaving an active test intercepts and offers Pause or Submit
  // ===========================================================================
  useEffect(() => {
    if (!isTaking) return;

    // Push state to trap Back button
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e) => {
      // Re-push state to stay on URL
      window.history.pushState(null, '', window.location.href);
      setIsLeaveModalOpen(true);
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Leaving the active examination will submit your current answers.';
      return e.returnValue;
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTaking]);

  // Questions to use - canonical resolution supporting Question Bank questionIds or inline items
  const questionsToUse = useMemo(() => {
    return cbtTestService.getQuestionsForTest(test || testId);
  }, [test, testId]);
  const totalQuestions = questionsToUse.length;

  // Active question index
  const currentQuestionIndex = attempt?.currentQuestionIndex || 0;
  const userAnswers = attempt?.answers || {};
  const markedForReview = attempt?.markedForReview || {};

  // Answer counts
  const answeredCount = Object.keys(userAnswers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  // Remaining time in seconds derived strictly from attempt.endAt or frozen attempt.remainingMs
  const remainingSeconds = useMemo(() => {
    if (!attempt) return 0;
    if (attempt.status === CBT_STATUS.PAUSED && typeof attempt.remainingMs === 'number') {
      return Math.max(0, Math.floor(attempt.remainingMs / 1000));
    }
    if (!attempt.endAt) return 0;
    return Math.max(0, Math.floor((attempt.endAt - now) / 1000));
  }, [attempt, now]);

  // Auto-submit when time expires (only while actively taking and NOT paused)
  useEffect(() => {
    if (isTaking && !isPaused && remainingSeconds <= 0) {
      const finalAttempt = cbtTestService.submitAttempt(test.id, 'time-expired');
      setAttempt(finalAttempt);
      setIsSubmitModalOpen(false);
      setIsLeaveModalOpen(false);
    }
  }, [isTaking, isPaused, remainingSeconds, test?.id]);

  const formatClock = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Actions
  const handleStartExam = () => {
    const newAttempt = cbtTestService.startAttempt(test.id, currentStudentId);
    setAttempt(newAttempt);
    window.scrollTo(0, 0);
  };

  const handleSelectOption = (optionKey) => {
    if (!isTaking) return;
    const currentQ = questionsToUse[currentQuestionIndex];
    cbtTestService.saveAnswer(test.id, currentQ.id, optionKey);
    setAttempt({ ...cbtTestService.getActiveAttempt(test.id) });
  };

  const handleClearResponse = () => {
    if (!isTaking) return;
    const currentQ = questionsToUse[currentQuestionIndex];
    cbtTestService.clearAnswer(test.id, currentQ.id);
    setAttempt({ ...cbtTestService.getActiveAttempt(test.id) });
  };

  const handleToggleReview = () => {
    if (!isTaking) return;
    const currentQ = questionsToUse[currentQuestionIndex];
    cbtTestService.toggleReview(test.id, currentQ.id);
    setAttempt({ ...cbtTestService.getActiveAttempt(test.id) });
  };

  const handleNavigateQuestion = (idx) => {
    if (idx < 0 || idx >= totalQuestions) return;
    cbtTestService.setCurrentQuestionIndex(test.id, idx);
    setAttempt({ ...cbtTestService.getActiveAttempt(test.id) });
    setIsPaletteDrawerOpen(false);
  };

  const handleFinalSubmit = () => {
    setIsSubmitModalOpen(false);
    const finalAttempt = cbtTestService.submitAttempt(test.id, 'normal');
    setAttempt(finalAttempt);
    window.scrollTo(0, 0);
  };

  const handlePauseExam = () => {
    const paused = cbtTestService.pauseAttempt(test.id);
    setAttempt({ ...paused });
  };

  const handleResumeExam = () => {
    const resumed = cbtTestService.resumeAttempt(test.id);
    setAttempt({ ...resumed });
  };

  const handlePauseAndExit = () => {
    cbtTestService.pauseAttempt(test.id);
    setIsLeaveModalOpen(false);
    navigate('/student/tests');
  };

  const handleConfirmLeaveAndSubmit = () => {
    setIsLeaveModalOpen(false);
    cbtTestService.submitAttempt(test.id, 'navigation-exit');
    navigate('/student/tests');
  };

  // If test doesn't exist
  if (!test) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Examination Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">The requested CBT test ID does not exist in the schedule.</p>
        <Link 
          to="/student/tests" 
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Test Series Schedule</span>
        </Link>
      </div>
    );
  }

  const status = getTestStatus(test, new Date(now));

  // ===========================================================================
  // SCREEN 1: DIRECT URL ROUTE BARRIER FOR UPCOMING TEST (NOT OPEN YET)
  // ===========================================================================
  if (status === CBT_STATUS.UPCOMING && !isTaking && !isPaused && !isCompleted) {
    const countdownText = formatTestCountdown(test, new Date(now));
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        {/* Sleek Dark Header */}
        <header className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/student/tests" className="flex items-center gap-2 text-white hover:text-brand-400 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white shadow-sm text-sm">
                🩺
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">MedPrep<span className="text-brand-400">Pro</span></span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-slate-400 truncate max-w-xs">CBT Examination Terminal</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/student/tests')}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Test Schedule</span>
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
            
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>Examination Scheduled • Not Open Yet</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {test.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                This timed examination is currently locked. The proctored CBT virtual examination hall opens strictly at the scheduled time.
              </p>
            </div>

            {/* Schedule Window Box */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Exam Window</p>
              <p className="text-base sm:text-lg font-bold text-brand-400">
                {test.formattedWindow || test.date}
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{countdownText}</span>
              </div>
            </div>

            {/* Test Specs */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <span>Duration: <strong className="text-white">{test.durationMinutes || 45} mins</strong></span>
              <span>•</span>
              <span>Questions: <strong className="text-white">{totalQuestions} Qs</strong></span>
              <span>•</span>
              <span>Marking: <strong className="text-white">+{test.marksPerCorrect || 5} / {test.marksPerIncorrect || -1}</strong></span>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => navigate('/student/tests')}
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to CBT Schedule</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              🔒 Direct URL access is protected. The examination terminal will unlock automatically when the start time arrives.
            </p>

          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 2: DIRECT URL ROUTE BARRIER FOR EXPIRED / CLOSED TEST
  // ===========================================================================
  if (status === CBT_STATUS.EXPIRED && !isTaking && !isPaused && !isCompleted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/student/tests" className="flex items-center gap-2 text-white hover:text-brand-400 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white shadow-sm text-sm">
                🩺
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">MedPrep<span className="text-brand-400">Pro</span></span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => navigate('/student/tests')}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Schedule</span>
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 opacity-40" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold uppercase tracking-wider">
                <span>Test Window Closed</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {test.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                The scheduled examination window for this test has ended. Candidates may no longer initiate new examination attempts.
              </p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
              Exam Window was: <strong className="text-white">{test.formattedWindow || test.date}</strong>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => navigate('/student/tests')}
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Browse Available Tests</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 3: INSTRUCTIONS / READINESS CHECK (BEFORE STARTING ATTEMPT)
  // ===========================================================================
  if (!isTaking && !isPaused && !isCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
        {/* Simple Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/student/tests')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Test Schedule</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-700">
              Live Examination Window Open
            </span>
          </div>
        </header>

        {/* Main Instructions Card */}
        <div className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl space-y-8">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>NBE / NExT Proctored Examination Format</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {test.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Track: <strong className="text-slate-800">{test.course}</strong> • Batch: <strong className="text-slate-800">{test.batch}</strong>
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Questions</div>
                <div className="text-xl font-black text-slate-900 mt-1">{totalQuestions} Qs</div>
                <div className="text-[10px] text-slate-400">Clinical Vignettes</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Duration</div>
                <div className="text-xl font-black text-amber-600 mt-1">{test.durationMinutes || 45} mins</div>
                <div className="text-[10px] text-slate-400">Continuous Clock</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Correct Mark</div>
                <div className="text-xl font-black text-emerald-600 mt-1">+{test.marksPerCorrect || 5}</div>
                <div className="text-[10px] text-slate-400">Per Question</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Negative Mark</div>
                <div className="text-xl font-black text-rose-600 mt-1">{test.marksPerIncorrect || -1}</div>
                <div className="text-[10px] text-slate-400">For Wrong Choice</div>
              </div>
            </div>

            {/* Examination Instructions */}
            <div className="space-y-4 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Candidate Instructions & Examination Rules</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc list-inside">
                {test.instructions?.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>

            {/* Candidate Verification Card */}
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  RS
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Candidate: Dr. Ritik Saini</div>
                  <div className="text-[11px] text-indigo-700">Roll No: MEDPREP-2026-NEET-0428 • Proctored Seat #18</div>
                </div>
              </div>

              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5 self-start sm:self-center">
                <CheckCircle2 className="w-4 h-4" />
                <span>System Readiness Verified</span>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                The continuous countdown timer begins immediately upon clicking <strong>Start Examination</strong>.
              </div>
              <button
                type="button"
                onClick={handleStartExam}
                className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-lg shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Start Examination Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 4: ACTIVE TIMED EXAMINATION MODE (FOCUSED CBT ENGINE)
  // ===========================================================================
  if (isTaking || isPaused) {
    const currentQ = questionsToUse[currentQuestionIndex] || questionsToUse[0];
    const isCurrentAnswered = Boolean(userAnswers[currentQ?.id]);
    const isCurrentMarked = Boolean(markedForReview[currentQ?.id]);

    const isTimerLow = remainingSeconds < 600; // < 10 mins
    const isTimerWarning = remainingSeconds < 300; // < 5 mins
    const isTimerCritical = remainingSeconds < 60; // < 1 min

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none relative">
        
        {/* Urgent Timer Warning Banner (at < 5 mins, only when active) */}
        {!isPaused && isTimerWarning && (
          <div className="bg-rose-600 text-white px-4 py-1.5 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 animate-pulse shrink-0">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {isTimerCritical ? 'CRITICAL: Less than 1 minute remaining! Examination will auto-submit soon.' : 'WARNING: Under 5 minutes remaining in your examination!'}
            </span>
          </div>
        )}

        {/* Dedicated CBT Header (No Distractions) */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-md">
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              isPaused ? 'bg-amber-500 text-slate-950' : 'bg-brand-600 text-white'
            }`}>
              {isPaused ? 'PAUSED' : 'CBT EXAM MODE'}
            </div>
            <div className="hidden sm:block">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {test.name}
              </h2>
              <div className="text-[10px] text-slate-400">
                Dr. Ritik Saini (MEDPREP-0428)
              </div>
            </div>
          </div>

          {/* Center / Right controls: Timer + Pause/Resume + Palette + Submit + Exit */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Persistent Countdown Timer (Frozen if Paused) */}
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg font-mono font-black text-xs sm:text-sm shadow-xs border transition-colors ${
              isPaused
                ? 'bg-amber-950/80 text-amber-300 border-amber-500 ring-1 ring-amber-500/50'
                : isTimerWarning
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse'
                  : isTimerLow
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                    : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}>
              {isPaused ? (
                <Pause className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{formatClock(remainingSeconds)} {isPaused ? '(Paused)' : 'left'}</span>
            </div>

            {/* Pause / Resume Button */}
            {isPaused ? (
              <button
                type="button"
                onClick={handleResumeExam}
                className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Resume examination and restart countdown"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Resume Exam</span>
                <span className="sm:hidden">Resume</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseExam}
                className="px-3.5 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs rounded-lg border border-slate-700 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Pause examination and freeze countdown timer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pause Test</span>
                <span className="sm:hidden">Pause</span>
              </button>
            )}

            {/* Question Palette Mobile Toggle */}
            <button
              onClick={() => setIsPaletteDrawerOpen(!isPaletteDrawerOpen)}
              className="lg:hidden px-3 py-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Palette</span>
            </button>

            {/* In-App Submit Button */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Submit Test</span>
              <span className="sm:hidden">Submit</span>
            </button>

            {/* In-App Exit Button (Invokes Navigation Interception) */}
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Exit Examination"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Two-Column Exam Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Column: Question & Options */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 flex flex-col justify-between bg-slate-50">
            <div className="max-w-3xl w-full mx-auto space-y-6">
              
              {/* Question Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-brand-700 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Marks: +{test.marksPerCorrect || 5} | {test.marksPerIncorrect || -1}
                  </span>
                </div>

                {/* Mark for Review Button */}
                <button
                  onClick={handleToggleReview}
                  className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                    isCurrentMarked
                      ? 'bg-amber-100 text-amber-900 border border-amber-400 font-bold shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isCurrentMarked ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} />
                  <span>{isCurrentMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Question Vignette Box */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="text-[10px] font-black text-brand-700 uppercase tracking-wider">
                  Clinical Vignette
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
                  Select your answer:
                </div>

                {currentQ.options?.map((opt) => {
                  const isSelected = userAnswers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-brand-500 text-slate-900 shadow-sm ring-2 ring-brand-500/30'
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

            {/* Bottom Question Action Controls */}
            <div className="max-w-3xl w-full mx-auto pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => handleNavigateQuestion(currentQuestionIndex - 1)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {isCurrentAnswered && (
                  <button
                    onClick={handleClearResponse}
                    className="px-3 py-2.5 text-slate-500 hover:text-rose-600 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Response</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() => handleNavigateQuestion(currentQuestionIndex + 1)}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Save & Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Review & Submit</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Question Palette (Desktop Sidebar + Mobile Drawer) */}
          <div className={`w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between shrink-0 p-5 overflow-y-auto ${
            isPaletteDrawerOpen ? 'block fixed inset-0 z-50 lg:static' : 'hidden lg:flex'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-indigo-600" />
                  <span>Question Palette</span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono font-bold">
                    {answeredCount}/{totalQuestions} Done
                  </span>
                  <button 
                    onClick={() => setIsPaletteDrawerOpen(false)}
                    className="lg:hidden p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
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

              {/* Palette Grid */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {questionsToUse.map((q, idx) => {
                  const isAns = Boolean(userAnswers[q.id]);
                  const isMrk = Boolean(markedForReview[q.id]);
                  const isCur = idx === currentQuestionIndex;

                  let bgClass = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
                  if (isAns) bgClass = 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-black';
                  if (isMrk) bgClass = 'bg-amber-500 text-white border-amber-500 font-black';

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleNavigateQuestion(idx)}
                      className={`h-9 rounded-lg text-xs font-bold border transition-all flex items-center justify-center relative cursor-pointer ${bgClass} ${
                        isCur ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white' : ''
                      }`}
                    >
                      {idx + 1}
                      {isMrk && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Persistence Notice */}
            <div className="pt-4 border-t border-slate-100 space-y-2 mt-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto-Save Enabled</span>
                </div>
                <p className="leading-snug">Answers are saved in real-time. Refreshing the browser will resume without timer loss.</p>
              </div>
            </div>
          </div>

        </div>

        {/* ===================================================================== */}
        {/* MODAL 1: SUBMISSION CONFIRMATION WITH UNANSWERED WARNING              */}
        {/* ===================================================================== */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95 text-slate-900">
              
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Submit Examination?
                    </h3>
                    <p className="text-xs text-slate-400">Final evaluation confirmation</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Unanswered Questions Warning */}
              {unansweredCount > 0 ? (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Unanswered Questions Alert</span>
                  </div>
                  <p className="text-[11px] font-normal leading-relaxed text-rose-800">
                    You still have <strong>{unansweredCount} unanswered questions</strong> out of {totalQuestions}. Are you sure you want to finalize now?
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  You have answered all {totalQuestions} questions. Once submitted, your examination will be evaluated immediately.
                </p>
              )}

              {/* Metric Breakdown Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Total Examination Questions:</span>
                  <strong className="text-slate-900">{totalQuestions}</strong>
                </div>
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Answered:</span>
                  <strong className="text-emerald-800 font-black">{answeredCount}</strong>
                </div>
                <div className="flex items-center justify-between text-amber-700">
                  <span>Marked for Review:</span>
                  <strong className="text-amber-800 font-black">{markedCount}</strong>
                </div>
                <div className="flex items-center justify-between text-rose-700">
                  <span>Unanswered:</span>
                  <strong className="text-rose-800 font-black">{unansweredCount}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Return to Exam
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Submit</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* MODAL 2: BROWSER BACK / NAVIGATION INTERCEPTION LEAVE CONFIRMATION   */}
        {/* ===================================================================== */}
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95 text-slate-900">
              
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Exit Examination?
                  </h3>
                  <p className="text-xs text-slate-500">Choose how to preserve your progress</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                You can <strong>pause your test</strong> to freeze the countdown timer and resume later, or <strong>submit permanently</strong> for evaluation.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Questions Answered So Far:</span>
                  <strong className="text-slate-900">{answeredCount} of {totalQuestions}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Time Remaining:</span>
                  <strong className="font-mono text-amber-600">{formatClock(remainingSeconds)}</strong>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handlePauseAndExit}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Test & Return to Schedule</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLeaveModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Stay in Test
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLeaveAndSubmit}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Submit & Exit
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* OVERLAY: EXAMINATION PAUSED OVERLAY                                    */}
        {/* Suspends view of questions to protect exam integrity while paused     */}
        {/* ===================================================================== */}
        {isPaused && (
          <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 text-slate-900">
              
              <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Pause className="w-8 h-8 fill-current" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                  <span>Examination Paused</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Countdown Timer Frozen
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Your examination countdown has been frozen at <strong className="font-mono font-bold text-slate-900">{formatClock(remainingSeconds)}</strong>. All your answers and review flags are securely preserved.
                </p>
              </div>

              {/* Status Snapshot Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Answered</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">{answeredCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Review</div>
                  <div className="text-base font-black text-amber-600 mt-0.5">{markedCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Unanswered</div>
                  <div className="text-base font-black text-rose-600 mt-0.5">{unansweredCount}</div>
                </div>
              </div>

              {/* Security & Integrity Notice */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-800 flex items-center gap-2 text-left">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Question vignettes are veiled while paused to uphold CBT exam integrity.</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResumeExam}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Examination Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/student/tests')}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Save & Return to Schedule</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // ===========================================================================
  // SCREEN 5: COMPLETED TEST RESULT & READ-ONLY ANSWER REVIEW
  // ===========================================================================
  if (isCompleted) {
    const resultData = attempt;
    const passed = resultData.statusLabel === 'Pass' || resultData.percentage >= 50;

    // Filter review questions
    const filteredReviewQuestions = questionsToUse.filter((q) => {
      const chosen = userAnswers[q.id];
      if (reviewFilter === 'correct') return chosen === q.correct;
      if (reviewFilter === 'incorrect') return chosen && chosen !== q.correct;
      if (reviewFilter === 'unattempted') return !chosen;
      return true;
    });

    const toggleExplanation = (id) => {
      setExpandedExplanations(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pb-16">
        
        {/* Top Result Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between">
          <Link
            to="/student/tests"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Test Series Schedule</span>
          </Link>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Read-Only Review Mode
          </span>
        </header>

        <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Examination Submitted Successfully</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {test.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Candidate: <strong>Dr. Ritik Saini</strong> • Submitted at: {resultData.submittedAt}
                  {resultData.submissionReason === 'time-expired' && (
                    <span className="ml-2 text-amber-700 font-bold">(Auto-submitted on time expiration)</span>
                  )}
                  {resultData.submissionReason === 'navigation-exit' && (
                    <span className="ml-2 text-rose-700 font-bold">(Submitted on window exit)</span>
                  )}
                </p>
              </div>

              {/* Status Badge */}
              <div className={`px-5 py-2.5 rounded-2xl border text-center font-black text-base self-start sm:self-center ${
                passed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                  : 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
              }`}>
                {passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
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
                  {resultData.percentile || '94.2%ile'}
                </div>
                <div className="text-xs font-bold text-slate-700">
                  Predicted Rank: {resultData.rank || 'AIR 42'}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-1">
                <div className="text-xs font-semibold text-slate-500">Pacing & Accuracy</div>
                <div className="text-4xl font-black text-indigo-600 tracking-tight">
                  {resultData.accuracy}%
                </div>
                <div className="text-xs font-bold text-slate-700">
                  Time Taken: {resultData.timeTakenFormatted || '41m 15s'}
                </div>
              </div>
            </div>

            {/* Question Breakdown Bars */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-center">
                <div className="text-emerald-700 font-black text-lg">{resultData.correctCount}</div>
                <div className="text-[11px] text-emerald-800 font-semibold">Correct (+{test.marksPerCorrect || 5} ea)</div>
              </div>
              <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 text-center">
                <div className="text-rose-700 font-black text-lg">{resultData.incorrectCount}</div>
                <div className="text-[11px] text-rose-800 font-semibold">Incorrect ({test.marksPerIncorrect || -1} ea)</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-700 font-black text-lg">{resultData.unattemptedCount}</div>
                <div className="text-[11px] text-slate-500 font-semibold">Unattempted</div>
              </div>
            </div>

            {/* CTA Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                This examination result has been recorded into your academic transcript and faculty cohort analytics.
              </div>
              <Link
                to="/student/tests"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Back to All Tests</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

          {/* =================================================================== */}
          {/* READ-ONLY REVIEW SECTION WITH CLINICAL EXPLANATIONS                 */}
          {/* =================================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Question-by-Question Clinical Review
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed rationale and differential diagnostic pearls
                </p>
              </div>

              {/* Review Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    reviewFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({totalQuestions})
                </button>
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    reviewFilter === 'correct' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Correct ({resultData.correctCount})
                </button>
                <button
                  onClick={() => setReviewFilter('incorrect')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    reviewFilter === 'incorrect' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Incorrect ({resultData.incorrectCount})
                </button>
                <button
                  onClick={() => setReviewFilter('unattempted')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    reviewFilter === 'unattempted' ? 'bg-white text-slate-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Unattempted ({resultData.unattemptedCount})
                </button>
              </div>
            </div>

            {/* Question Review List */}
            <div className="space-y-6">
              {filteredReviewQuestions.map((q) => {
                const chosen = userAnswers[q.id];
                const isCorrect = chosen === q.correct;
                const isUnattempted = !chosen;
                const isExpanded = expandedExplanations[q.id];

                return (
                  <div 
                    key={q.id}
                    className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        Question #{q.id}
                      </span>

                      {isCorrect ? (
                        <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Correct (+{test.marksPerCorrect || 5})</span>
                        </span>
                      ) : isUnattempted ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                          Unattempted (0)
                        </span>
                      ) : (
                        <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" />
                          <span>Incorrect ({test.marksPerIncorrect || -1})</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {q.vignette}
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {q.question}
                      </p>
                    </div>

                    {/* Options Review */}
                    <div className="space-y-2 pt-2">
                      {q.options?.map((opt) => {
                        const isThisChosen = chosen === opt.key;
                        const isThisCorrect = q.correct === opt.key;

                        let optClass = 'bg-white border-slate-200 text-slate-700';
                        if (isThisCorrect) {
                          optClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400';
                        } else if (isThisChosen && !isThisCorrect) {
                          optClass = 'bg-rose-50 border-rose-300 text-rose-950';
                        }

                        return (
                          <div
                            key={opt.key}
                            className={`p-3 sm:p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${optClass}`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                                isThisCorrect 
                                  ? 'bg-emerald-600 text-white'
                                  : isThisChosen 
                                    ? 'bg-rose-600 text-white' 
                                    : 'bg-slate-100 text-slate-600'
                              }`}>
                                {opt.key}
                              </span>
                              <span className="font-medium">{opt.text}</span>
                            </div>

                            <div className="shrink-0 font-bold text-[10px] flex items-center gap-1 pt-0.5">
                              {isThisCorrect && (
                                <span className="text-emerald-700 font-black">✓ Correct Answer</span>
                              )}
                              {isThisChosen && !isThisCorrect && (
                                <span className="text-rose-700 font-black">✗ Your Choice</span>
                              )}
                              {isThisChosen && isThisCorrect && (
                                <span className="text-emerald-700 font-black">• Your Choice</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Toggle */}
                    <div className="pt-2 border-t border-slate-200/80">
                      <button
                        onClick={() => toggleExplanation(q.id)}
                        className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Clinical Explanation' : 'View Clinical Explanation & Key Takeaway'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed animate-in fade-in space-y-2">
                          <div className="font-black text-slate-900 uppercase text-[10px] tracking-wider text-brand-700">
                            High-Yield Clinical Rationale
                          </div>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    );
  }

  return null;
}
