import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  Play, 
  Pause, 
  Sparkles, 
  Award, 
  Layers, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  Check,
  UserCheck,
  Lock,
  Compass
} from 'lucide-react';
import { testPresentationService } from '../../services/testPresentationService.js';
import { testAttemptService } from '../../services/testAttemptService.js';
import { authService } from '../../services/authService.js';

export default function StudentTestInstructionsPage({ previewMode = false, previewTest = null, onPreviewStart = null }) {
  const params = useParams();
  const testId = previewTest?.id || params.testId || params.id;
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const currentStudentId = currentUser?.id || 'student-ritik';
  const studentName = currentUser?.name || 'Dr. Ritik Saini (Candidate)';

  const [test, setTest] = useState(previewTest || null);
  const [deliveryModel, setDeliveryModel] = useState(null);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [isLoading, setIsLoading] = useState(!previewTest);

  // Stepped 2-Page Flow: 1 = Examination Rules & Guidelines, 2 = Candidate Acknowledgment & Explicit Consent
  const [currentStep, setCurrentStep] = useState(1);

  // Mandatory 4 Consent Checkboxes State
  const [consentInstructions, setConsentInstructions] = useState(false);
  const [consentNoTabSwitch, setConsentNoTabSwitch] = useState(false);
  const [consentAutoSubmit, setConsentAutoSubmit] = useState(false);
  const [consentAgreement, setConsentAgreement] = useState(false);

  // 1. Load Test & Delivery Read Model
  useEffect(() => {
    if (previewTest) {
      setTest(previewTest);
      setDeliveryModel(testPresentationService.getTestPreviewModel(previewTest));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const resolved = testPresentationService.getTestById(testId);
      if (resolved) {
        setTest(resolved);
        const model = testPresentationService.getTestDeliveryModel(resolved);
        setDeliveryModel(model);

        // Check if an existing attempt already exists in localStorage
        const attempt = testAttemptService.getAttempt(resolved.id, currentStudentId);
        setExistingAttempt(attempt);
      }
    } catch (e) {
      console.error('[StudentTestInstructionsPage] Error loading test:', e);
    } finally {
      setIsLoading(false);
    }
  }, [testId, currentStudentId, previewTest]);

  // Derived rules
  const timing = deliveryModel?.timing || { totalDurationMinutes: 60, autoSubmit: true, allowPause: true };
  const navigation = deliveryModel?.navigation || { mode: 'FREE', allowBackNavigation: true, allowQuestionReview: true };
  const scoring = deliveryModel?.scoring || { marksPerQuestion: 4, penaltyPerWrong: 1, unansweredMarks: 0 };
  const security = deliveryModel?.security || { tabSwitchPolicy: 'AUTO_SUBMIT', allowPause: true };
  const questionsCount = deliveryModel?.totalQuestions || deliveryModel?.questions?.length || test?.totalQuestions || test?.questionsCount || 0;
  const maxMarks = deliveryModel?.totalMarks || (questionsCount * (scoring.marksPerQuestion || 4));

  // Format Faculty Instructions if present (declared before any early returns)
  const facultyInstructionsList = useMemo(() => {
    if (!deliveryModel?.instructions) return [];
    if (Array.isArray(deliveryModel.instructions)) return deliveryModel.instructions;
    return String(deliveryModel.instructions)
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }, [deliveryModel?.instructions]);

  // Can the candidate start? All 4 consents required
  const canStart = consentInstructions && consentNoTabSwitch && consentAutoSubmit && consentAgreement;

  // Handle Step Navigation
  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Start Test
  const handleStartTest = () => {
    if (previewMode) {
      if (onPreviewStart) onPreviewStart();
      return;
    }

    if (!canStart || !test) return;

    const consentRecord = {
      instructionsAccepted: true,
      monitoringAccepted: true,
      autoSubmitAccepted: true,
      candidateAgreement: true,
      acceptedAt: new Date().toISOString(),
      studentId: currentStudentId,
      studentName
    };

    // Initialize attempt with explicit consent
    testAttemptService.startAttempt(test, currentStudentId, consentRecord);

    // Transition into active candidate test window
    navigate(`/student/tests/${test.id}/window`);
  };

  // Handle Resume Existing Attempt
  const handleResumeTest = () => {
    if (previewMode) {
      if (onPreviewStart) onPreviewStart();
      return;
    }
    navigate(`/student/tests/${test.id}/window`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-4 max-w-sm w-full">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading Assessment Environment...</p>
          <p className="text-xs text-slate-400">Verifying examination parameters and security policies</p>
        </div>
      </div>
    );
  }

  if (!test || !deliveryModel) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Assessment Not Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The assessment with identifier <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{testId}</code> is not currently active or available.
          </p>
          <div className="pt-2">
            <Link
              to="/student/tests"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Tests Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Attempt statuses
  const isCompletedAttempt = existingAttempt && (existingAttempt.status === 'COMPLETED' || existingAttempt.status === 'AUTO_SUBMITTED' || existingAttempt.status === 'SUBMITTED');
  const isPausedAttempt = existingAttempt && existingAttempt.status === 'PAUSED';
  const isInProgressAttempt = existingAttempt && existingAttempt.status === 'IN_PROGRESS';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Candidate-Facing Focused Header (Matches StudentTestWindowPage) */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 shadow-md shrink-0 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              MP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                  {deliveryModel.testName}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Pre-Test Gateway
                </span>
                {previewMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Faculty/Admin Preview
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Candidate: <span className="text-slate-200 font-medium">{studentName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-1.5 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timing.totalDurationMinutes} mins</span>
            </div>

            {!previewMode && (
              <Link
                to="/student/tests"
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* 2-Step Progress Indicator */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
            
            {/* Step 1 Tab */}
            <button
              type="button"
              onClick={() => goToStep(1)}
              className={`flex-1 flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                currentStep === 1
                  ? 'bg-brand-50/80 border border-brand-200 text-brand-900'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                currentStep === 1
                  ? 'bg-brand-600 text-white shadow-xs'
                  : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Step 1</span>
                <span className="block text-xs font-bold truncate">Examination Rules &amp; Guidelines</span>
              </div>
            </button>

            {/* Step Divider */}
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

            {/* Step 2 Tab */}
            <button
              type="button"
              onClick={() => goToStep(2)}
              className={`flex-1 flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                currentStep === 2
                  ? 'bg-brand-50/80 border border-brand-200 text-brand-900'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                currentStep === 2
                  ? 'bg-brand-600 text-white shadow-xs'
                  : canStart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500'
              }`}>
                {canStart ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Step 2</span>
                <span className="block text-xs font-bold truncate">Candidate Consent &amp; Declaration</span>
              </div>
            </button>

          </div>
        </div>

        {/* Existing Completed Attempt Notice */}
        {isCompletedAttempt && !previewMode && (
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Status: Finalized
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Assessment Previously Completed</h3>
                <p className="text-xs text-slate-500">
                  You submitted this test on {new Date(existingAttempt.submittedAt).toLocaleString()}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Final Score</span>
                <span className="text-lg font-black text-slate-900">
                  {existingAttempt.scoringSummary?.totalScore ?? '—'} / {existingAttempt.scoringSummary?.maxMarks ?? '—'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Percentage</span>
                <span className="text-lg font-black text-emerald-600">
                  {existingAttempt.scoringSummary?.percentage ?? '—'}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Correct</span>
                <span className="text-lg font-black text-slate-900">
                  {existingAttempt.scoringSummary?.correctCount ?? '—'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Submission Reason</span>
                <span className="text-xs font-bold text-slate-700 truncate block mt-1">
                  {existingAttempt.submissionReason === 'TAB_OR_WINDOW_VIOLATION' ? 'Tab Violation Auto-Submit' : (existingAttempt.submissionReason || 'Submitted')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/student/tests"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Back to Tests
              </Link>
              <button
                type="button"
                onClick={() => navigate(`/student/tests/${test.id}/result`)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Award className="w-4 h-4" /> View Result &amp; Review
              </button>
            </div>
          </div>
        )}

        {/* Existing Paused / In-Progress Attempt Banner */}
        {(isInProgressAttempt || isPausedAttempt) && !previewMode && (
          <div className="bg-amber-50/70 border border-amber-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0">
                  {isPausedAttempt ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 border border-amber-300">
                      {isPausedAttempt ? 'Attempt Paused' : 'Attempt In Progress'}
                    </span>
                    <span className="text-xs text-amber-800 font-mono">
                      Started: {new Date(existingAttempt.startedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    You have an active test session for this exam.
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Your answers ({Object.keys(existingAttempt.answers || {}).length} recorded) and countdown timer ({Math.ceil((existingAttempt.remainingSeconds || 0) / 60)} minutes remaining) are preserved.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResumeTest}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Examination</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 1: EXAMINATION RULES & ASSESSMENT GUIDELINES                         */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Overview & Identification Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    {test.code || test.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                    {deliveryModel.examName || test.examId || 'NEET PG & NExT 2026'}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                    {test.testType || 'MOCK_EXAM'}
                  </span>
                  {test.pattern && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                      {test.pattern}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {deliveryModel.testName}
                </h1>

                {deliveryModel.description && (
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {deliveryModel.description}
                  </p>
                )}
              </div>

              {/* Stats in a row below the headings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5 border-t border-slate-100 text-center">
                <div className="p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Questions</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5 block">{questionsCount}</span>
                </div>
                <div className="p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Duration</span>
                  <span className="text-xl font-black text-brand-600 mt-0.5 block">{timing.totalDurationMinutes} min</span>
                </div>
                <div className="p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Max Marks</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5 block">{maxMarks}</span>
                </div>
                <div className="p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Marking</span>
                  <span className="text-xl font-black text-emerald-600 mt-0.5 block">+{scoring.marksPerQuestion} / -{Math.abs(scoring.penaltyPerWrong)}</span>
                </div>
              </div>
            </div>

            {/* Core Examination Rules Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Examination Rules &amp; Assessment Guidelines</h2>
                  <p className="text-xs text-slate-500">Carefully review the assessment protocols and test-taking parameters</p>
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Scoring Card */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
                    <Award className="w-4 h-4" />
                    <span>Scoring Protocol</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    <li className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                      <span>Correct Answer:</span>
                      <strong className="text-emerald-700 font-mono font-bold">+{scoring.marksPerQuestion} Marks</strong>
                    </li>
                    <li className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                      <span>Incorrect Response:</span>
                      <strong className="text-rose-700 font-mono font-bold">-{Math.abs(scoring.penaltyPerWrong)} Mark (Penalty)</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Unattempted Question:</span>
                      <strong className="text-slate-500 font-mono font-bold">{scoring.unansweredMarks} Marks</strong>
                    </li>
                  </ul>
                </div>

                {/* Navigation Card */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <Layers className="w-4 h-4" />
                    <span>Navigation &amp; Question Palette</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {navigation.mode === 'FREE' ? (
                      <><strong>Free Question Navigation:</strong> You can jump between questions in any order using the question palette or next/prev navigation buttons.</>
                    ) : (
                      <><strong>Sequential Flow:</strong> Questions must be answered sequentially before moving forward.</>
                    )}
                  </p>
                  {navigation.allowQuestionReview && (
                    <p className="text-indigo-800 text-[11px] pt-1">
                      ✓ <strong>Mark for Review:</strong> You may flag questions for review and revisit them before final submission.
                    </p>
                  )}
                </div>

                {/* Timing Rules Card */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Timing &amp; Auto-Submission</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Total Allotted Time: <strong>{timing.totalDurationMinutes} minutes</strong>.
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    The timer starts immediately upon clicking <strong>Start Examination</strong>. When the remaining time reaches 00:00, your test will automatically finalize and submit.
                  </p>
                </div>

                {/* Pause & Resume Policy */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <Pause className="w-4 h-4" />
                    <span>Session Pause Policy</span>
                  </div>
                  {security.allowPause ? (
                    <div className="space-y-1 text-slate-700">
                      <p>
                        ✓ <strong>Pause Available:</strong> You may pause the examination using the header Pause control.
                      </p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Pausing freezes the countdown timer and suspends tab-switch monitoring until you resume.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-600">
                      Continuous Session: This examination must be completed in one uninterrupted session.
                    </p>
                  )}
                </div>

              </div>

              {/* Faculty Special Instructions (if any) */}
              {facultyInstructionsList.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-600" />
                    Examination Faculty Instructions:
                  </h4>
                  <ul className="space-y-1.5 text-slate-700 list-disc list-inside leading-relaxed pl-1">
                    {facultyInstructionsList.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* High-Alert Anti-Tab Switching Security Notice */}
              <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2 text-xs text-rose-950">
                <div className="flex items-center gap-2 font-black text-rose-800 text-sm tracking-wide uppercase">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Strict Integrity Protocol: Anti-Tab &amp; Window Monitoring Active</span>
                </div>
                <p className="leading-relaxed text-slate-700">
                  During this live assessment, <strong>switching browser tabs, minimizing the test window, opening developer tools, or losing window focus is strictly prohibited</strong>.
                </p>
                <p className="font-bold text-rose-800 text-[11px] pt-1">
                  ⚠️ Any detected tab or window violation will trigger an immediate, non-negotiable automatic submission of your assessment. Re-entry will be permanently blocked.
                </p>
              </div>

              {/* Step 1 Bottom Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {!previewMode ? (
                  <Link
                    to="/student/tests"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Cancel &amp; Back to Tests
                  </Link>
                ) : (
                  <span className="text-xs text-slate-500 font-semibold italic order-2 sm:order-1">
                    Step 1 of 2: Reviewing guidelines
                  </span>
                )}

                <button
                  type="button"
                  id="proceed-to-consent-btn"
                  onClick={() => goToStep(2)}
                  className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-brand-600/20 hover:scale-[1.01] active:scale-[0.99] order-1 sm:order-2 cursor-pointer"
                >
                  <span>Proceed to Candidate Consent</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 2: CANDIDATE ACKNOWLEDGMENT & EXPLICIT CONSENT                       */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Candidate Identity & Session Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{studentName}</h3>
                    <p className="text-xs text-slate-500">
                      ID: <span className="font-mono text-slate-700">{currentStudentId}</span> • Enrolled Candidate
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-lg bg-slate-100 font-bold text-slate-700">
                    {deliveryModel.testName}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Security Verified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Questions</span>
                  <span className="text-base font-black text-slate-900">{questionsCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Allotted Time</span>
                  <span className="text-base font-black text-brand-600">{timing.totalDurationMinutes} mins</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Marks</span>
                  <span className="text-base font-black text-slate-900">{maxMarks}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tab Switch Policy</span>
                  <span className="text-xs font-bold text-rose-600 block mt-0.5">Auto-Submit</span>
                </div>
              </div>
            </div>

            {/* Mandatory Explicit Consent Checklist Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Candidate Acknowledgment &amp; Explicit Consent</h2>
                  <p className="text-xs text-slate-500">
                    All 4 conditions below are mandatory before the test window can be unlocked
                  </p>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Mandatory Examination Agreement:
                </span>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  By providing your explicit consent below, you accept personal responsibility for adhering to all CBT testing conditions. Ensure you have a stable network connection and close all background applications before starting.
                </p>
              </div>

              {/* 4 Mandatory Consent Checkbox Cards */}
              <div className="space-y-3 text-xs">
                
                {/* Checkbox 1 */}
                <label className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  consentInstructions
                    ? 'bg-blue-50/70 border-brand-400 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                }`}>
                  <input
                    type="checkbox"
                    checked={consentInstructions}
                    onChange={(e) => setConsentInstructions(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-white border-slate-300 shrink-0 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">
                      1. Examination Instructions &amp; Marking Agreement
                    </span>
                    <span className="text-slate-600 leading-relaxed block text-[11px]">
                      I have read, understood, and agreed to all examination instructions, including the scoring scheme (+{scoring.marksPerQuestion} / -{Math.abs(scoring.penaltyPerWrong)}), duration, and navigation rules.
                    </span>
                  </div>
                </label>

                {/* Checkbox 2 */}
                <label className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  consentNoTabSwitch
                    ? 'bg-blue-50/70 border-brand-400 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                }`}>
                  <input
                    type="checkbox"
                    checked={consentNoTabSwitch}
                    onChange={(e) => setConsentNoTabSwitch(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-white border-slate-300 shrink-0 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">
                      2. Anti-Tab Switching &amp; Window Integrity Policy
                    </span>
                    <span className="text-slate-600 leading-relaxed block text-[11px]">
                      I understand that switching browser tabs, minimizing the test window, or navigating outside the examination environment during the active session is strictly prohibited.
                    </span>
                  </div>
                </label>

                {/* Checkbox 3 */}
                <label className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  consentAutoSubmit
                    ? 'bg-blue-50/70 border-brand-400 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                }`}>
                  <input
                    type="checkbox"
                    checked={consentAutoSubmit}
                    onChange={(e) => setConsentAutoSubmit(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-white border-slate-300 shrink-0 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">
                      3. Automatic Submission on Violation Acceptance
                    </span>
                    <span className="text-slate-600 leading-relaxed block text-[11px]">
                      I agree that if an unauthorized tab switch or window focus violation is detected, my examination will be <strong>immediately and automatically submitted</strong> without prior warning, and retake will be blocked.
                    </span>
                  </div>
                </label>

                {/* Checkbox 4 */}
                <label className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  consentAgreement
                    ? 'bg-blue-50/70 border-brand-400 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                }`}>
                  <input
                    type="checkbox"
                    checked={consentAgreement}
                    onChange={(e) => setConsentAgreement(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-white border-slate-300 shrink-0 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">
                      4. Candidate Declaration &amp; Academic Integrity
                    </span>
                    <span className="text-slate-600 leading-relaxed block text-[11px]">
                      I declare that I am the registered candidate authorized to take this test, and I commit to completing it independently in compliance with MedPrep Pro assessment standards.
                    </span>
                  </div>
                </label>

              </div>

              {/* Step 2 Bottom Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors order-2 sm:order-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Rules &amp; Guidelines
                </button>

                <button
                  type="button"
                  id="start-assessment-btn"
                  onClick={handleStartTest}
                  disabled={!canStart}
                  className={`px-8 py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md order-1 sm:order-2 cursor-pointer ${
                    canStart
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25 hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {previewMode
                      ? 'Simulate Start Test (Preview)'
                      : canStart
                        ? 'I Agree — Start Examination'
                        : 'Complete All 4 Checkboxes to Start'}
                  </span>
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 shrink-0">
        MedPrep Pro Examination Engine • Secure Delivery Architecture
      </footer>
    </div>
  );
}
