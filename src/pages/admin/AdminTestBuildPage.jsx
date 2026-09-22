import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Cpu, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Lock, 
  Sliders, 
  Sparkles,
  Layers,
  RotateCcw,
  Globe
} from 'lucide-react';
import { 
  adminTestService, 
  TEST_STATUS, 
  getTestTypeLabel, 
  getAssessmentMethodLabel,
  getAssessmentMethodBadgeClass,
  EVENT_ADMIN_TESTS_UPDATED 
} from '../../services/adminTestService.js';
import { questionBankService } from '../../services/questionBankService.js';
import { questionService } from '../../services/questionService.js';
import { 
  testBuildService, 
  BUILD_MODES, 
  BUILD_STATUS 
} from '../../services/testBuildService.js';
import TestStatusBadge from '../../components/admin/tests/TestStatusBadge.jsx';
import TestConfigurationStepper from '../../components/admin/tests/TestConfigurationStepper.jsx';
import BuildModeSelector from '../../components/common/BuildModeSelector.jsx';
import BlueprintBuildPanel from '../../components/common/BlueprintBuildPanel.jsx';
import BuildPreviewModal from '../../components/common/BuildPreviewModal.jsx';
import ManualBuildWorkspace from '../../components/common/ManualBuildWorkspace.jsx';
import QuestionPreviewModal from '../../components/common/QuestionPreviewModal.jsx';

