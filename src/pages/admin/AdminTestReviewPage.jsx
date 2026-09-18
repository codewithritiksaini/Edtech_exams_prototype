import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  Calendar, 
  Send, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight,
  Lock, 
  HelpCircle, 
  AlertCircle, 
  Layers, 
  Sparkles,
  BookOpen,
  Globe
} from 'lucide-react';
import { 
  adminTestService, 
  TEST_STATUS, 
  getTestTypeLabel,
  getAssessmentMethodLabel,
  getAssessmentMethodBadgeClass 
} from '../../services/adminTestService.js';
import { catalogService } from '../../services/catalogService.js';
import { questionService } from '../../services/questionService.js';
import { testReadinessService } from '../../services/testReadinessService.js';
import { testPublishService } from '../../services/testPublishService.js';

// Shared Components
import TestConfigurationStepper from '../../components/admin/tests/TestConfigurationStepper.jsx';
import TestReadinessBanner from '../../components/common/TestReadinessBanner.jsx';
import TestConfigurationSummaryCard from '../../components/common/TestConfigurationSummaryCard.jsx';
import TestQuestionListReview from '../../components/common/TestQuestionListReview.jsx';
import StudentTestPreviewModal from '../../components/common/StudentTestPreviewModal.jsx';
import TestWindowConfigModal from '../../components/common/TestWindowConfigModal.jsx';
import PublishConfirmationModal from '../../components/common/PublishConfirmationModal.jsx';
import TestStatusBadge from '../../components/admin/tests/TestStatusBadge.jsx';

