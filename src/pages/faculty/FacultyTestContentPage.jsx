import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  HelpCircle, 
  Layers, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  Lock, 
  Save, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  Info, 
  ChevronRight, 
  ExternalLink, 
  FileSpreadsheet, 
  Plus, 
  BookOpen, 
  Filter,
  Globe
} from 'lucide-react';
import { 
  cbtTestService, 
  FACULTY_TEST_STATUS, 
  getNormalizedFacultyStatus,
  getFacultyTestTypeLabel,
  getAssessmentMethodLabel,
  getAssessmentMethodBadgeClass
} from '../../services/cbtTestService.js';
import { peopleService } from '../../services/peopleService.js';
import { catalogService } from '../../services/catalogService.js';
import { curriculumService } from '../../services/curriculumService.js';
import { 
  questionTypeService, 
  QUESTION_TYPE_INHERITANCE_MODES, 
  DEFAULT_TEST_ALLOWED_QUESTION_TYPES 
} from '../../services/questionTypeService.js';
import FacultyTestStatusBadge from '../../components/faculty/tests/FacultyTestStatusBadge.jsx';
import FacultyTestConfigurationNav from '../../components/faculty/tests/FacultyTestConfigurationNav.jsx';
import ExamPatternPreview from '../../components/common/ExamPatternPreview.jsx';
import QuestionTypeSelector from '../../components/common/QuestionTypeSelector.jsx';
import SectionConfigurationModal from '../../components/common/SectionConfigurationModal.jsx';
import QuestionBankBrowser from '../../components/common/QuestionBankBrowser.jsx';
import SelectedQuestionsPanel from '../../components/common/SelectedQuestionsPanel.jsx';
import QuestionPreviewModal from '../../components/common/QuestionPreviewModal.jsx';

