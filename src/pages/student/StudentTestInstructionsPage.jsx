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
  RefreshCw,
  LogOut
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

  // Consent checkboxes state
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
  const questionsCount = deliveryModel?.totalQuestions || deliveryModel?.questions?.length || 0;
  const maxMarks = questionsCount * (scoring.marksPerQuestion || 4);

  // Can the candidate start? All 4 consents required
  const canStart = consentInstructions && consentNoTabSwitch && consentAutoSubmit && consentAgreement;

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

    // Initialize or resume attempt with consent recorded
    testAttemptService.startAttempt(test, currentStudentId, consentRecord);

    // Transition into candidate test window
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
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading Assessment Instructions...</p>
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
            The assessment with ID <code className="font-mono bg-slate-700 px-1.5 py-0.5 rounded">{testId}</code> could not be located.
          </p>
          <Link
            to="/student/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Tests Directory
          </Link>
        </div>
      </div>
    );
  }

  // If already submitted (Completed or Auto-Submitted)
  const isCompletedAttempt = existingAttempt && (existingAttempt.status === 'COMPLETED' || existingAttempt.status === 'AUTO_SUBMITTED' || existingAttempt.status === 'SUBMITTED');
  const isPausedAttempt = existingAttempt && existingAttempt.status === 'PAUSED';
  const isInProgressAttempt = existingAttempt && existingAttempt.status === 'IN_PROGRESS';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Bar Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-cyan-500/20">
            MP
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              MedPrep Pro <span className="text-[10px] text-cyan-400 font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">Candidate Gateway</span>
            </span>
            <p className="text-[11px] text-slate-400">Pre-Test Instructions &amp; Consent Verification</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{studentName}</span>
          </div>
          {!previewMode && (
            <Link
              to="/student/tests"
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Gateway</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Existing Completed Attempt Card */}
        {isCompletedAttempt && !previewMode && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Assessment Previously Completed</h3>
                <p className="text-xs text-slate-400">
                  You have already submitted this assessment on {new Date(existingAttempt.submittedAt).toLocaleString()}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Score</span>
                <span className="text-lg font-black text-white">{existingAttempt.scoringSummary?.totalScore ?? '—'} / {existingAttempt.scoringSummary?.maxMarks ?? '—'}</span>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Percentage</span>
                <span className="text-lg font-black text-emerald-400">{existingAttempt.scoringSummary?.percentage ?? '—'}%</span>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Correct</span>
                <span className="text-lg font-black text-white">{existingAttempt.scoringSummary?.correctCount ?? '—'}</span>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Reason</span>
                <span className="text-xs font-bold text-slate-300 truncate block mt-1">
                  {existingAttempt.submissionReason === 'TAB_OR_WINDOW_VIOLATION' ? 'Tab Violation' : (existingAttempt.submissionReason || 'Submitted')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/student/tests"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Back to Tests
              </Link>
              <button
                type="button"
                onClick={() => navigate(`/student/tests/${test.id}/window`)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
              >
                <Eye className="w-4 h-4" /> View Full Scorecard
              </button>
            </div>
          </div>
        )}

        {/* Existing In-Progress or Paused Attempt Banner */}
        {(isInProgressAttempt || isPausedAttempt) && !previewMode && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/40 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  {isPausedAttempt ? <Pause className="w-5 h-5 text-amber-400" /> : <Play className="w-5 h-5 text-cyan-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                      {isPausedAttempt ? 'Attempt Paused' : 'Active Attempt In Progress'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Started: {new Date(existingAttempt.startedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    You have an existing attempt for this assessment.
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your recorded answers ({Object.keys(existingAttempt.answers || {}).length} answered) and timer ({Math.ceil((existingAttempt.remainingSeconds || 0) / 60)} minutes left) are preserved.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResumeTest}
                className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Assessment</span>
              </button>
            </div>
          </div>
        )}

        {/* Test Identity Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  {test.code || test.id}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                  {deliveryModel.examName || test.examId}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  {test.testType || 'MOCK_EXAM'}
                </span>
                {test.assessmentMethod && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                    {test.assessmentMethod}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {deliveryModel.testName}
              </h1>

              {deliveryModel.description && (
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  {deliveryModel.description}
                </p>
              )}
            </div>

            {/* Quick Metrics Badge Group */}
            <div className="grid grid-cols-2 gap-2 sm:w-48 shrink-0 text-center">
              <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Questions</span>
                <span className="text-lg font-black text-white">{questionsCount}</span>
              </div>
              <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Duration</span>
                <span className="text-lg font-black text-cyan-400">{timing.totalDurationMinutes} min</span>
              </div>
              <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Max Marks</span>
                <span className="text-lg font-black text-white">{maxMarks}</span>
              </div>
              <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Negative</span>
                <span className="text-lg font-black text-rose-400">-{Math.abs(scoring.penaltyPerWrong)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Configured Rules Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Examination Rules &amp; Assessment Guidelines</h2>
              <p className="text-xs text-slate-400">Please review the operational parameters governing this test session</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Scoring Scheme Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Award className="w-4 h-4" />
                <span>Scoring Scheme</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Correct Answer:</span>
                  <strong className="text-emerald-400 font-mono">+{scoring.marksPerQuestion} Marks</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Incorrect Answer:</span>
                  <strong className="text-rose-400 font-mono">-{Math.abs(scoring.penaltyPerWrong)} Mark (Penalty)</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Unanswered Item:</span>
                  <strong className="text-slate-400 font-mono">{scoring.unansweredMarks} Marks</strong>
                </li>
              </ul>
            </div>

            {/* Navigation Behavior Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>Navigation &amp; Review Policy</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {navigation.mode === 'FREE' ? (
                  <><strong>Free Navigation:</strong> You may navigate between questions in any order using the question palette or next/previous buttons.</>
                ) : (
                  <><strong>Sequential Navigation:</strong> Questions must be answered sequentially. Back navigation is disabled.</>
                )}
              </p>
              {navigation.allowQuestionReview && (
                <p className="text-indigo-300/80 text-[11px] pt-1">
                  ✓ Question Review is enabled: You may mark questions for review and return before submission.
                </p>
              )}
            </div>

            {/* Timing Rules Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Timing &amp; Auto-Submission</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Total Allotted Time: <strong>{timing.totalDurationMinutes} minutes</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                The countdown timer begins immediately when you click <strong>Start Assessment</strong>. When the countdown reaches zero, the assessment will automatically freeze and submit your recorded responses.
              </p>
            </div>

            {/* Pause / Resume Policy Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Pause className="w-4 h-4" />
                <span>Pause &amp; Resume Policy</span>
              </div>
              {security.allowPause ? (
                <div className="space-y-1 text-slate-300">
                  <p>
                    ✓ <strong>Pause Permitted:</strong> You may pause the examination at any time using the header Pause control.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    When paused, the question interface is suspended and the countdown timer is frozen until you resume.
                  </p>
                </div>
              ) : (
                <p className="text-slate-400">
                  Continuous Session: This examination cannot be paused once started.
                </p>
              )}
            </div>
          </div>

          {/* Author Specific Instructions (if any) */}
          {deliveryModel.instructions && (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2 text-xs">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Special Instructions from Examination Faculty
              </h4>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                {deliveryModel.instructions}
              </p>
            </div>
          )}

          {/* High-Alert Anti-Tab Switching Notice */}
          <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-2.5 text-xs text-rose-200 shadow-md shadow-rose-950/40">
            <div className="flex items-center gap-2 font-black text-rose-300 text-sm tracking-wide uppercase">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>Strict Integrity Notice: Tab &amp; Window Monitoring Active</span>
            </div>
            <p className="leading-relaxed text-rose-200">
              During the live examination session, <strong>switching browser tabs, minimizing the browser window, opening developer tools, or shifting window focus to external applications is strictly prohibited</strong>.
            </p>
            <p className="font-bold text-rose-300 text-[11px] pt-1">
              ⚠️ Any detected tab switch or window focus violation will trigger immediate, automatic test submission. All answers recorded up to that moment will be final, and re-entry will be permanently blocked.
            </p>
          </div>
        </div>

        {/* Mandatory Explicit Consent Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Candidate Acknowledgment &amp; Explicit Consent</h2>
              <p className="text-xs text-slate-400">All conditions must be acknowledged before beginning the assessment</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Condition 1 */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentInstructions}
                onChange={(e) => setConsentInstructions(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 bg-slate-700 border-slate-600 shrink-0 cursor-pointer"
              />
              <span className="text-slate-300 leading-relaxed">
                I have read, understood, and agreed to all <strong>examination instructions</strong>, including the scoring scheme (+{scoring.marksPerQuestion} / -{Math.abs(scoring.penaltyPerWrong)}) and navigation rules.
              </span>
            </label>

            {/* Condition 2 */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentNoTabSwitch}
                onChange={(e) => setConsentNoTabSwitch(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 bg-slate-700 border-slate-600 shrink-0 cursor-pointer"
              />
              <span className="text-slate-300 leading-relaxed">
                I understand that <strong>switching browser tabs or navigating outside the test window</strong> during the examination is strictly prohibited.
              </span>
            </label>

            {/* Condition 3 */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentAutoSubmit}
                onChange={(e) => setConsentAutoSubmit(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 bg-slate-700 border-slate-600 shrink-0 cursor-pointer"
              />
              <span className="text-slate-300 leading-relaxed">
                I agree that if a <strong>tab, window, or focus violation</strong> is detected, my examination will be <strong>immediately and automatically submitted</strong>.
              </span>
            </label>

            {/* Condition 4 */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentAgreement}
                onChange={(e) => setConsentAgreement(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900 bg-slate-700 border-slate-600 shrink-0 cursor-pointer"
              />
              <span className="text-slate-300 leading-relaxed">
                I am ready to begin the examination under these conditions and confirm that my workstation environment is prepared.
              </span>
            </label>
          </div>

          {/* Action Launch Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {!previewMode ? (
              <Link
                to="/student/tests"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" /> Cancel &amp; Back to Tests
              </Link>
            ) : (
              <span className="text-xs text-amber-400 font-semibold italic order-2 sm:order-1">
                Preview Mode — Real attempts and consent are not recorded.
              </span>
            )}

            <button
              type="button"
              id="start-assessment-btn"
              onClick={handleStartTest}
              disabled={!canStart}
              className={`px-8 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xl order-1 sm:order-2 cursor-pointer ${
                canStart
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-cyan-500/25 hover:shadow-cyan-500/40 scale-100'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{previewMode ? 'Simulate Start Test (Preview)' : 'I Understand & Agree — Start Test'}</span>
            </button>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        MedPrep Pro Examination Engine • Secure Delivery Architecture
      </footer>
    </div>
  );
}
