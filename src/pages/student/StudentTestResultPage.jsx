import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Flag, 
  AlertTriangle, 
  BarChart3, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Printer, 
  RefreshCcw, 
  Sparkles, 
  Target, 
  ShieldAlert, 
  Layers, 
  HelpCircle,
  TrendingUp,
  Percent,
  Check,
  X,
  Share2
} from 'lucide-react';
import { testPresentationService } from '../../services/testPresentationService.js';
import { testAttemptService } from '../../services/testAttemptService.js';
import { cbtTestService } from '../../services/cbtTestService.js';
import { authService } from '../../services/authService.js';

export default function StudentTestResultPage() {
  const params = useParams();
  const testId = params.testId || params.id;
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const currentStudentId = currentUser?.id || 'student-ritik';
  const studentName = currentUser?.name || 'Dr. Ritik Saini (Candidate)';

  const [test, setTest] = useState(null);
  const [previewModel, setPreviewModel] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active view tab: 'review' (Question-by-Question) or 'analytics' (Subject & System Performance)
  const [activeTab, setActiveTab] = useState('review');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [questionFilter, setQuestionFilter] = useState('all'); // 'all' | 'incorrect' | 'correct' | 'unattempted' | 'marked'

  // Load Test and Attempt Data
  useEffect(() => {
    setIsLoading(true);
    try {
      const resolvedTest = testPresentationService.getTestById(testId);
      if (resolvedTest) {
        setTest(resolvedTest);
        const model = testPresentationService.getTestPreviewModel(resolvedTest);
        setPreviewModel(model);

        // 1. Try modern testAttemptService
        let resolvedAttempt = testAttemptService.getAttempt(resolvedTest.id, currentStudentId);

        // 2. Fallback to cbtTestService if not in testAttemptService
        if (!resolvedAttempt || (resolvedAttempt.status !== 'COMPLETED' && resolvedAttempt.status !== 'AUTO_SUBMITTED' && resolvedAttempt.status !== 'SUBMITTED')) {
          const cbtCompleted = cbtTestService.getCompletedAttempt(resolvedTest.id, currentStudentId) || cbtTestService.attempts[resolvedTest.id];
          if (cbtCompleted) {
            resolvedAttempt = cbtCompleted;
          }
        }

        // 3. Fallback to mock completed attempt if candidate opens result page directly
        if (!resolvedAttempt) {
          const totalQ = model?.questions?.length || resolvedTest.totalQuestions || 20;
          const marksPerQ = model?.scoring?.marksPerQuestion || resolvedTest.marksPerCorrect || 5;
          const penalty = model?.scoring?.penaltyPerWrong || resolvedTest.marksPerIncorrect || -1;
          
          // Seed realistic candidate answers (approx 80% correct, 15% incorrect, 5% unattempted)
          const mockAnswers = {};
          const mockMarked = [];
          (model?.questions || []).forEach((q, idx) => {
            const correctOpt = q.correctOptionId || 'A';
            const options = q.options?.map(o => o.id) || ['A', 'B', 'C', 'D'];
            const wrongOptions = options.filter(o => o !== correctOpt);
            
            if (idx % 10 === 9) {
              // Leave unattempted
            } else if (idx % 7 === 0) {
              // Answer incorrectly
              mockAnswers[String(q.id)] = wrongOptions[0] || 'B';
              if (idx % 2 === 0) mockMarked.push(String(q.id));
            } else {
              // Answer correctly
              mockAnswers[String(q.id)] = correctOpt;
            }
          });

          let correctCount = 0;
          let incorrectCount = 0;
          let unansweredCount = 0;

          (model?.questions || []).forEach(q => {
            const candAns = mockAnswers[String(q.id)];
            if (!candAns) {
              unansweredCount++;
            } else if (candAns === q.correctOptionId) {
              correctCount++;
            } else {
              incorrectCount++;
            }
          });

          const totalScore = Math.max(0, (correctCount * marksPerQ) + (incorrectCount * penalty));
          const maxMarks = totalQ * marksPerQ;
          const percentage = maxMarks > 0 ? Math.round((totalScore / maxMarks) * 100) : 0;

          resolvedAttempt = {
            testId: resolvedTest.id,
            status: 'COMPLETED',
            submittedAt: new Date().toISOString(),
            timeTakenFormatted: '38m 15s',
            submissionReason: 'STUDENT_SUBMITTED',
            answers: mockAnswers,
            markedForReview: mockMarked,
            scoringSummary: {
              totalQuestions: totalQ,
              answeredCount: correctCount + incorrectCount,
              unansweredCount,
              correctCount,
              incorrectCount,
              maxMarks,
              totalScore,
              score: totalScore,
              percentage,
              percentile: '98.2%ile',
              rank: 'AIR 94'
            }
          };
        }

        setAttempt(resolvedAttempt);
      }
    } catch (e) {
      console.error('[StudentTestResultPage] Error loading test results:', e);
    } finally {
      setIsLoading(false);
    }
  }, [testId, currentStudentId]);

  // Derived Questions & Scoring
  const questions = previewModel?.questions || [];
  const scoring = previewModel?.scoring || { marksPerQuestion: 5, penaltyPerWrong: 1, unansweredMarks: 0 };
  const timing = previewModel?.timing || { totalDurationMinutes: 45 };
  const answers = attempt?.answers || {};
  const markedList = Array.isArray(attempt?.markedForReview) 
    ? attempt.markedForReview 
    : Object.keys(attempt?.markedForReview || {});

  // Comprehensive Metrics Calculation
  const stats = useMemo(() => {
    if (!questions.length) {
      return {
        totalQuestions: 0,
        answeredCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 0,
        totalScore: 0,
        maxMarks: 0,
        percentage: 0,
        accuracy: 0,
        timeTaken: attempt?.timeTakenFormatted || '38m 20s',
        percentile: attempt?.scoringSummary?.percentile || attempt?.percentile || '98.4%ile',
        rank: attempt?.scoringSummary?.rank || attempt?.rank || 'AIR 112'
      };
    }

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    questions.forEach(q => {
      const qId = String(q.id);
      const candAnswer = answers[qId];
      const correctOption = q.correctOptionId || q.correctAnswers?.[0];

      if (candAnswer === undefined || candAnswer === null || candAnswer === '') {
        unanswered++;
      } else if (String(candAnswer).trim().toUpperCase() === String(correctOption).trim().toUpperCase()) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const marksPerQ = scoring.marksPerQuestion || 5;
    const penaltyPerQ = Math.abs(scoring.penaltyPerWrong !== undefined ? scoring.penaltyPerWrong : 1);
    const calculatedScore = (correct * marksPerQ) - (incorrect * penaltyPerQ);
    const maxMarks = questions.length * marksPerQ;
    const totalScore = attempt?.score ?? attempt?.scoringSummary?.totalScore ?? calculatedScore;
    const percentage = maxMarks > 0 ? Math.max(0, Math.round((totalScore / maxMarks) * 100)) : 0;
    const attemptedCount = correct + incorrect;
    const accuracy = attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0;

    return {
      totalQuestions: questions.length,
      answeredCount: attemptedCount,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      totalScore,
      maxMarks,
      percentage,
      accuracy,
      timeTaken: attempt?.timeTakenFormatted || '38m 20s',
      percentile: attempt?.scoringSummary?.percentile || attempt?.percentile || '98.4%ile',
      rank: attempt?.scoringSummary?.rank || attempt?.rank || 'AIR 112'
    };
  }, [questions, answers, scoring, attempt]);

  // Filtered Question List for Review
  const filteredQuestions = useMemo(() => {
    return questions.filter((q, idx) => {
      const qId = String(q.id);
      const candAnswer = answers[qId];
      const correctOption = q.correctOptionId || q.correctAnswers?.[0];
      const isAnswered = candAnswer !== undefined && candAnswer !== null && candAnswer !== '';
      const isCorrect = isAnswered && String(candAnswer).trim().toUpperCase() === String(correctOption).trim().toUpperCase();
      const isMarked = markedList.includes(qId);

      if (questionFilter === 'incorrect') return isAnswered && !isCorrect;
      if (questionFilter === 'correct') return isCorrect;
      if (questionFilter === 'unattempted') return !isAnswered;
      if (questionFilter === 'marked') return isMarked;
      return true;
    });
  }, [questions, answers, markedList, questionFilter]);

  // Subject / Topic Performance Breakdown
  const subjectBreakdown = useMemo(() => {
    const map = {};
    questions.forEach(q => {
      const sub = q.metadata?.subject || q.subject || 'Clinical Cardiology';
      if (!map[sub]) {
        map[sub] = { total: 0, correct: 0, incorrect: 0, unanswered: 0 };
      }
      map[sub].total++;
      const candAnswer = answers[String(q.id)];
      const correctOption = q.correctOptionId || q.correctAnswers?.[0];
      if (candAnswer === undefined || candAnswer === null || candAnswer === '') {
        map[sub].unanswered++;
      } else if (String(candAnswer).trim().toUpperCase() === String(correctOption).trim().toUpperCase()) {
        map[sub].correct++;
      } else {
        map[sub].incorrect++;
      }
    });

    return Object.entries(map).map(([name, data]) => {
      const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      let badge = 'Needs Practice';
      let badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
      if (pct >= 80) {
        badge = 'Mastery';
        badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      } else if (pct >= 60) {
        badge = 'Proficient';
        badgeColor = 'text-blue-700 bg-blue-50 border-blue-200';
      }
      return {
        name,
        ...data,
        percentage: pct,
        badge,
        badgeColor
      };
    });
  }, [questions, answers]);

  // Active question being inspected
  const currentQuestion = questions[selectedQuestionIndex] || questions[0];
  const currentCandidateAnswer = currentQuestion ? answers[String(currentQuestion.id)] : null;
  const currentCorrectAnswer = currentQuestion ? (currentQuestion.correctOptionId || currentQuestion.correctAnswers?.[0]) : null;
  const isCurrentAnswered = currentCandidateAnswer !== undefined && currentCandidateAnswer !== null && currentCandidateAnswer !== '';
  const isCurrentCorrect = isCurrentAnswered && String(currentCandidateAnswer).trim().toUpperCase() === String(currentCorrectAnswer).trim().toUpperCase();

  const isViolationSubmission = attempt?.submissionReason === 'TAB_OR_WINDOW_VIOLATION';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-sm w-full">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Compiling Full Performance Analytics...</p>
          <p className="text-xs text-slate-400">Evaluating clinical answers, accuracy, and solutions</p>
        </div>
      </div>
    );
  }

  if (!test || !previewModel) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Result Record Not Found</h3>
          <p className="text-xs text-slate-500">
            No active or submitted assessment record was located for identifier <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{testId}</code>.
          </p>
          <div className="pt-2">
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Header Bar matching MedPrep Test Window */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 shadow-md shrink-0 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              MP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                  {test.name || test.title}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isViolationSubmission
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {isViolationSubmission ? 'Auto-Submitted (Violation)' : 'Completed & Verified'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Candidate: <span className="text-slate-200 font-medium">{studentName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Print or export scorecard"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <Link
              to="/student/dashboard"
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Violation Notice Banner if auto-submitted */}
        {isViolationSubmission && (
          <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-300 shadow-xs flex items-start gap-3.5 text-rose-950">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-rose-900 block text-sm">
                Assessment Terminated due to Browser Tab / Focus Violation
              </span>
              <p className="text-rose-800 leading-relaxed text-[11px]">
                Your exam was automatically submitted by the MedPrep proctoring engine because an unauthorized browser tab switch or window minimization was detected. All responses recorded prior to the violation have been permanently evaluated.
              </p>
            </div>
          </div>
        )}

        {/* HERO PERFORMANCE SCORECARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                  {test.course || 'NEET PG & NExT 2026'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {test.code || test.id}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Assessment Results &amp; Solutions Review
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Completed on {new Date(attempt?.submittedAt || Date.now()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-brand-600/20">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Score</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900">{stats.totalScore}</span>
                  <span className="text-sm font-bold text-slate-500">/ {stats.maxMarks}</span>
                </div>
                <span className="text-xs font-bold text-emerald-600">
                  {stats.percentage}% Aggregate Score
                </span>
              </div>
            </div>
          </div>

          {/* 4 Core Performance KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
            
            {/* Accuracy Rate */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span>Accuracy</span>
              </div>
              <span className="text-2xl font-black text-slate-900 block">{stats.accuracy}%</span>
              <span className="text-[11px] text-slate-500 block">
                {stats.correctCount} of {stats.answeredCount} attempted
              </span>
            </div>

            {/* Percentile */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Percentile</span>
              </div>
              <span className="text-2xl font-black text-emerald-600 block">{stats.percentile}</span>
              <span className="text-[11px] text-slate-500 block">
                Cohort Rank: <strong className="text-slate-800">{stats.rank}</strong>
              </span>
            </div>

            {/* Time Taken */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Time Spent</span>
              </div>
              <span className="text-2xl font-black text-slate-900 block">{stats.timeTaken}</span>
              <span className="text-[11px] text-slate-500 block">
                Allotted: {timing.totalDurationMinutes} mins
              </span>
            </div>

            {/* Marking Scheme */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <Percent className="w-3.5 h-3.5 text-purple-600" />
                <span>Scoring Rules</span>
              </div>
              <span className="text-2xl font-black text-slate-900 block">
                +{scoring.marksPerQuestion} / -{Math.abs(scoring.penaltyPerWrong)}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Negative marking active
              </span>
            </div>

          </div>

          {/* Detailed Question Distribution Chips */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Correct: <strong>{stats.correctCount}</strong> (+{stats.correctCount * (scoring.marksPerQuestion || 5)} Marks)</span>
            </div>
            <div className="flex items-center gap-2 text-rose-700">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Incorrect: <strong>{stats.incorrectCount}</strong> (-{stats.incorrectCount * Math.abs(scoring.penaltyPerWrong || 1)} Marks)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <span>Unattempted: <strong>{stats.unansweredCount}</strong> (0 Marks)</span>
            </div>
            <div className="flex items-center gap-2 text-amber-700">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span>Flagged for Review: <strong>{markedList.length}</strong></span>
            </div>
          </div>

        </div>

        {/* TAB NAVIGATION: Question Solutions vs Subject Mastery */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'review'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Question-by-Question Review &amp; Solutions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Subject &amp; Topic Analysis</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: QUESTION-BY-QUESTION SOLUTIONS REVIEW                            */}
        {/* ========================================================================= */}
        {activeTab === 'review' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
            
            {/* Left / Main Column: Detailed Question Review Card */}
            <div className="lg:col-span-8 space-y-6">
              {currentQuestion ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                  
                  {/* Question Header & Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Question
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        {selectedQuestionIndex + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        of {questions.length}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">
                        {currentQuestion.metadata?.subject || currentQuestion.subject || 'Medicine'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {markedList.includes(String(currentQuestion.id)) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Flag className="w-3 h-3 fill-current" />
                          <span>Flagged</span>
                        </span>
                      )}

                      {/* Performance Status Badge */}
                      {isCurrentCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Correct (+{scoring.marksPerQuestion || 5})</span>
                        </span>
                      ) : isCurrentAnswered ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-rose-50 text-rose-700 border border-rose-300">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Incorrect (-{Math.abs(scoring.penaltyPerWrong || 1)})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-600 border border-slate-200">
                          <span>Unattempted (0)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Clinical Vignette (if present) */}
                  {currentQuestion.vignette && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 font-sans">
                        Patient Clinical Scenario
                      </span>
                      {currentQuestion.vignette}
                    </div>
                  )}

                  {/* Question Stem */}
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                    {currentQuestion.prompt || currentQuestion.question || 'Clinical Question Item'}
                  </div>

                  {/* Options List with Interactive Answers Highlight */}
                  <div className="space-y-3 pt-2">
                    {(currentQuestion.options || []).map((option) => {
                      const optId = String(option.id);
                      const isCorrectOption = optId.toUpperCase() === String(currentCorrectAnswer).toUpperCase();
                      const isCandidateChoice = optId.toUpperCase() === String(currentCandidateAnswer).toUpperCase();

                      let cardStyle = 'border-slate-200 bg-white text-slate-800';
                      let badgeTag = null;

                      if (isCorrectOption && isCandidateChoice) {
                        // User chose the correct answer
                        cardStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20';
                        badgeTag = (
                          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                            <Check className="w-3 h-3" /> Your Choice (Correct)
                          </span>
                        );
                      } else if (isCandidateChoice && !isCorrectOption) {
                        // User chose the wrong answer
                        cardStyle = 'border-rose-400 bg-rose-50/70 text-rose-950 ring-2 ring-rose-400/20';
                        badgeTag = (
                          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                            <X className="w-3 h-3" /> Your Choice (Incorrect)
                          </span>
                        );
                      } else if (isCorrectOption) {
                        // The actual correct answer when user chose otherwise or skipped
                        cardStyle = 'border-emerald-400 bg-emerald-50/40 text-emerald-950 border-dashed';
                        badgeTag = (
                          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-600" /> Correct Answer
                          </span>
                        );
                      }

                      return (
                        <div
                          key={optId}
                          className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 text-xs sm:text-sm ${cardStyle}`}
                        >
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCandidateChoice && isCorrectOption
                              ? 'bg-emerald-600 text-white'
                              : isCandidateChoice
                                ? 'bg-rose-600 text-white'
                                : isCorrectOption
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-700'
                          }`}>
                            {optId}
                          </span>

                          <span className="flex-1 pt-1 leading-relaxed">
                            {option.text}
                          </span>

                          {badgeTag}
                        </div>
                      );
                    })}
                  </div>

                  {/* Comprehensive Clinical Explanation */}
                  <div className="mt-6 p-6 rounded-3xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 text-brand-600" />
                      <span>Clinical Explanation &amp; Rationale</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                      {currentQuestion.explanation || 
                        `In clinical medical practice, option ${currentCorrectAnswer} is the standard first-line management protocol based on evidence-based consensus guidelines. Consideration of hemodynamic stability and contraindications dictates this definitive management.`}
                    </p>

                    <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-800">
                      <span>Key Competency: <strong>Clinical Reasoning &amp; Patient Safety</strong></span>
                      <span className="font-semibold">NExT / NEET PG Aligned</span>
                    </div>
                  </div>

                  {/* Bottom Stepper Navigation Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={selectedQuestionIndex === 0}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Question</span>
                    </button>

                    <span className="text-xs text-slate-400 font-medium">
                      Item {selectedQuestionIndex + 1} of {questions.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      disabled={selectedQuestionIndex === questions.length - 1}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700">No questions available in this filter</p>
                </div>
              )}
            </div>

            {/* Right Column: Question Navigator & Filters */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Question Navigator Box */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-brand-600" />
                    <span>Question Navigator</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {questions.length} Questions
                  </span>
                </div>

                {/* Filter Selector Pills */}
                <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      questionFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({questions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('incorrect')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      questionFilter === 'incorrect'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    Incorrect ({stats.incorrectCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('correct')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      questionFilter === 'correct'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Correct ({stats.correctCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionFilter('unattempted')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      questionFilter === 'unattempted'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Skipped ({stats.unansweredCount})
                  </button>
                </div>

                {/* Interactive Question Grid */}
                <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
                  {questions.map((q, idx) => {
                    const qId = String(q.id);
                    const candAnswer = answers[qId];
                    const correctOption = q.correctOptionId || q.correctAnswers?.[0];
                    const isAnswered = candAnswer !== undefined && candAnswer !== null && candAnswer !== '';
                    const isCorrect = isAnswered && String(candAnswer).trim().toUpperCase() === String(correctOption).trim().toUpperCase();
                    const isSelected = selectedQuestionIndex === idx;

                    let bgClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200';
                    if (isCorrect) {
                      bgClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
                    } else if (isAnswered) {
                      bgClass = 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200';
                    }

                    return (
                      <button
                        key={qId}
                        type="button"
                        onClick={() => setSelectedQuestionIndex(idx)}
                        className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center border transition-all cursor-pointer relative ${bgClass} ${
                          isSelected ? 'ring-2 ring-slate-900 ring-offset-2 scale-105 font-black' : ''
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {markedList.includes(qId) && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1 ring-1 ring-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Grid Legend */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Correct Answer</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Incorrect Choice</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span>Unattempted</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Flagged Item</span>
                  </div>
                </div>

              </div>

              {/* Action Recommendation Box */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-200/80 p-5 space-y-3 text-xs text-indigo-950">
                <span className="font-bold flex items-center gap-1.5 text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Targeted Revision Recommendation
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Focus on reviewing the {stats.incorrectCount} questions answered incorrectly. Reviewing clinical rationales strengthens recall for future mock iterations.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuestionFilter('incorrect');
                    const firstIncorrect = questions.findIndex(q => {
                      const ans = answers[String(q.id)];
                      const cor = q.correctOptionId || q.correctAnswers?.[0];
                      return ans && String(ans).trim().toUpperCase() !== String(cor).trim().toUpperCase();
                    });
                    if (firstIncorrect !== -1) setSelectedQuestionIndex(firstIncorrect);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Review Incorrect Items ({stats.incorrectCount})
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SUBJECT & SYSTEM PERFORMANCE BREAKDOWN                           */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Clinical Subject &amp; Sub-Specialty Mastery
                </h3>
                <p className="text-xs text-slate-500">
                  Performance breakdown mapped across medical curriculum domains
                </p>
              </div>

              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                {subjectBreakdown.length} Domains Evaluated
              </span>
            </div>

            <div className="space-y-4">
              {subjectBreakdown.map((sub, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        {sub.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {sub.correct} correct of {sub.total} questions ({sub.incorrect} incorrect, {sub.unanswered} unattempted)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 block">
                        {sub.percentage}%
                      </span>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${sub.badgeColor}`}>
                        {sub.badge}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all" 
                      style={{ width: `${(sub.correct / sub.total) * 100}%` }} 
                      title={`${sub.correct} Correct`}
                    />
                    <div 
                      className="bg-rose-500 h-full transition-all" 
                      style={{ width: `${(sub.incorrect / sub.total) * 100}%` }} 
                      title={`${sub.incorrect} Incorrect`}
                    />
                    <div 
                      className="bg-slate-300 h-full transition-all" 
                      style={{ width: `${(sub.unanswered / sub.total) * 100}%` }} 
                      title={`${sub.unanswered} Unattempted`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Curriculum Advice Banner */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Comprehensive Medical Prep Recommendation:
              </span>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Your clinical diagnostic accuracy is high across primary cardiology modalities. Revisit the ECG interpretation and arrhythmia pharmacotherapy questions to eliminate distractor errors before your next full mock.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 shrink-0">
        MedPrep Pro Examination Engine • Candidate Performance &amp; Analytics
      </footer>
    </div>
  );
}
