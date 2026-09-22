import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Layers, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  ExternalLink,
  Shield,
  FileText
} from 'lucide-react';
import { 
  cbtTestService, 
  FACULTY_TEST_STATUS, 
  getFacultyTestTypeLabel, 
  getNormalizedFacultyStatus 
} from '../../services/cbtTestService.js';
import { peopleService } from '../../services/peopleService.js';
import { catalogService } from '../../services/catalogService.js';
import { curriculumService } from '../../services/curriculumService.js';
import FacultyTestStatusBadge from '../../components/faculty/tests/FacultyTestStatusBadge.jsx';
import FacultyTestConfigurationNav from '../../components/faculty/tests/FacultyTestConfigurationNav.jsx';
import ExamPatternPreview from '../../components/common/ExamPatternPreview.jsx';
import TestStructureBuilder from '../../components/common/TestStructureBuilder.jsx';

export default function FacultyTestStructurePage() {
  const { id, unitId } = useParams();
  const navigate = useNavigate();

  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const [test, setTest] = useState(() => cbtTestService.getTestById(id));
  const [structure, setStructure] = useState(() => {
    try {
      return cbtTestService.getFacultyTestStructure(id, currentFaculty);
    } catch {
      return null;
    }
  });

  // Reactive subscription
  useEffect(() => {
    const unsub = cbtTestService.subscribe(() => {
      const updated = cbtTestService.getTestById(id);
      setTest(updated);
      if (updated) {
        try {
          setStructure(cbtTestService.getFacultyTestStructure(id, currentFaculty));
        } catch {
          // ignore
        }
      }
    });
    return unsub;
  }, [id, currentFaculty]);

  if (!test) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-24 space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Assessment Not Found</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The requested assessment could not be located in your faculty roster.
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

  const examId = test.examId || test.examTrack || test.courseId;
  const exam = catalogService.getExamById(examId);
  const currentStatus = getNormalizedFacultyStatus(test);
  const canEdit = currentStatus === FACULTY_TEST_STATUS.DRAFT || currentStatus === FACULTY_TEST_STATUS.UPCOMING;

  const handleSaveExamPattern = async (newPattern) => {
    cbtTestService.updateFacultyTestExamPattern(test.id, newPattern, currentFaculty);
    setTest(cbtTestService.getTestById(test.id));
  };

  const handleSaveCurriculumScope = async (newScope) => {
    cbtTestService.updateFacultyTestCurriculumScope(test.id, newScope, currentFaculty);
    setTest(cbtTestService.getTestById(test.id));
  };

  const handleSaveStructure = async (newStructure) => {
    cbtTestService.updateFacultyTestStructure(test.id, newStructure, currentFaculty);
    setStructure(newStructure);
    setTest(cbtTestService.getTestById(test.id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Breadcrumb & ID */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/faculty/tests" className="hover:text-indigo-600 transition-colors">
            Faculty Tests
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/faculty/tests/${test.id}`} className="hover:text-indigo-600 transition-colors truncate max-w-xs">
            {test.name || test.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800">Phase 2: Structure</span>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          ID: {test.id}
        </span>
      </div>

      {/* Top 6-Phase Navigation */}
      <FacultyTestConfigurationNav currentStep={2} testId={test.id} />

      {/* Main Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {test.code}
              </span>
              <FacultyTestStatusBadge status={currentStatus} />
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Phase 2: Structure
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                <Shield className="w-3 h-3 text-indigo-500" /> {test.facultyName || currentFaculty?.name}
              </span>
              {!canEdit && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked ({currentStatus})
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {test.name || test.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                Define assessment sections and blocks scoped to your authorized curriculum under <strong>{exam?.name || examId}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/faculty/tests/${test.id}`}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Full-Width Phase 2 Workspace: Structure */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Phase 2 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Phase 2: Structure
              </h2>
              <p className="text-xs text-slate-500">
                Exam Pattern + Curriculum + Test Structure
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 self-start sm:self-center">
            <Layers className="w-3.5 h-3.5" />
            {structure?.sections?.length ? `${structure.sections.length} Sections Defined` : (structure?.units?.length ? `${structure.units.length} Containers Defined` : 'Structure Config')}
          </span>
        </div>

        {/* Test Structure Builder */}
        <TestStructureBuilder
          test={test}
          initialExamPattern={test.examPattern}
          initialCurriculumScope={test.curriculumScope}
          initialStructure={structure}
          examId={examId}
          isEditable={canEdit}
          onSaveExamPattern={handleSaveExamPattern}
          onSaveCurriculumScope={handleSaveCurriculumScope}
          onSaveStructure={handleSaveStructure}
          role="faculty"
          allowedSubjectIds={currentFaculty?.assignedSubjects}
          testAllowedQuestionTypes={test.questionTypeConfig?.allowedTypes}
        />

        {/* Phase Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Link
            to={`/faculty/tests/${test.id}`}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous: Foundation</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={`/faculty/tests/${test.id}/rules`}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Next: Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
