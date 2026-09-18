import React, { useState, useEffect, useMemo } from 'react';
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
  RotateCcw,
  Globe,
  Layers
} from 'lucide-react';
import { 
  cbtTestService, 
  FACULTY_TEST_STATUS, 
  getNormalizedFacultyStatus, 
  getFacultyTestTypeLabel,
  getAssessmentMethodLabel,
  getAssessmentMethodBadgeClass 
} from '../../services/cbtTestService.js';
import { catalogService } from '../../services/catalogService.js';
import { peopleService } from '../../services/peopleService.js';
import { questionService } from '../../services/questionService.js';
import { 
  testBuildService, 
  BUILD_MODES, 
  BUILD_STATUS 
} from '../../services/testBuildService.js';
import FacultyTestStatusBadge from '../../components/faculty/tests/FacultyTestStatusBadge.jsx';
import FacultyTestConfigurationNav from '../../components/faculty/tests/FacultyTestConfigurationNav.jsx';
import BuildModeSelector from '../../components/common/BuildModeSelector.jsx';
import BlueprintBuildPanel from '../../components/common/BlueprintBuildPanel.jsx';
import BuildPreviewModal from '../../components/common/BuildPreviewModal.jsx';
import ManualBuildWorkspace from '../../components/common/ManualBuildWorkspace.jsx';
import QuestionPreviewModal from '../../components/common/QuestionPreviewModal.jsx';

export default function FacultyTestBuildPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentFaculty = peopleService.getCurrentFacultyProfile();

  const [test, setTest] = useState(() => cbtTestService.getTestById(id));
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
      const updated = cbtTestService.getTestById(id);
      setTest(updated);
    };
    window.addEventListener('medprep-cbt-tests-updated', handler);
    return () => window.removeEventListener('medprep-cbt-tests-updated', handler);
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
    return testBuildService.getEligibleQuestions(test, 'faculty', currentFaculty);
  }, [test, currentFaculty]);

  const buildState = useMemo(() => {
    return testBuildService.getBuildState(test, 'faculty', currentFaculty);
  }, [test, currentFaculty]);

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
      testBuildService.applyBuild(id, questionIds, { mode: BUILD_MODES.BLUEPRINT, source: 'BLUEPRINT' }, 'faculty', currentFaculty);
      setIsPreviewOpen(false);
      setCandidateResult(null);
      showToast(`Successfully committed ${questionIds.length} questions to assessment via Blueprint Build.`);
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
    testBuildService.buildManually(id, updated, 'faculty', currentFaculty);
    showToast('Question added to assessment.');
  };

  const handleAddBulkManual = (qIds) => {
    const currentSet = new Set(attachedQuestionIds.map(String));
    const toAdd = qIds.filter(qId => !currentSet.has(String(qId)));
    if (toAdd.length === 0) return;
    const updated = [...attachedQuestionIds, ...toAdd];
    testBuildService.buildManually(id, updated, 'faculty', currentFaculty);
    showToast(`Added ${toAdd.length} questions to assessment.`);
  };

  const handleRemoveQuestionManual = (qId) => {
    const updated = attachedQuestionIds.filter(id => String(id) !== String(qId));
    testBuildService.buildManually(id, updated, 'faculty', currentFaculty);
    showToast('Question removed from assessment.');
  };

  const handleReorderManual = (orderedIds) => {
    testBuildService.buildManually(id, orderedIds, 'faculty', currentFaculty);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all attached questions from this assessment?')) {
      testBuildService.clearBuild(id, 'faculty', currentFaculty);
      showToast('All assessment questions cleared.');
    }
  };

  if (!test) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="p-6 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Assessment Not Found</h2>
          <p className="text-xs text-slate-500">The assessment with ID "{id}" could not be found in your faculty roster.</p>
          <Link
            to="/faculty/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Faculty Tests
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = getNormalizedFacultyStatus(test);
  const isEditable = [FACULTY_TEST_STATUS.DRAFT, FACULTY_TEST_STATUS.UPCOMING].includes(currentStatus);
  const isLocked = !isEditable;
  const targetQuestions = Number(test.targetQuestions) || Number(test.totalQuestions) || 0;
  const exam = test?.examId ? catalogService.getExamById(test.examId) : null;

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
          <Link to="/faculty/tests" className="hover:text-indigo-600 transition-colors">Faculty Assessments</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/faculty/tests/${id}`} className="hover:text-indigo-600 transition-colors truncate max-w-xs">{test.name || test.title}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800">Phase 5: Generate / Build</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">ID: {id}</span>
      </div>

      {/* Top 6-Phase Navigation */}
      <FacultyTestConfigurationNav currentStep={5} testId={id} />

      {/* Main Header Banner: Test Identity */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <FacultyTestStatusBadge status={currentStatus} />
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200 tracking-wide">
                {test.code || test.id}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                {getFacultyTestTypeLabel(test.testType)}
              </span>
              {test.assessmentMethod && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${getAssessmentMethodBadgeClass(test.assessmentMethod)}`}>
                  {getAssessmentMethodLabel(test.assessmentMethod)}
                </span>
              )}
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">
                Phase 5: Generate / Build
              </span>
              {isLocked && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked ({currentStatus})
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {test.name || test.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Associated Exam: <strong className="text-slate-800 font-semibold">{exam?.name || test.course || test.examId}</strong>
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
              to={`/faculty/tests/${id}`}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessment Detail
            </Link>
          </div>
        </div>
      </div>

      {/* Full-Width Phase 5 Workspace: Generate / Build */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Phase 5 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">
              05
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Phase 5: Generate / Build
              </h2>
              <p className="text-xs text-slate-500">
                Assemble the Assessment Question Set
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

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Mode:</span>
              <span className="font-bold text-slate-800">{buildState.mode || 'None'}</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Questions Attached:</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{buildState.questionCount}</span>
              <span className="text-slate-400">/ {targetQuestions || '—'} Target</span>
            </div>

            {test.build?.generatedAt && (
              <>
                <div className="h-4 w-px bg-slate-200 hidden lg:block" />
                <span className="text-[11px] text-slate-400">
                  Built {new Date(test.build.generatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            )}
          </div>

          {attachedQuestionIds.length > 0 && !isLocked && (
            <button
              type="button"
              onClick={handleClearAll}
              className="self-start md:self-center px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 font-bold transition-colors flex items-center gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Questions
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
            role="faculty"
            requestingFaculty={currentFaculty}
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
            isLocked={isLocked}
          />
        )}

        {/* Phase Footer Navigation */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to={`/faculty/tests/${id}/rules`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors order-2 sm:order-1"
          >
            <ArrowLeft className="w-4 h-4" /> Previous: Phase 4 (Rules)
          </Link>

          <div className="flex items-center gap-3 self-end sm:self-center order-1 sm:order-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500">
                Current Roster: <strong className="text-slate-800 font-bold">{attachedQuestionIds.length} Questions</strong>
              </div>
              {targetQuestions > 0 && attachedQuestionIds.length === targetQuestions && (
                <div className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Target requirement fulfilled
                </div>
              )}
            </div>

            <Link
              to={`/faculty/tests/${id}/review`}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm ${
                attachedQuestionIds.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              Next: Phase 6 (Review &amp; Publish)
              <ArrowRight className="w-4 h-4" />
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
            const res = testBuildService.generateFromBlueprint(test, {}, 'faculty', currentFaculty);
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