export default function FacultyTestContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: 'types' or 'assembly'
  const activeTab = searchParams.get('tab') || 'types';

  const [currentFaculty] = useState(() => peopleService.getCurrentFacultyProfile());
  const [test, setTest] = useState(() => cbtTestService.getTestById(id));
  const [selectedTypes, setSelectedTypes] = useState(() => {
    if (!test) return [];
    try {
      const config = cbtTestService.getFacultyTestQuestionTypeConfig(id, currentFaculty);
      return config.allowedTypes || [];
    } catch {
      return [...DEFAULT_TEST_ALLOWED_QUESTION_TYPES];
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [configuringUnit, setConfiguringUnit] = useState(null);
  const [previewingQuestion, setPreviewingQuestion] = useState(null);

  useEffect(() => {
    const unsub = cbtTestService.subscribe(() => {
      const updated = cbtTestService.getTestById(id);
      setTest(updated);
      if (updated?.questionTypeConfig?.allowedTypes) {
        setSelectedTypes(updated.questionTypeConfig.allowedTypes);
      }
    });
    return unsub;
  }, [id]);

  if (!test) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="p-6 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Faculty Test Not Found</h2>
          <p className="text-xs text-slate-500">
            The requested assessment with ID &quot;{id}&quot; does not exist or has been deleted.
          </p>
          <Link
            to="/faculty/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Faculty Tests
          </Link>
        </div>
      </div>
    );
  }

  const exam = catalogService.getExamById(test.examId);
  const currentStatus = getNormalizedFacultyStatus(test);
  const canEdit = currentStatus === FACULTY_TEST_STATUS.DRAFT || currentStatus === FACULTY_TEST_STATUS.UPCOMING;
  const isLocked = !canEdit;

  const structure = test.structure || cbtTestService.getFacultyTestStructure(test.id, currentFaculty);
  const units = structure?.units || [];
  const examSupported = questionTypeService.getExamSupportedQuestionTypes(test.examId);

  // Question Assembly State
  const attachedQuestionIds = Array.isArray(test.content?.questionIds)
    ? test.content.questionIds
    : (Array.isArray(test.questionIds) ? test.questionIds : []);

  const contentValidation = useMemo(() => {
    try {
      return cbtTestService.validateFacultyTestContent(test.id, currentFaculty);
    } catch {
      return { valid: true, questionCount: attachedQuestionIds.length, errors: [], warnings: [] };
    }
  }, [test, attachedQuestionIds, currentFaculty]);

  const qtValidation = useMemo(() => {
    return questionTypeService.validateTestQuestionTypeConfig({
      mode: QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT,
      allowedTypes: selectedTypes
    }, test.examId);
  }, [selectedTypes, test.examId]);

  const handleSaveQuestionTypes = () => {
    if (isLocked) return;
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      cbtTestService.updateFacultyTestQuestionTypeConfig(test.id, {
        allowedTypes: selectedTypes
      }, currentFaculty);
      setSaveSuccess('Test-level Question Types updated successfully.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save question type configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    try {
      const config = cbtTestService.getFacultyTestQuestionTypeConfig(test.id, currentFaculty);
      setSelectedTypes(config.allowedTypes || []);
      setSaveSuccess('');
      setSaveError('');
    } catch {
      setSelectedTypes([...DEFAULT_TEST_ALLOWED_QUESTION_TYPES]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Breadcrumb & ID */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/faculty/tests" className="hover:text-indigo-600 transition-colors">Faculty Assessments</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/faculty/tests/${test.id}`} className="hover:text-indigo-600 transition-colors truncate max-w-xs">{test.name || test.title}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800">Phase 3: Content</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">ID: {test.id}</span>
      </div>

      {/* Top 6-Phase Navigation */}
      <FacultyTestConfigurationNav currentStep={3} testId={test.id} />

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
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                Phase 3: Content
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {test.name || test.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  {exam?.name || test.course || test.examId}
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
              to={`/faculty/tests/${test.id}`}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Full-Width Phase 3 Workspace: Content */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Phase 3 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Phase 3: Content
              </h2>
              <p className="text-xs text-slate-500">
                Question Types &amp; Question Bank
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 self-start sm:self-center">
            {attachedQuestionIds.length} Questions Attached
          </span>
        </div>
          {/* Content Sub-Phase Tabs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-2xs flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'types' })}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'types'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>1. Question Type System</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'types' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                {selectedTypes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'assembly' })}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'assembly'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>2. Question Assembly & Bank</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'assembly' ? 'bg-indigo-700 text-indigo-100' : 'bg-emerald-100 text-emerald-800'}`}>
                {attachedQuestionIds.length} Qs
              </span>
            </button>
          </div>

          {/* TAB 1: QUESTION TYPES */}
          {activeTab === 'types' && (
            <div className="space-y-6">
              {/* Test-Level Formats Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900">
                        Permitted Question Formats
                      </h2>
                      <p className="text-xs text-slate-500">
                        Restricts questions eligible for candidate delivery across this assessment.
                      </p>
                    </div>
                  </div>

                  {!isLocked && (
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveQuestionTypes}
                        disabled={isSaving || !qtValidation.valid}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isSaving ? 'Saving...' : 'Save Permitted Types'}
                      </button>
                    </div>
                  )}
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {saveSuccess}
                  </div>
                )}

                {saveError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    {saveError}
                  </div>
                )}

                {/* Question Type Selector */}
                <QuestionTypeSelector
                  selectedTypeIds={selectedTypes}
                  onChange={setSelectedTypes}
                  readOnly={isLocked}
                  availableTypeIds={examSupported}
                  showDetails={true}
                />
              </div>

              {/* Section Question Types Overview */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Section Question Types & Inheritance
                      </h3>
                      <p className="text-xs text-slate-500">
                        Sections default to inheriting Test types or can restrict to a subset of permitted types.
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/faculty/tests/${test.id}/structure`}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Open Structure Builder
                  </Link>
                </div>

                {units.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    No sections defined yet. Add units in Phase 2: Structure to configure section-level question types.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {units.map((unit, uIdx) => {
                      const qtInfo = cbtTestService.getFacultyUnitQuestionTypes(test.id, unit.id, currentFaculty);
                      const isInheriting = qtInfo.mode === QUESTION_TYPE_INHERITANCE_MODES.INHERIT;

                      return (
                        <div
                          key={unit.id || uIdx}
                          className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {unit.name}
                              </span>
                              {unit.code && (
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                                  {unit.code}
                                </span>
                              )}
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                isInheriting 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}>
                                {isInheriting ? 'Inheriting Test Types' : 'Custom Section Types'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {qtInfo.effectiveTypes.map(tId => {
                                const def = questionTypeService.getQuestionTypeById(tId);
                                return (
                                  <span
                                    key={tId}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${def?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                                  >
                                    {def?.shortName || tId}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setConfiguringUnit(unit)}
                            className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 self-start sm:self-center shrink-0 shadow-2xs"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            Configure Section
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: QUESTION ASSEMBLY & BANK */}
          {activeTab === 'assembly' && (
            <div className="space-y-6">
              {/* Question Assembly Workspace */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900">
                        Question Assembly Roster
                      </h2>
                      <p className="text-xs text-slate-500">
                        Assemble and sequence clinical vignettes from the Question Bank scoped to {exam?.name || test.examId}.
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/faculty/tests/${test.id}/questions`}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-center"
                  >
                    <span>Full-Screen Question Workspace</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Validation Banner */}
                {contentValidation.warnings?.length > 0 && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Content Notification</div>
                      <div className="text-[11px] mt-0.5">{contentValidation.warnings[0]}</div>
                    </div>
                  </div>
                )}

                {/* Split Panels: Available Bank Items + Selected Roster */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-6 space-y-4">
                    <QuestionBankBrowser
                      test={test}
                      selectedQuestionIds={attachedQuestionIds}
                      onAddQuestion={(qId) => {
                        if (!canEdit) return;
                        try {
                          cbtTestService.addQuestionToFacultyTest(test.id, qId, currentFaculty);
                          setSaveSuccess('Question added to test roster.');
                          setTimeout(() => setSaveSuccess(''), 3000);
                        } catch (err) {
                          setSaveError(err.message || 'Failed to add question.');
                          setTimeout(() => setSaveError(''), 4000);
                        }
                      }}
                      onAddQuestions={(qIds) => {
                        if (!canEdit) return;
                        try {
                          cbtTestService.addQuestionsToFacultyTest(test.id, qIds, currentFaculty);
                          setSaveSuccess(`${qIds.length} questions added to test roster.`);
                          setTimeout(() => setSaveSuccess(''), 3000);
                        } catch (err) {
                          setSaveError(err.message || 'Failed to add questions.');
                          setTimeout(() => setSaveError(''), 4000);
                        }
                      }}
                      onPreviewQuestion={setPreviewingQuestion}
                      role="faculty"
                      requestingFaculty={currentFaculty}
                      isLocked={!canEdit}
                      authorLink={`/faculty/tests/${test.id}/questions/create`}
                    />
                  </div>

                  <div className="lg:col-span-6 space-y-4">
                    <SelectedQuestionsPanel
                      test={test}
                      questionIds={attachedQuestionIds}
                      onRemoveQuestion={(qId) => {
                        if (!canEdit) return;
                        try {
                          cbtTestService.removeQuestionFromFacultyTest(test.id, qId, currentFaculty);
                          setSaveSuccess('Question removed from test roster.');
                          setTimeout(() => setSaveSuccess(''), 3000);
                        } catch (err) {
                          setSaveError(err.message || 'Failed to remove question.');
                          setTimeout(() => setSaveError(''), 4000);
                        }
                      }}
                      onReorderQuestions={(qIds) => {
                        if (!canEdit) return;
                        try {
                          cbtTestService.reorderFacultyTestQuestions(test.id, qIds, currentFaculty);
                        } catch (err) {
                          setSaveError(err.message || 'Failed to reorder questions.');
                          setTimeout(() => setSaveError(''), 4000);
                        }
                      }}
                      onPreviewQuestion={setPreviewingQuestion}
                      isLocked={!canEdit}
                      validation={contentValidation}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Phase Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Link
            to={`/faculty/tests/${test.id}/structure`}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous: Structure</span>
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

      {/* Section Configuration Modal */}
      {configuringUnit && (
        <SectionConfigurationModal
          isOpen={Boolean(configuringUnit)}
          onClose={() => setConfiguringUnit(null)}
          unit={configuringUnit}
          examId={test.examId}
          testAllowedQuestionTypes={selectedTypes}
          onSave={({ configurationUpdates }) => {
            try {
              cbtTestService.updateFacultyTestUnitConfiguration(
                test.id, 
                configuringUnit.id, 
                configurationUpdates, 
                currentFaculty
              );
              setConfiguringUnit(null);
              setSaveSuccess(`Section "${configuringUnit.name}" updated successfully.`);
              setTimeout(() => setSaveSuccess(''), 3500);
            } catch (err) {
              setSaveError(err.message || 'Failed to update section.');
            }
          }}
          readOnly={isLocked}
        />
      )}
      {/* Question Preview Modal */}
      <QuestionPreviewModal
        isOpen={Boolean(previewingQuestion)}
        onClose={() => setPreviewingQuestion(null)}
        question={previewingQuestion}
      />
    </div>
  );
}
