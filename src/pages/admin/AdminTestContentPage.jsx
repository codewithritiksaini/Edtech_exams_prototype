import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  HelpCircle, 
  Layers, 
  AlertCircle, 
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
  adminTestService, 
  TEST_STATUS, 
  getTestTypeLabel,
  getAssessmentMethodLabel,
  getAssessmentMethodBadgeClass 
} from '../../services/adminTestService.js';
import { catalogService } from '../../services/catalogService.js';
import { 
  questionTypeService, 
  QUESTION_TYPE_INHERITANCE_MODES, 
  DEFAULT_TEST_ALLOWED_QUESTION_TYPES 
} from '../../services/questionTypeService.js';
import TestStatusBadge from '../../components/admin/tests/TestStatusBadge.jsx';
import TestConfigurationStepper from '../../components/admin/tests/TestConfigurationStepper.jsx';
import ExamPatternPreview from '../../components/common/ExamPatternPreview.jsx';
import QuestionTypeSelector from '../../components/common/QuestionTypeSelector.jsx';
import SectionConfigurationModal from '../../components/common/SectionConfigurationModal.jsx';
import QuestionBankBrowser from '../../components/common/QuestionBankBrowser.jsx';
import SelectedQuestionsPanel from '../../components/common/SelectedQuestionsPanel.jsx';
import QuestionPreviewModal from '../../components/common/QuestionPreviewModal.jsx';