export default function AdminTestReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(() => adminTestService.getTest(id));
  const [exam, setExam] = useState(null);

  // Modals
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [windowModalOpen, setWindowModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = adminTestService.subscribe((allTests) => {
      const current = allTests.find(t => t.id === id);
      if (current) {
        setTest(current);
      }
    });
    return () => unsubscribe();
  }, [id]);

  // Resolve exam
  useEffect(() => {
    if (test?.examId) {
      setExam(catalogService.getExamById(test.examId));
    }
  }, [test?.examId]);

  // Resolve assembled questions
  const resolvedQuestions = useMemo(() => {
    if (!test) return [];
    const ids = test.content?.questionIds || test.questionIds || [];
    const allQ = questionService.getQuestions();
    const map = new Map(allQ.map(q => [String(q.id), q]));
    return ids.map((qId) => {
      const found = map.get(String(qId));
      if (found) return found;
      return {
        id: String(qId),
        stem: `Clinical Question Item ${qId}`,
        subject: 'Medicine',
        difficulty: 'medium',
        type: 'single-best-answer'
      };
    });
  }, [test]);

  // Pre-flight readiness validation
  const readiness = useMemo(() => {
    if (!test) return null;
    return testReadinessService.validateTestForPublish(test, exam, { role: 'admin' });
  }, [test, exam]);

  const isAlreadyPublished = test?.status === TEST_STATUS.PUBLISHED;

  // Handle Window Save
  const handleSaveWindow = (windowConfig) => {
    try {
      const updated = {
        ...test,
        testWindow: windowConfig,
        updatedAt: new Date().toISOString()
      };
      const idx = adminTestService.tests.findIndex(t => t.id === id);
      if (idx !== -1) {
        adminTestService.tests[idx] = updated;
        adminTestService.save();
        setTest(updated);
        setSuccessToast('Test window scheduling settings updated.');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Publish Confirmation
  const handleConfirmPublish = () => {
    try {
      setIsPublishing(true);
      const published = testPublishService.publishAdminTest(id, {
        testWindow: test.testWindow,
        publishedBy: 'Admin'
      });
      setTest(published);
      setPublishModalOpen(false);
      setIsPublishing(false);
      setSuccessToast(`🎉 Test "${published.name}" has been successfully published!`);
    } catch (err) {
      setIsPublishing(false);
      alert(err.message);
    }
  };

  if (!test) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-sm">
          Admin test with ID "{id}" was not found.
        </div>
        <Link to="/admin/tests" className="text-xs text-indigo-600 font-bold hover:underline">
          ← Back to Tests
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 flex items-center gap-3 animate-slideIn text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{successToast}</span>
        </div>
      )}

      {/* Top Breadcrumb & ID */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/admin/tests" className="hover:text-indigo-600 transition-colors">Test Management</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/admin/tests/${id}`} className="hover:text-indigo-600 transition-colors truncate max-w-xs">{test.name}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800">Phase 6: Review &amp; Publish</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">ID: {id}</span>
      </div>

      {/* Top 6-Phase Stepper */}
      <TestConfigurationStepper currentStep={6} testId={test.id} role="admin" />

      {/* Main Header Banner: Test Identity */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <TestStatusBadge status={test.status} />
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200/80">
                {test.code}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                {getTestTypeLabel(test.testType)}
              </span>
              {test.assessmentMethod && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getAssessmentMethodBadgeClass(test.assessmentMethod)}`}>
                  {getAssessmentMethodLabel(test.assessmentMethod)}
                </span>
              )}
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                Phase 6: Review &amp; Publish
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {test.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Exam Track: <strong className="text-slate-800">{exam?.name || test.examId}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Language: <strong className="text-slate-700">{test.language || 'English'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to={`/admin/tests/${id}`}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Detail
            </Link>

            {/* Test Window */}
            {!isAlreadyPublished && (
              <button
                type="button"
                onClick={() => setWindowModalOpen(true)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {test.testWindow?.enabled ? 'Window Configured' : 'Configure Window'}
              </button>
            )}

            {/* Student Preview */}
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview Test
            </button>
          </div>
        </div>
      </div>

      {/* Full-Width Phase 6 Workspace: Review & Publish */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Phase 6 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              06
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Phase 6: Review &amp; Publish
              </h2>
              <p className="text-xs text-slate-500">
                Validate, Preview &amp; Publish
              </p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 self-start sm:self-center ${
            isAlreadyPublished
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : readiness?.ready
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {isAlreadyPublished ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Published &amp; Locked
              </>
            ) : readiness?.ready ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Publish
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" /> Readiness Incomplete
              </>
            )}
          </span>
        </div>

        {/* Pre-flight Readiness Banner */}
        <TestReadinessBanner 
          readiness={readiness} 
          role="admin" 
          testId={id} 
        />

        {/* Specification Summary & Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <TestConfigurationSummaryCard
              test={test}
              exam={exam}
              questions={resolvedQuestions}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Scheduled Window Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Delivery Schedule
                </h4>
                {!isAlreadyPublished && (
                  <button
                    type="button"
                    onClick={() => setWindowModalOpen(true)}
                    className="text-indigo-600 font-bold hover:underline text-[11px]"
                  >
                    Edit Window
                  </button>
                )}
              </div>

              {test.testWindow?.enabled ? (
                <div className="space-y-2">
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1 text-slate-700">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold uppercase text-indigo-800">Fixed Window Active</span>
                      <span className="font-mono text-indigo-600">{test.testWindow.timezone || 'IST'}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-800 pt-1">
                      <strong>Opens:</strong> {new Date(test.testWindow.startAt).toLocaleString()}
                    </div>
                    <div className="text-xs font-medium text-slate-800">
                      <strong>Closes:</strong> {new Date(test.testWindow.endAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 italic text-[11px]">
                  Continuous access. Candidates can attempt without a restricted calendar window.
                </div>
              )}
            </div>

            {/* Integrity & Locking Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2.5 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-500" />
                Evaluation Integrity Guarantee
              </h4>
              <p className="leading-relaxed text-[11px] text-slate-500">
                Upon publication, the assessment's structure, scoring scheme, questions, and timings are permanently sealed to ensure fair, normalized reporting across all examinees.
              </p>
            </div>
          </div>
        </div>

        {/* Question Items Roster Inspection */}
        <TestQuestionListReview
          questions={resolvedQuestions}
        />

        {/* Phase Footer Navigation */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to={`/admin/tests/${id}/build`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors order-2 sm:order-1"
          >
            <ArrowLeft className="w-4 h-4" /> Previous: Phase 5 (Generate / Build)
          </Link>

          <div className="flex items-center gap-3 self-end sm:self-center order-1 sm:order-2">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Eye className="w-4 h-4" /> Preview Test
            </button>

            {isAlreadyPublished ? (
              <div className="px-5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Published &amp; Locked</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPublishModalOpen(true)}
                disabled={!readiness?.ready}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                  readiness?.ready
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <Send className="w-4 h-4" />
                Publish Test
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Student Test Preview Modal */}
      <StudentTestPreviewModal
        test={test}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
      />

      {/* Test Window Configuration Modal */}
      <TestWindowConfigModal
        isOpen={windowModalOpen}
        onClose={() => setWindowModalOpen(false)}
        currentWindow={test.testWindow}
        onSave={handleSaveWindow}
      />

      {/* Publish Confirmation Modal */}
      <PublishConfirmationModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
        test={test}
        exam={exam}
        questionsCount={resolvedQuestions.length}
        isPublishing={isPublishing}
      />
    </div>
  );
}
