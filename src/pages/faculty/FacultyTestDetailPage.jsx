import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit3, 
  Copy, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Layers, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  HelpCircle,
  BarChart3,
  Sparkles,
  Info,
  Sliders,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { 
  cbtTestService, 
  FACULTY_TEST_STATUS, 
  getFacultyTestTypeLabel,
  getNormalizedFacultyStatus 
} from '../../services/cbtTestService';
import { getAssessmentMethodLabel, getAssessmentMethodBadgeClass } from '../../services/assessmentMethodService.js';
import { peopleService } from '../../services/peopleService';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { normalizeUnitConfiguration } from '../../services/examPatternHelper';
import { 
  questionTypeService, 
  DEFAULT_TEST_ALLOWED_QUESTION_TYPES 
} from '../../services/questionTypeService';
import { formatScoringScheme, formatTimingMode } from '../../services/testRulesService';
import FacultyTestStatusBadge from '../../components/faculty/tests/FacultyTestStatusBadge';
import FacultyTestCancelModal from '../../components/faculty/tests/FacultyTestCancelModal';
import FacultyTestConfigurationNav from '../../components/faculty/tests/FacultyTestConfigurationNav';

export default function FacultyTestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [test, setTest] = useState(() => cbtTestService.getTestById(id));
  const [toastMessage, setToastMessage] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Check for navigation toast
  useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setToastMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Reactive subscription
  useEffect(() => {
    const unsub = cbtTestService.subscribe(() => {
      setTest(cbtTestService.getTestById(id));
    });
    return unsub;
  }, [id]);

  if (!test) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-24 space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Assessment Not Found</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The requested assessment could not be located in your authorized faculty roster.
        </p>
        <div className="pt-2">
          <Link
            to="/faculty/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Faculty Tests
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = getNormalizedFacultyStatus(test);
  const isDraft = currentStatus === FACULTY_TEST_STATUS.DRAFT;
  const isUpcoming = currentStatus === FACULTY_TEST_STATUS.UPCOMING;
  const isLive = currentStatus === FACULTY_TEST_STATUS.LIVE;
  const isCompleted = currentStatus === FACULTY_TEST_STATUS.COMPLETED;
  const isCancelled = currentStatus === FACULTY_TEST_STATUS.CANCELLED;

  const canEdit = isDraft || isUpcoming;
  const canCancel = isDraft || isUpcoming;

  // Resolve Exam & Subject names
  const examId = test.examId || test.examTrack || test.courseId;
  const examObj = catalogService.getExamById(examId);
  const subjectName = test.subjectId ? curriculumService.getSubjectById(test.subjectId)?.name : 'All Program Subjects';

  const handleDuplicate = () => {
    try {
      const currentFaculty = peopleService.getCurrentFacultyProfile();
      const duplicated = cbtTestService.duplicateFacultyTest(test.id, currentFaculty);
      navigate(`/faculty/tests/${duplicated.id}`, {
        state: { message: `Assessment duplicated as "${duplicated.name}" (Draft)!` }
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmCancel = (testId) => {
    try {
      const currentFaculty = peopleService.getCurrentFacultyProfile();
      cbtTestService.cancelFacultyTest(testId, currentFaculty);
      setCancelModalOpen(false);
      setToastMessage(`Assessment "${test.name}" was cancelled.`);
      setTest(cbtTestService.getTestById(id));
    } catch (err) {
      alert(err.message);
    }
  };

  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const qCount = test.content?.questionIds?.length ?? (test.questionIds?.length || 0);
  const targetQuestions = test.targetQuestions || test.totalQuestions || 25;
  const validation = cbtTestService.validateFacultyTestContent(test.id, currentFaculty);
  const [structure, setStructure] = useState(() => {
    try {
      return cbtTestService.getFacultyTestStructure(id, currentFaculty);
    } catch {
      return null;
    }
  });

  const configReport = React.useMemo(() => {
    try {
      return cbtTestService.validateFacultyTestConfiguration(id, currentFaculty);
    } catch {
      return null;
    }
  }, [id, structure, currentFaculty]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center justify-between transition-all animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage('')}
            className="text-white/80 hover:text-white text-[11px] font-bold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Breadcrumb & ID */}
      <div className="flex items-center justify-between">
        <Link 
          to="/faculty/tests" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Tests
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          ID: {test.id}
        </span>
      </div>

      {/* Top 6-Phase Navigation */}
      <FacultyTestConfigurationNav currentStep={1} testId={test.id} />

      {/* Main Header Banner */}
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
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {test.name || test.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  {examObj?.name || test.course || examId}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Subject: <strong className="text-slate-700 font-semibold">{subjectName}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Contextual Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {canEdit && (
              <Link
                to={`/faculty/tests/${test.id}/edit`}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Setup
              </Link>
            )}

            <button
              type="button"
              onClick={handleDuplicate}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              Duplicate
            </button>

            {canCancel && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                Cancel Test
              </button>
            )}
          </div>
        </div>
      </div>      {/* Full-Width Phase 1 Workspace: Foundation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Phase 1 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Phase 1: Foundation
              </h2>
              <p className="text-xs text-slate-500">
                Assessment identity, clinical focus, candidate instructions & target cohort
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 self-start sm:self-center">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Questions
            </div>
            <div className="text-xl font-black text-slate-800 mt-1">
              {qCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">MCQs & Vignettes</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Duration
            </div>
            <div className="text-xl font-black text-slate-800 mt-1">
              {test.durationMinutes || 45} <span className="text-xs font-medium text-slate-400">min</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Examination limit</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Assessment Method
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1 truncate">
              {test.assessmentMethod ? getAssessmentMethodLabel(test.assessmentMethod) : <span className="text-slate-400 font-normal italic">Unspecified</span>}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Evaluation methodology</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Marks
            </div>
            <div className="text-xl font-black text-slate-800 mt-1">
              {test.totalMarks || 100}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Pass standard: {test.passingScore || 50}%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Target Cohort
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1 truncate">
              {test.cohort || test.batchTier || 'All Enrolled Candidates'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Eligible doctors</div>
          </div>
        </div>

        {/* Associated Curriculum & Scope */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/50 to-slate-50 border border-indigo-100/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Curriculum Association
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {examObj?.name || test.course || examId}
              </h4>
              <p className="text-xs text-slate-500">
                Subject: <strong className="text-slate-700">{subjectName}</strong>
                {test.system && <span> • Domain: <strong className="text-slate-700">{test.system}</strong></span>}
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-slate-600 self-start sm:self-auto shadow-2xs">
              Pattern: {structure?.patternType || 'Single Section CBT'}
            </span>
          </div>
        </div>

        {/* Description & Clinical Focus */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Clinical Focus & Scope
          </h3>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {test.description || <span className="text-slate-400 italic">No description provided for this assessment.</span>}
          </div>
        </div>

        {/* Candidate Instructions */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Candidate Pre-Test Instructions
          </h3>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {Array.isArray(test.instructions) 
              ? test.instructions.join('\n') 
              : (test.instructions || <span className="text-slate-400 italic">Standard examination guidelines apply.</span>)}
          </div>
        </div>

        {/* Administration, Scheduling & Ownership */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Scheduling Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Scheduling Details
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Scheduled Window</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                  {test.formattedWindow || test.date || 'Upcoming'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Start Time</span>
                <span className="font-medium text-slate-700 text-xs mt-0.5 block">
                  {test.scheduling?.startTime || test.time || '18:00 IST'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration</span>
                <span className="font-medium text-slate-700 text-xs mt-0.5 block">
                  {test.durationMinutes || 45} mins
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Timezone</span>
                <span className="font-mono text-slate-600 text-xs mt-0.5 block">
                  {test.scheduling?.timezone || 'Asia/Kolkata'}
                </span>
              </div>
            </div>
          </div>

          {/* Faculty Ownership */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Faculty Ownership
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Faculty In-Charge</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {test.facultyName || 'Dr. Siddharth V.'}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  ID: {test.facultyId || 'fac-1'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Created: {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'Initial prototype'}</span>
                <span>Updated: {test.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : 'Initial prototype'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            {canEdit && (
              <Link
                to={`/faculty/tests/${test.id}/edit`}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit Setup
              </Link>
            )}

            <Link
              to={`/faculty/tests/${test.id}/structure`}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Next: Structure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <FacultyTestCancelModal
        test={test}
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}