export default function AdminTestBuildPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(() => adminTestService.getTest(id));
  const [activeMode, setActiveMode] = useState(() => test?.build?.mode || BUILD_MODES.BLUEPRINT);
  const [candidateResult, setCandidateResult] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [inspectQuestion, setInspectQuestion] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Reactive subscription
  useEffect(() => {
    const handler = () => {
      const updated = adminTestService.getTest(id);
      setTest(updated);
    };
    window.addEventListener(EVENT_ADMIN_TESTS_UPDATED, handler);
    return () => window.removeEventListener(EVENT_ADMIN_TESTS_UPDATED, handler);
  }, [id]);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const attachedQuestionIds = useMemo(() => {
    if (!test) return [];
    return Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);
  }, [test]);

  const attachedQuestions = useMemo(() => {
    return questionService.getQuestionsByIds(attachedQuestionIds);
  }, [attachedQuestionIds]);

  const eligibleQuestions = useMemo(() => {
    if (!test) return [];
    return testBuildService.getEligibleQuestions(test, 'admin', null);
  }, [test]);

  const buildState = useMemo(() => {
    return testBuildService.getBuildState(test, 'admin', null);
  }, [test]);

  // Generation Success from Blueprint Panel
  const handleGenerationSuccess = (result) => {
    const questions = questionService.getQuestionsByIds(result.questionIds);
    setCandidateResult({
      ...result,
      questions
    });
    setIsPreviewOpen(true);
  };

  // Apply Blueprint Build
  const handleApplyBuild = async (questionIds) => {
    setIsApplying(true);
    try {
      await new Promise(r => setTimeout(r, 250));
      testBuildService.applyBuild(id, questionIds, { mode: BUILD_MODES.BLUEPRINT, source: 'BLUEPRINT' }, 'admin');
      setIsPreviewOpen(false);
      setCandidateResult(null);
      showToast(`Successfully committed ${questionIds.length} questions to test via Blueprint Build.`);
    } catch (err) {
      showToast(err.message || 'Failed to apply build.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  // Manual Build handlers
  const handleAddQuestionManual = (qId) => {
    const current = [...attachedQuestionIds];
    if (current.includes(String(qId))) return;
    const updated = [...current, String(qId)];
    testBuildService.buildManually(id, updated, 'admin');
    showToast('Question added to test.');
  };

  const handleAddBulkManual = (qIds) => {
    const currentSet = new Set(attachedQuestionIds.map(String));
    const toAdd = qIds.filter(qId => !currentSet.has(String(qId)));
    if (toAdd.length === 0) return;
    const updated = [...attachedQuestionIds, ...toAdd];
    testBuildService.buildManually(id, updated, 'admin');
    showToast(`Added ${toAdd.length} questions to test.`);
  };

  const handleRemoveQuestionManual = (qId) => {
    const updated = attachedQuestionIds.filter(id => String(id) !== String(qId));
    testBuildService.buildManually(id, updated, 'admin');
    showToast('Question removed from test.');
  };

  const handleReorderManual = (orderedIds) => {
    testBuildService.buildManually(id, orderedIds, 'admin');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all attached questions from this test?')) {
      testBuildService.clearBuild(id, 'admin');
      showToast('All test questions cleared.');
    }
  };

  if (!test) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="p-6 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Admin Test Not Found</h2>
          <p className="text-xs text-slate-500">The test with ID "{id}" could not be found.</p>
          <Link
            to="/admin/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  const isLocked = ![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status);
  const targetQuestions = Number(test.targetQuestions) || Number(test.totalQuestions) || 0;
  const exam = test?.examId ? adminTestService.getExamById(test.examId) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 text-white animate-fade-in ${
          toastType === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toastType === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & ID */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/admin/tests" className="hover:text-indigo-600 transition-colors">Test Management</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/admin/tests/${id}`} className="hover:text-indigo-600 transition-colors truncate max-w-xs">{test.name}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800">Phase 4: Content &amp; Build</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">ID: {id}</span>
      </div>

      {/* Top 5-Phase Navigation */}
      <TestConfigurationStepper currentStep={4} testId={id} role="admin" />

      {/* Main Header Banner: Test Identity */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <TestStatusBadge status={test.status} />
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200/80 tracking-wide">
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
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Phase 4: Content &amp; Build
              </span>
              {isLocked && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Read-Only ({test.status})
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {test.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Associated Exam: <strong className="text-slate-800 font-semibold">{exam?.name || test.examId}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Language: <strong className="text-slate-700">{test.language || 'English'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/admin/tests/${id}`}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Detail
            </Link>
          </div>
        </div>
      </div>

      {/* Full-Width Phase 4 Workspace: Content & Build */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Phase 4 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Phase 4: Content &amp; Build
              </h2>
              <p className="text-xs text-slate-500">
                Author and assemble the canonical Test Question Roster
              </p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 self-start sm:self-center ${
            buildState.isReady
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Cpu className="w-3.5 h-3.5" />
            {buildState.isReady ? 'Build Ready' : 'Assembly In Progress'}
          </span>
        </div>

        {/* Integrated Build Engine Status Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <span className="text-slate-500 font-medium">Build Engine:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                buildState.isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {buildState.status}
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              <span className="text-slate-500">Mode: </span>
              <strong className="text-slate-800 font-semibold">{buildState.mode || 'Blueprint'}</strong>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              <span className="text-slate-500">Roster: </span>
              <strong className="text-slate-900 font-bold text-sm">{attachedQuestionIds.length}</strong>
              <span className="text-slate-400"> / {targetQuestions || '—'} Target</span>
            </div>
          </div>

          {attachedQuestionIds.length > 0 && !isLocked && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 font-bold transition-colors flex items-center gap-1.5 text-xs self-start md:self-auto shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Current Questions
            </button>
          )}
        </div>

        {/* Mode Switcher */}
        <BuildModeSelector
          mode={activeMode}
          onSelectMode={setActiveMode}
          isLocked={isLocked}
        />

        {/* Conditional Build Panel */}
        {activeMode === BUILD_MODES.BLUEPRINT ? (
          <BlueprintBuildPanel
            test={test}
            eligibleQuestions={eligibleQuestions}
            role="admin"
            isLocked={isLocked}
            onGenerationSuccess={handleGenerationSuccess}
            onDeficitQuestionsAdded={(newQIds) => {
              handleAddBulkManual(newQIds);
              showToast(`Added ${newQIds.length} deficit question(s) to Question Bank and Test!`);
            }}
          />
        ) : (
          <ManualBuildWorkspace
            test={test}
            attachedQuestions={attachedQuestions}
            targetQuestions={targetQuestions}
            onAddQuestionManual={handleAddQuestionManual}
            onAddQuestionsBulk={handleAddBulkManual}
            onRemoveQuestion={handleRemoveQuestionManual}
            onReorderQuestions={handleReorderManual}
            onClearAll={handleClearAll}
            onQuestionUpdated={() => {
              setTest(adminTestService.getTest(id));
              showToast('Question updated successfully.');
            }}
            isLocked={isLocked}
          />
        )}

        {/* Phase Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Link
            to={`/admin/tests/${id}/rules`}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous: Rules</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={`/admin/tests/${id}/review`}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                attachedQuestionIds.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              <span>Next: Review &amp; Publish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Build Preview Modal */}
      {isPreviewOpen && candidateResult && (
        <BuildPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          candidateResult={candidateResult}
          existingQuestionsCount={attachedQuestionIds.length}
          onApply={handleApplyBuild}
          onRegenerate={() => {
            const res = testBuildService.generateFromBlueprint(test, {}, 'admin');
            if (res.success) {
              res.questions = questionService.getQuestionsByIds(res.questionIds);
              setCandidateResult(res);
            }
          }}
          isApplying={isApplying}
        />
      )}

      {/* Question Inspection Modal */}
      {inspectQuestion && (
        <QuestionPreviewModal
          question={inspectQuestion}
          onClose={() => setInspectQuestion(null)}
        />
      )}
    </div>
  );
}