export default function AdminTestContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: 'types' or 'bank'
  const activeTab = searchParams.get('tab') || 'types';

  const [test, setTest] = useState(() => adminTestService.getTest(id));
  const [selectedTypes, setSelectedTypes] = useState(() => {
    if (!test) return [];
    try {
      const config = adminTestService.getAdminTestQuestionTypeConfig(id);
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
    const unsub = adminTestService.subscribe(() => {
      const updated = adminTestService.getTest(id);
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
          <h2 className="text-lg font-bold text-slate-900">Admin Test Not Found</h2>
          <p className="text-xs text-slate-500">
            The requested Test entity with ID &quot;{id}&quot; does not exist or has been removed.
          </p>
          <Link
            to="/admin/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Tests
          </Link>
        </div>
      </div>
    );
  }

  const exam = catalogService.getExamById(test.examId);
  const isLocked = ![TEST_STATUS.DRAFT, TEST_STATUS.CONFIGURING].includes(test.status);
  const structure = test.structure || adminTestService.getAdminTestStructure(test.id);
  const units = structure?.units || [];
  const examSupported = questionTypeService.getExamSupportedQuestionTypes(test.examId);

  const validation = useMemo(() => {
    return questionTypeService.validateTestQuestionTypeConfig({
      mode: QUESTION_TYPE_INHERITANCE_MODES.EXPLICIT,
      allowedTypes: selectedTypes
    }, test.examId);
  }, [selectedTypes, test.examId]);

  const attachedQuestionIds = useMemo(() => {
    return Array.isArray(test.content?.questionIds)
      ? test.content.questionIds
      : (Array.isArray(test.questionIds) ? test.questionIds : []);
  }, [test]);

  const contentValidation = useMemo(() => {
    try {
      return adminTestService.validateAdminTestContent(test.id);
    } catch {
      return { valid: true, questionCount: attachedQuestionIds.length, errors: [], warnings: [] };
    }
  }, [test, attachedQuestionIds]);

  const handleAddQuestion = (qId) => {
    if (isLocked) return;
    try {
      adminTestService.addQuestionToAdminTest(test.id, qId);
      setSaveSuccess('Question added to test roster.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to add question.');
      setTimeout(() => setSaveError(''), 4000);
    }
  };

  const handleAddQuestions = (qIds) => {
    if (isLocked) return;
    try {
      adminTestService.addQuestionsToAdminTest(test.id, qIds);
      setSaveSuccess(`${qIds.length} questions added to test roster.`);
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to add questions.');
      setTimeout(() => setSaveError(''), 4000);
    }
  };

  const handleRemoveQuestion = (qId) => {
    if (isLocked) return;
    try {
      adminTestService.removeQuestionFromAdminTest(test.id, qId);
      setSaveSuccess('Question removed from test roster.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to remove question.');
      setTimeout(() => setSaveError(''), 4000);
    }
  };

  const handleReorderQuestions = (orderedIds) => {
    if (isLocked) return;
    try {
      adminTestService.reorderAdminTestQuestions(test.id, orderedIds);
    } catch (err) {
      setSaveError(err.message || 'Failed to reorder questions.');
      setTimeout(() => setSaveError(''), 4000);
    }
  };

  const handleSaveQuestionTypes = () => {
    if (isLocked) return;
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      adminTestService.updateAdminTestQuestionTypeConfig(test.id, {
        allowedTypes: selectedTypes
      });
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
      const config = adminTestService.getAdminTestQuestionTypeConfig(test.id);
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
          <Link to="/admin/tests" className="hover:text-indigo-600 transition-colors">Test Management</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={`/admin/tests/${test.id}`} className="hover:text-indigo-600 transition-colors truncate max-w-xs">{test.name}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800">Phase 3: Content</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">ID: {test.id}</span>
      </div>

      {/* Top 6-Phase Navigation */}
      <TestConfigurationStepper currentStep={3} testId={test.id} role="admin" />

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
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                Phase 3: Content
              </span>
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
              onClick={() => setSearchParams({ tab: 'bank' })}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'bank'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>2. Question Bank</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'bank' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                {attachedQuestionIds.length}
              </span>
            </button>
          </div>

          {/* TAB 1: QUESTION TYPES */}
          {activeTab === 'types' && (
            <div className="space-y-6">
              {/* Test-Level Supported Formats Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900">
                        Test-Level Permitted Question Types
                      </h2>
                      <p className="text-xs text-slate-500">
                        Candidates will only receive questions matching these formats across this Test.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
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
                        disabled={isSaving || !validation.valid}
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

                {/* Question Type Selector Component */}
                <QuestionTypeSelector
                  selectedTypeIds={selectedTypes}
                  onChange={setSelectedTypes}
                  readOnly={isLocked}
                  availableTypeIds={examSupported}
                  showDetails={true}
                />
              </div>

              {/* Section-Level Question Types Overview Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Section-Level Question Types
                      </h3>
                      <p className="text-xs text-slate-500">
                        Sections default to inheriting Test types or can restrict to a subset of permitted types.
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/admin/tests/${test.id}/structure`}
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
                      const qtInfo = adminTestService.getAdminUnitQuestionTypes(test.id, unit.id);
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

          {/* TAB 2: QUESTION BANK */}
          {activeTab === 'bank' && (
            <div className="space-y-6">
              {/* Question Assembly Workspace Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900">
                        Question Assembly & Item Bank
                      </h2>
                      <p className="text-xs text-slate-500">
                        Assemble and sequence clinical vignettes from the Question Bank scoped to {exam?.name || test.examId}.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/questions"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-center"
                  >
                    <span>Full Question Repository</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Notifications & Feedback */}
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

                {/* Split Panels: Available Bank Items + Selected Roster */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-6 space-y-4">
                    <QuestionBankBrowser
                      test={test}
                      selectedQuestionIds={attachedQuestionIds}
                      onAddQuestion={handleAddQuestion}
                      onAddQuestions={handleAddQuestions}
                      onPreviewQuestion={setPreviewingQuestion}
                      role="admin"
                      isLocked={isLocked}
                      authorLink="/questions/create"
                    />
                  </div>

                  <div className="lg:col-span-6 space-y-4">
                    <SelectedQuestionsPanel
                      test={test}
                      questionIds={attachedQuestionIds}
                      onRemoveQuestion={handleRemoveQuestion}
                      onReorderQuestions={handleReorderQuestions}
                      onPreviewQuestion={setPreviewingQuestion}
                      isLocked={isLocked}
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
            to={`/admin/tests/${test.id}/structure`}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous: Structure</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={`/admin/tests/${test.id}/rules`}
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
              adminTestService.updateAdminTestUnitConfiguration(test.id, configuringUnit.id, configurationUpdates);
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
