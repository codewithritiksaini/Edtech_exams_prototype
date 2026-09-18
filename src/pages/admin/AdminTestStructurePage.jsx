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
  Globe
} from 'lucide-react';
import { 
  adminTestService, 
  TEST_STATUS, 
  getTestTypeLabel,
  getAssessmentMethodLabel,
  getAssessmentMethodBadgeClass 
} from '../../services/adminTestService.js';
import TestStatusBadge from '../../components/admin/tests/TestStatusBadge.jsx';
import TestConfigurationStepper from '../../components/admin/tests/TestConfigurationStepper.jsx';
import ExamPatternPreview from '../../components/common/ExamPatternPreview.jsx';
import TestStructureBuilder from '../../components/common/TestStructureBuilder.jsx';

export default function AdminTestStructurePage() {
  const { id, unitId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(() => adminTestService.getTest(id));
  const [structure, setStructure] = useState(() => {
    try {
      return adminTestService.getAdminTestStructure(id);
    } catch {
      return null;
    }
  });

  // Reactive subscription to updates
  useEffect(() => {
    const unsub = adminTestService.subscribe(() => {
      const updated = adminTestService.getTest(id);
      setTest(updated);
      if (updated) {
        try {
          setStructure(adminTestService.getAdminTestStructure(id));
        } catch {
          // ignore
        }
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
          The requested test could not be found or may have been deleted.
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
  const canEdit = [TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status);

  const handleSaveExamPattern = async (newPattern) => {
    adminTestService.updateAdminTestExamPattern(test.id, newPattern);
    setTest(adminTestService.getTest(test.id));
  };

  const handleSaveCurriculumScope = async (newScope) => {
    adminTestService.updateAdminTestCurriculumScope(test.id, newScope);
    setTest(adminTestService.getTest(test.id));
  };

  const handleSaveStructure = async (newStructure) => {
    adminTestService.updateAdminTestStructure(test.id, newStructure);
    setStructure(newStructure);
    setTest(adminTestService.getTest(test.id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Breadcrumb & ID */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/admin/tests" className="hover:text-indigo-600 transition-colors">
            Test Management
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/admin/tests/${test.id}`} className="hover:text-indigo-600 transition-colors truncate max-w-xs">
            {test.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800">Phase 2: Structure</span>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          ID: {test.id}
        </span>
      </div>

      {/* Top 6-Phase Navigation */}
      <TestConfigurationStepper currentStep={2} testId={test.id} role="admin" />

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
              {!canEdit && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
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
              to={`/admin/tests/${test.id}`}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Detail
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

        {/* Test Structure Builder Interactive Workspace */}
        <TestStructureBuilder
          test={test}
          initialExamPattern={test.examPattern}
          initialCurriculumScope={test.curriculumScope}
          initialStructure={structure}
          examId={test.examId}
          isEditable={canEdit}
          onSaveExamPattern={handleSaveExamPattern}
          onSaveCurriculumScope={handleSaveCurriculumScope}
          onSaveStructure={handleSaveStructure}
          role="admin"
          testAllowedQuestionTypes={test.questionTypeConfig?.allowedTypes}
        />

        {/* Phase Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Link
            to={`/admin/tests/${test.id}`}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous: Foundation</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={`/admin/tests/${test.id}/content`}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Next: Content</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
