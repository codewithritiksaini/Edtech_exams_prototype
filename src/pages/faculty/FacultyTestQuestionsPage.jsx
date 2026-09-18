import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  BookOpen, 
  Layers, 
  BarChart3, 
  Users, 
  Lock, 
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { 
  cbtTestService, 
  FACULTY_TEST_STATUS, 
  getNormalizedFacultyStatus,
  getFacultyTestTypeLabel 
} from '../../services/cbtTestService';
import { peopleService } from '../../services/peopleService';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import FacultyTestStatusBadge from '../../components/faculty/tests/FacultyTestStatusBadge';
import QuestionBankBrowser from '../../components/common/QuestionBankBrowser.jsx';
import SelectedQuestionsPanel from '../../components/common/SelectedQuestionsPanel.jsx';
import QuestionPreviewModal from '../../components/common/QuestionPreviewModal.jsx';

export default function FacultyTestQuestionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentFaculty] = useState(() => peopleService.getCurrentFacultyProfile());
  const [test, setTest] = useState(() => cbtTestService.getTestById(id));
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [previewingQuestion, setPreviewingQuestion] = useState(null);

  // Subscribe to reactive updates
  useEffect(() => {
    const unsub = cbtTestService.subscribe(() => {
      setTest(cbtTestService.getTestById(id));
    });
    return unsub;
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast({ message: '', type: 'success' }), 3500);
    return () => clearTimeout(timer);
  };

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
  const isLocked = currentStatus === FACULTY_TEST_STATUS.LIVE || 
                   currentStatus === FACULTY_TEST_STATUS.COMPLETED || 
                   currentStatus === FACULTY_TEST_STATUS.CANCELLED;

  const examId = test.examId || test.examTrack || test.courseId || 'neet-pg';
  const examObj = catalogService.getExamById(examId);
  const subjectName = test.subjectId ? curriculumService.getSubjectById(test.subjectId)?.name : 'All Program Subjects';

  // Question IDs array
  const questionIds = useMemo(() => {
    return Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);
  }, [test]);

  // Validation report
  const validation = useMemo(() => {
    return cbtTestService.validateFacultyTestContent(test.id, currentFaculty);
  }, [test, currentFaculty]);

  // Handlers for Question modifications
  const handleAddQuestion = (questionId) => {
    try {
      cbtTestService.addQuestionToFacultyTest(test.id, questionId, currentFaculty);
      setTest(cbtTestService.getTestById(id));
      showToast(`Question ${questionId} added to test!`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddQuestions = (newIds) => {
    try {
      cbtTestService.addQuestionsToFacultyTest(test.id, newIds, currentFaculty);
      setTest(cbtTestService.getTestById(id));
      showToast(`Added ${newIds.length} questions to test!`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveQuestion = (questionId) => {
    try {
      cbtTestService.removeQuestionFromFacultyTest(test.id, questionId, currentFaculty);
      setTest(cbtTestService.getTestById(id));
      showToast(`Question ${questionId} removed from test.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReorderQuestions = (newOrderedIds) => {
    try {
      cbtTestService.reorderFacultyTestQuestions(test.id, newOrderedIds, currentFaculty);
      setTest(cbtTestService.getTestById(id));
      showToast('Question order updated.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveAndReturn = () => {
    setSavedFeedback(true);
    setTimeout(() => {
      navigate(`/faculty/tests/${test.id}`, {
        state: { message: `Question assembly for "${test.name}" saved successfully!` }
      });
    }, 400);
  };

  const targetCount = test.targetQuestions || 25;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 pb-20 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 transition-all animate-in slide-in-from-top-4 ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white border border-slate-700'
        }`}>
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation & Breadcrumb Links */}
      <div className="flex items-center justify-between">
        <Link 
          to={`/faculty/tests/${test.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Overview
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Code: {test.code || test.id}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <FacultyTestStatusBadge status={currentStatus} />
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {test.code || test.id}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                {getFacultyTestTypeLabel(test.testType)}
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{test.name || test.title}</span>
                <span className="text-slate-400 font-light">— Question Assembly</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  {examObj?.name || test.course || examId}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Subject: <strong className="text-slate-700 font-semibold">{subjectName}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Owner: {test.facultyName || 'Dr. Siddharth V.'}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to={`/faculty/tests/${test.id}/results`}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              Results
            </Link>

            <button
              type="button"
              onClick={handleSaveAndReturn}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save & Return
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Summary & Readiness Metrics Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-slate-400 font-medium">Questions Selected:</span>{' '}
              <strong className="text-slate-900 font-black text-sm">{questionIds.length}</strong>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Target Questions:</span>{' '}
              <span className="text-slate-700 font-semibold">{targetCount}</span>
            </div>

            {/* Validation Pill */}
            <div>
              {validation.errors.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  {validation.errors[0] === 'NO_QUESTIONS' ? 'Incomplete: 0 Questions Added' : 'Content Validation Error'}
                </span>
              ) : validation.warnings.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  {questionIds.length < targetCount ? `${targetCount - questionIds.length} more needed` : `${questionIds.length - targetCount} over target`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Content Ready ({questionIds.length} Questions)
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Changes are automatically synchronized in real time
          </div>
        </div>
      </div>

      {/* Editability Alert (if locked) */}
      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-xs">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong className="font-bold">Read-Only Assessment:</strong>{' '}
            This Test is no longer editable because it is currently {currentStatus === FACULTY_TEST_STATUS.LIVE ? 'Live' : currentStatus === FACULTY_TEST_STATUS.COMPLETED ? 'Completed' : 'Cancelled'}. Questions cannot be added, removed, or reordered.
          </div>
        </div>
      )}

      {/* Two-Column Question Assembly Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-280px)] min-h-[580px]">
        {/* Left Column (7 cols): Question Bank Panel */}
        <div className="lg:col-span-7 h-full">
          <QuestionBankBrowser
            test={test}
            selectedQuestionIds={questionIds}
            onAddQuestion={handleAddQuestion}
            onAddQuestions={handleAddQuestions}
            onPreviewQuestion={setPreviewingQuestion}
            role="faculty"
            requestingFaculty={currentFaculty}
            isLocked={isLocked}
            authorLink={`/faculty/tests/${test.id}/questions/create`}
          />
        </div>

        {/* Right Column (5 cols): Selected Questions Panel */}
        <div className="lg:col-span-5 h-full">
          <SelectedQuestionsPanel
            test={test}
            questionIds={questionIds}
            onRemoveQuestion={handleRemoveQuestion}
            onReorderQuestions={handleReorderQuestions}
            onPreviewQuestion={setPreviewingQuestion}
            isLocked={isLocked}
            validation={validation}
          />
        </div>
      </div>

      {/* Question Preview Modal */}
      <QuestionPreviewModal
        isOpen={Boolean(previewingQuestion)}
        onClose={() => setPreviewingQuestion(null)}
        question={previewingQuestion}
      />
    </div>
  );
}
