import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit3, 
  Copy, 
  Archive, 
  RotateCcw, 
  Clock, 
  Layers, 
  Globe, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  BookOpen,
  Lock,
  ChevronRight,
  Info,
  ShieldAlert,
  ArrowUpRight,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { 
  adminTestService, 
  TEST_STATUS, 
  getTestTypeLabel 
} from '../../services/adminTestService';
import { getAssessmentMethodLabel, getAssessmentMethodBadgeClass } from '../../services/assessmentMethodService.js';
import { normalizeUnitConfiguration } from '../../services/examPatternHelper';
import { 
  questionTypeService, 
  DEFAULT_TEST_ALLOWED_QUESTION_TYPES 
} from '../../services/questionTypeService';
import { formatScoringScheme, formatTimingMode, formatNavigationMode } from '../../services/testRulesService';
import TestStatusBadge from '../../components/admin/tests/TestStatusBadge';
import TestConfigurationStepper from '../../components/admin/tests/TestConfigurationStepper';
import TestDuplicateModal from '../../components/admin/tests/TestDuplicateModal';
import TestArchiveModal from '../../components/admin/tests/TestArchiveModal';

export default function AdminTestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [test, setTest] = useState(() => adminTestService.getTest(id));
  const [structure, setStructure] = useState(() => {
    try {
      return adminTestService.getAdminTestStructure(id);
    } catch {
      return null;
    }
  });

  const configReport = useMemo(() => {
    try {
      return adminTestService.validateAdminTestConfiguration(id);
    } catch {
      return null;
    }
  }, [id, structure]);
  const [toastMessage, setToastMessage] = useState('');
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);

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
    const unsub = adminTestService.subscribe(() => {
      setTest(adminTestService.getTest(id));
      try {
        setStructure(adminTestService.getAdminTestStructure(id));
      } catch {
        // ignore
      }
    });
    return unsub;
  }, [id]);

  if (!test) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-24 space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Test Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The requested test could not be found or may have been deleted from local storage.
        </p>
        <div className="pt-2">
          <Link
            to="/admin/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Test Management
          </Link>
        </div>
      </div>
    );
  }

  const exam = adminTestService.getExamById(test.examId);

  const handleDuplicateSuccess = (newTest) => {
    setDuplicateModalOpen(false);
    navigate(`/admin/tests/${newTest.id}`, {
      state: { message: `Duplicated successfully as "${newTest.name}" (Draft)!` }
    });
  };

  const handleArchive = () => {
    try {
      adminTestService.archiveTest(test.id);
      setArchiveModalOpen(false);
      setToastMessage(`Test "${test.name}" archived successfully.`);
      setTest(adminTestService.getTest(id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRestore = () => {
    try {
      adminTestService.restoreTest(test.id);
      setToastMessage(`Test "${test.name}" restored to Draft.`);
      setTest(adminTestService.getTest(id));
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDurationHint = (mins) => {
    const num = Number(mins) || 0;
    const hours = Math.floor(num / 60);
    const m = num % 60;
    if (hours > 0 && m > 0) return `${hours} hr ${m} min`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${m} mins`;
  };

  const isArchived = test.status === TEST_STATUS.ARCHIVED;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm flex items-center justify-between transition-all animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage('')}
            className="text-white/80 hover:text-white text-xs font-semibold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/tests" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Management
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          ID: {test.id}
        </span>
      </div>

      {/* Top 6-Phase Navigation */}
      <TestConfigurationStepper currentStep={1} testId={test.id} role="admin" />

      {/* Main Header Banner: Test Identity */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Test Identity */}
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

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to={`/admin/tests/${test.id}/edit`}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Setup
            </Link>

            <button
              type="button"
              onClick={() => setDuplicateModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              Duplicate
            </button>

            {isArchived ? (
              <button
                type="button"
                onClick={handleRestore}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                Restore to Draft
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setArchiveModalOpen(true)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Archive className="w-3.5 h-3.5 text-slate-400" />
                Archive
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full-Width Phase 1 Workspace: Foundation */}
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
                Core identity, exam association, and scope metadata
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
              Target Questions
            </div>
            <div className="text-xl font-black text-slate-800 mt-1">
              {test.targetQuestions || '—'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Planning quota</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Target Duration
            </div>
            <div className="text-xl font-black text-slate-800 mt-1">
              {test.targetDuration || '—'} <span className="text-xs font-medium text-slate-400">min</span>
            </div>
            <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
              ≈ {formatDurationHint(test.targetDuration)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Test Type
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1 truncate">
              {getTestTypeLabel(test.testType)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Assessment scope</div>
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
              Delivery Language
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {test.language || 'English'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Primary language</div>
          </div>
        </div>

        {/* Associated Medical Exam Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/50 to-slate-50 border border-indigo-100/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Associated Medical Exam
              </div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {exam?.name || test.examId}
              </div>
              <div className="text-xs text-slate-600 mt-0.5 max-w-xl">
                {exam?.description || 'Curriculum context established in the MedPrep catalog.'}
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-1 bg-white text-indigo-900 rounded border border-indigo-200 shrink-0">
              {test.examId}
            </span>
          </div>
        </div>

        {/* Description & Instructions */}
        <div className="space-y-4 pt-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Clinical Scope &amp; Description
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {test.description || <span className="text-slate-400 italic">No description provided for this test.</span>}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Candidate Instructions
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {test.instructions || <span className="text-slate-400 italic">No pre-test instructions defined.</span>}
            </div>
          </div>
        </div>

        {/* Timestamps and Audit Info */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <span>Created: {new Date(test.createdAt).toLocaleDateString()} at {new Date(test.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Updated: {new Date(test.updatedAt).toLocaleDateString()} at {new Date(test.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <span className="text-indigo-600 font-semibold">
            Permanent Code: {test.code}
          </span>
        </div>

        {/* Phase Footer Navigation */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <div className="flex items-center gap-3">
            <Link
              to={`/admin/tests/${test.id}/edit`}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit Setup
            </Link>

            <Link
              to={`/admin/tests/${test.id}/structure`}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Next: Structure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Duplicate Modal */}
      <TestDuplicateModal
        test={duplicateModalOpen ? test : null}
        onClose={() => setDuplicateModalOpen(false)}
        onDuplicateSuccess={handleDuplicateSuccess}
      />

      {/* Archive Modal */}
      <TestArchiveModal
        test={archiveModalOpen ? test : null}
        onClose={() => setArchiveModalOpen(false)}
        onConfirmArchive={handleArchive}
      />
    </div>
  );
}
